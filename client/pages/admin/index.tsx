import React from "react";
import { NextPage } from "next";
import Link from "next/link";
import { Row, Col, Statistic, List, Card } from "antd";
import { AdminLayout } from "@/layout/AdminLayout";
import { SearchKeyWordChart } from "@components/admin/SearchKeyWordChart";
import { ArticleProvider } from "@providers/article";
import { CommentProvider } from "@providers/comment";
import { TagProvider } from "@/providers/tag";
import { FileProvider } from "@/providers/file";
import style from "./index.module.scss";

interface IHomeProps {
  articles: IArticle[];
  articlesCount: number;
  tags: ITag[];
  files: IFile[];
  filesCount: number;
  comments: IComment[];
  commentsCount: number;
}

const Home: NextPage<IHomeProps> = ({
  articles = [],
  articlesCount = 0,
  tags = [],
  files = [],
  filesCount = 0,
  comments = [],
  commentsCount = 0
}) => {
  return (
    <AdminLayout background="transparent" padding={0}>
      <Row gutter={16}>
        <Col xs={12} sm={6}>
          <Statistic
            className={style.listItem}
            title="文章数量"
            value={articlesCount}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            className={style.listItem}
            title="标签数量"
            value={tags.length}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            className={style.listItem}
            title="评论数量"
            value={commentsCount}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            className={style.listItem}
            title="文件数量"
            value={filesCount}
          />
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Card title="搜索关键词" bordered={false}>
          <SearchKeyWordChart />
        </Card>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} sm={14}>
          <Card title="最新文章" bordered={false}>
            <List
              itemLayout="horizontal"
              dataSource={articles.slice(0, 5)}
              renderItem={article => (
                <List.Item
                  extra={
                    article.cover ? (
                      <img width={120} alt="logo" src={article.cover} />
                    ) : null
                  }
                >
                  <List.Item.Meta
                    title={
                      <Link
                        href={`/admin/article/editor/[id]`}
                        as={`/admin/article/editor/` + article.id}
                      >
                        <a>{article.title}</a>
                      </Link>
                    }
                    description={article.summary}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} sm={10}>
          <Card title="最新评论" bordered={false}>
            <List
              className={style.comments}
              itemLayout="horizontal"
              dataSource={comments.slice(0, 5)}
              renderItem={comment => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Link href={`/admin/comment/`}>
                        <a>
                          {comment.name} - {comment.email}
                        </a>
                      </Link>
                    }
                    description={comment.content}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
};

Home.getInitialProps = async () => {
  const [articles, tags, files, comments] = await Promise.all([
    ArticleProvider.getArticles({ page: 1, pageSize: 6 }),
    TagProvider.getTags(),
    FileProvider.getFiles({ page: 1, pageSize: 6 }),
    CommentProvider.getComments({ page: 1, pageSize: 6 })
  ]);

  return {
    articles: articles[0],
    articlesCount: articles[1],
    tags,
    files: files[0],
    filesCount: files[1],
    comments: comments[0],
    commentsCount: comments[1]
  };
};

export default Home;
