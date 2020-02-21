import React from "react";
import { List, Row, Col } from "antd";
import Link from "next/link";
import LazyLoad from "react-lazyload";
import cls from "classnames";
import * as dayjs from "dayjs";
import style from "./index.module.scss";

interface IProps {
  articles: IArticle[];
}

export const ArticleList: React.FC<IProps> = ({ articles = [] }) => {
  return (
    <Row gutter={16}>
      {articles && articles.length
        ? articles.map(article => {
            return (
              <Col className={style.articleListItem} xs={24} sm={8} md={8}>
                <div>
                  <Link href={`/article/[id]`} as={`/article/${article.id}`}>
                    <a>
                      {article.cover && (
                        <LazyLoad height={180}>
                          <div className={style.imgWrapper}>
                            <img src={article.cover} alt="cover" />
                          </div>
                        </LazyLoad>
                      )}
                      <div className={style.info}>
                        <p className={style.title}>{article.title}</p>
                        <p className={style.desc}>{article.summary}</p>
                        <p className={style.meta}>
                          {dayjs
                            .default(article.publishAt)
                            .format("YYYY-MM-DD HH:mm:ss")}
                        </p>
                      </div>
                    </a>
                  </Link>
                </div>
              </Col>
            );
          })
        : null}
    </Row>

    // <List
    //   className={style.listContainer}
    //   grid={{
    //     gutter: 16,
    //     xs: 1,
    //     sm: 2,
    //     md: 2,
    //     lg: 3,
    //     xl: 3,
    //     xxl: 4
    //   }}
    //   dataSource={articles}
    //   pagination={articles && articles.length > 12 ? { pageSize: 12 } : false}
    //   locale={{
    //     emptyText: "暂无数据"
    //   }}
    //   renderItem={article => (
    //     <List.Item className={style.articleListItem}>
    //       <div>
    //         <Link href={`/article/[id]`} as={`/article/${article.id}`}>
    //           <a>
    //             {article.cover && (
    //               <LazyLoad height={180}>
    //                 <img src={article.cover} alt="cover" />
    //               </LazyLoad>
    //             )}
    //             <div className={style.info}>
    //               <p className={style.title}>{article.title}</p>
    //               <p className={style.desc}>{article.summary}</p>
    //               <p className={style.meta}>
    //                 {dayjs
    //                   .default(article.publishAt)
    //                   .format("YYYY-MM-DD HH:mm:ss")}
    //               </p>
    //             </div>
    //           </a>
    //         </Link>
    //       </div>
    //     </List.Item>
    //   )}
    // />
  );
};
