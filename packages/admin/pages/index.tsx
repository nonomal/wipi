import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Row, Col, Icon, Table, Badge, Tag } from 'antd';
import * as dayjs from 'dayjs';
import { AdminLayout } from '@/layout/AdminLayout';
import { ArticleProvider } from '@providers/article';
import { CommentProvider } from '@providers/comment';
import { TagProvider } from '@/providers/tag';
import { FileProvider } from '@/providers/file';
import style from './index.module.scss';

interface IHomeProps {
  articles: IArticle[];
  articlesCount: number;
  tags: ITag[];
  files: IFile[];
  filesCount: number;
  comments: IComment[];
  commentsCount: number;
}

const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    render: (text, record) => (
      <Link href={`/article/[id]`} as={`/article/${record.id}`}>
        <a target="_blank">{text}</a>
      </Link>
    ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: status => {
      const isDraft = status === 'draft';
      return (
        <Badge
          color={isDraft ? 'gold' : 'green'}
          text={isDraft ? '草稿' : '已发布'}
        />
      );
    },
  },
  {
    title: '分类',
    key: 'category',
    dataIndex: 'category',
    render: category =>
      category ? (
        <span>
          <Tag color={'magenta'} key={category.value}>
            {category.label}
          </Tag>
        </span>
      ) : null,
  },
  {
    title: '标签',
    key: 'tags',
    dataIndex: 'tags',
    render: tags => (
      <span>
        {tags.map(tag => {
          let color = tag.label.length > 2 ? 'geekblue' : 'green';
          if (tag === 'loser') {
            color = 'volcano';
          }
          return (
            <Tag color={color} key={tag.label}>
              {tag.label}
            </Tag>
          );
        })}
      </span>
    ),
  },
  {
    title: '阅读量',
    dataIndex: 'views',
    key: 'views',
    render: views => (
      <Badge
        count={views}
        showZero={true}
        overflowCount={Infinity}
        style={{ backgroundColor: '#52c41a' }}
      />
    ),
  },
  {
    title: '发布时间',
    dataIndex: 'publishAt',
    key: 'publishAt',
    render: date => dayjs.default(date).format('YYYY-MM-DD HH:mm:ss'),
  },
];

const Home: NextPage<IHomeProps> = ({
  articles = [],
  articlesCount = 0,
  tags = [],
  files = [],
  filesCount = 0,
  comments = [],
  commentsCount = 0,
}) => {
  return (
    <AdminLayout background="transparent" padding={0}>
      <div className={style.recentArticle}>
        <div className={style.title}>
          <span>最新文章</span>
          <span>
            <Link href="/article">
              <a>
                <span>更多</span>
                <Icon type="right" />
              </a>
            </Link>
          </span>
        </div>
        <Row gutter={16}>
          {articles.slice(0, 4).map(article => {
            return (
              <Col span={24 / 4} className={style.recentArticleItem}>
                <Link
                  href={`/article/editor/[id]`}
                  as={`/article/editor/` + article.id}
                >
                  <a>
                    <img width={120} alt="文章封面" src={article.cover} />
                    <p className={style.title}>{article.title}</p>
                    <p className={style.desc}>{article.summary}</p>
                  </a>
                </Link>
              </Col>
            );
          })}
        </Row>
      </div>
      <div className={style.articles}>
        <Table
          dataSource={articles}
          columns={columns}
          pagination={false}
        ></Table>
      </div>
    </AdminLayout>
  );
};

Home.getInitialProps = async () => {
  const [articles, tags, files, comments] = await Promise.all([
    ArticleProvider.getArticles({ page: 1, pageSize: 12 }),
    TagProvider.getTags(),
    FileProvider.getFiles({ page: 1, pageSize: 6 }),
    CommentProvider.getComments({ page: 1, pageSize: 6 }),
  ]);

  return {
    articles: articles[0],
    articlesCount: articles[1],
    tags,
    files: files[0],
    filesCount: files[1],
    comments: comments[0],
    commentsCount: comments[1],
  };
};

export default Home;
