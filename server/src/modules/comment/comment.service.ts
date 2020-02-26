import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SMTPService } from '../smtp/smtp.service';
import { ArticleService } from '../article/article.service';
import { SettingService } from '../setting/setting.service';
import { UserService } from '../user/user.service';
import { marked } from '../article/markdown.util';
import { Comment } from './comment.entity';

const url = require('url');
const ArticleCommentsCache: { [articleId: string]: Array<Comment> } = {};

/**
 * 扁平接口评论转为树形评论
 * @param list
 */
function buildTree(list) {
  let temp = {};
  let tree = [];

  for (let item of list) {
    temp[item.id] = item;
  }

  for (let i in temp) {
    if (temp[i].parentCommentId) {
      if (temp[temp[i].parentCommentId]) {
        if (!temp[temp[i].parentCommentId].children) {
          temp[temp[i].parentCommentId].children = [];
        }
        temp[temp[i].parentCommentId].children.push(temp[i]);
      } else {
        tree.push(temp[i]); // 父级可能被删除或者未通过，直接升级
      }
    } else {
      tree.push(temp[i]);
    }
  }

  return tree;
}

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly articleService: ArticleService,
    private readonly smtpService: SMTPService,
    private readonly settingService: SettingService,
    private readonly userService: UserService
  ) {}

  /**
   * 创建评论
   * @param comment
   */
  async create(
    comment: Partial<Comment> & { reply?: string }
  ): Promise<Comment> {
    const { articleId, name, email, content, reply, isInPage } = comment;

    if (!articleId || !name || !email || !content) {
      throw new HttpException('缺失参数', HttpStatus.BAD_REQUEST);
    }

    const { html } = marked(content);
    comment.html = html;
    comment.pass = false;
    const newComment = await this.commentRepository.create(comment);
    await this.commentRepository.save(newComment);

    // 发送通知邮件
    const { smtpFromUser: from, systemUrl } = await this.settingService.findAll(
      true
    );

    const sendEmail = (to, isReply = false) => {
      const emailMessage = {
        from,
        to,
        ...(isReply
          ? {
              subject: '评论回复通知',
              html: `
          <div style="box-sizing: border-box; width: 100%; padding: 15px; background: rgb(246, 246, 246);">
            <div style="box-sizing: border-box; width: 100%; background: '#fff;">
              <p style="color: #009a61; ">您的评论已被回复，点击链接前往查看：</p>
              <div>
                <p><a href="${url.resolve(
                  systemUrl,
                  `/${isInPage ? 'page' : 'article'}/` + articleId
                )}">${url.resolve(
                systemUrl,
                `/${isInPage ? 'page' : 'article'}/` + articleId
              )}</a></p>
              </div>
            </div>
          </div>
        `,
            }
          : {
              subject: '新评论通知',
              html: `
          <div style="box-sizing: border-box; width: 100%; padding: 16px; background: rgb(246, 246, 246);">
            <div style="box-sizing: border-box; width: 100%; background: '#fff;">
              <p>评论人：${comment.name}</p>
              <p>评论内容：${comment.content}</p>
              <p><a href="${url.resolve(
                systemUrl,
                'admin/comment'
              )}" target="_blank">前往审核</a></p>
            </div>
          </div>
        `,
            }),
      };

      this.smtpService.create(emailMessage).catch(() => {
        console.log('收到新评论，但发送邮件通知失败');
      });
    };

    // 回复邮件
    !!reply && sendEmail(reply, true);
    // 向所有管理员发送邮件通知
    const [users] = await this.userService.findAll({ role: 'admin' });
    users.forEach(user => {
      if (user.email) {
        sendEmail(user.email);
      }
    });

    return newComment;
  }

  /**
   * 查询所有评论
   * 额外添加文章信息
   */
  async findAll(queryParams: any = {}): Promise<[Comment[], number]> {
    const query = this.commentRepository
      .createQueryBuilder('comment')
      .orderBy('comment.createAt', 'DESC');

    const { page = 1, pageSize = 12, pass, ...otherParams } = queryParams;

    query.skip((+page - 1) * +pageSize);
    query.take(+pageSize);

    if (pass) {
      query.andWhere('comment.pass=:pass').setParameter('pass', pass);
    }

    if (otherParams) {
      Object.keys(otherParams).forEach(key => {
        query
          .andWhere(`comment.${key} LIKE :${key}`)
          .setParameter(`${key}`, `%${otherParams[key]}%`);
      });
    }

    return query.getManyAndCount();
  }

  /**
   * 获取指定评论
   * @param id
   */
  async findById(id): Promise<Comment> {
    return this.commentRepository.findOne(id);
  }

  /**
   * 获取文章评论
   * @param articleId
   */
  async getArticleComments(articleId, queryParams) {
    // let data = [];

    // if (ArticleCommentsCache[articleId]) {
    //   data = ArticleCommentsCache[articleId];
    // } else {
    //   const query = this.commentRepository
    //     .createQueryBuilder('comment')
    //     .where('comment.articleId=:articleId')
    //     .andWhere('comment.pass=:pass')
    //     .orderBy('comment.createAt', 'ASC')
    //     .setParameter('articleId', articleId)
    //     .setParameter('pass', true);
    //   const res = await query.getManyAndCount();
    //   data = buildTree(res[0]);
    //   ArticleCommentsCache[articleId] = data;
    // }

    // const { page = 1, pageSize = 12 } = queryParams;
    // return [data.slice((page - 1) * pageSize, page * pageSize), data.length];

    const query = this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.articleId=:articleId')
      .andWhere('comment.pass=:pass')
      .orderBy('comment.createAt', 'ASC')
      .setParameter('articleId', articleId)
      .setParameter('pass', true);

    const { page = 1, pageSize = 12 } = queryParams;
    query.skip((+page - 1) * +pageSize);
    query.take(+pageSize);

    const res = await query.getManyAndCount();

    for (let comment of res[0]) {
      if (comment.parentCommentId) {
        const parentComment = await this.commentRepository.findOne(
          comment.parentCommentId
        );
        Object.assign(comment, { parentComment });
      }
    }

    return res;
  }

  async findByIds(ids): Promise<Array<Comment>> {
    return this.commentRepository.findByIds(ids);
  }

  /**
   * 更新评论
   * @param id
   * @param tag
   */
  async updateById(id, data: Partial<Comment>): Promise<Comment> {
    const old = await this.commentRepository.findOne(id);
    const newData = await this.commentRepository.merge(old, data);
    return this.commentRepository.save(newData);
  }

  async deleteById(id) {
    const tag = await this.commentRepository.findOne(id);
    return this.commentRepository.remove(tag);
  }
}
