import React from "react";
import { NextPage } from "next";
import Link from "next/link";
import cls from "classnames";
import { Row, Col, Timeline } from "antd";
import { Layout } from "@/layout/Layout";
import { ArticleProvider } from "@providers/article";
import { RecommendArticles } from "@components/RecommendArticles";
import { Tags } from "@components/Tags";
import style from "./index.module.scss";

interface IProps {
  articles: { [key: string]: IArticle[] };
}

const ArchiveItem = ({ year, articles = [] }) => {
  return (
    <div className={style.item}>
      <p>{year}</p>
      <Timeline>
        {articles.map(article => (
          <Timeline.Item key={article.id}>
            <Link href={`/article/[id]`} as={`/article/${article.id}`}>
              <a>{article.title}</a>
            </Link>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};

const Archives: NextPage<IProps> = ({ articles }) => {
  return (
    <Layout>
      <div className={cls("container", style.container)}>
        <Row>
          <Col sm={16} className={style.main}>
            <div className={style.content}>
              {Object.keys(articles).map(year => {
                return (
                  <ArchiveItem
                    key={year}
                    year={year}
                    articles={articles[year]}
                  />
                );
              })}
            </div>
          </Col>
          <Col sm={8} className={style.aside}>
            <RecommendArticles mode="inline" />
            <Tags />
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

// 服务端预取数据
Archives.getInitialProps = async () => {
  const articles = await ArticleProvider.getArchives();
  return { articles };
};

export default Archives;
