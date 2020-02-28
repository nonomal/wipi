import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';

@Controller('comment')
@UseGuards(RolesGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 创建评论
   * @param comment
   */
  @Post()
  create(@Request() req, @Body() comment) {
    const userAgent = req.headers['user-agent'];
    return this.commentService.create(userAgent, comment);
  }

  /**
   * 获取所有评论
   */
  @Get()
  findAll(@Query() queryParams) {
    return this.commentService.findAll(queryParams);
  }

  /**
   * 获取指定评论
   * @param id
   */
  @Get(':id')
  findById(@Param('id') id) {
    return this.commentService.findById(id);
  }

  /**
   * 获取文章评论
   * @param articleId
   */
  @Get('article/:articleId')
  getArticleComments(@Param('articleId') articleId, @Query() qurey) {
    return this.commentService.getArticleComments(articleId, qurey);
  }

  /**
   * 更新评论
   * @param id
   * @param tag
   */
  @Patch(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  updateById(@Param('id') id, @Body() data) {
    return this.commentService.updateById(id, data);
  }

  /**
   * 删除评论
   * @param id
   */
  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  deleteById(@Param('id') id) {
    return this.commentService.deleteById(id);
  }
}
