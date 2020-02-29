import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArticleProvider } from "@providers/article";
import { ArticleList } from "@components/ArticleList";
import { format } from "timeago.js";
import style from "./index.module.scss";

interface IProps {
  articleId?: string;
  mode?: "inline" | "vertical";
  needTitle?: boolean;
  asCard?: boolean;
}

let cache = null;

function isEqual(a, b) {
  if (a.length === 0 && b.lenth === 0) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  return a.every((c, i) => c === b[i]);
}

export const RecommendArticles: React.FC<IProps> = ({
  mode = "vertical",
  articleId = null,
  needTitle = true,
  asCard = false
}) => {
  const articles = useRef(cache);
  const [, setUpdate] = useState(false);

  useEffect(() => {
    ArticleProvider.getRecommend(articleId).then(res => {
      const isSame = isEqual(
        (res || []).map(t => t.id),
        (cache || []).map(t => t.id)
      );

      if (isSame) {
        return;
      }

      articles.current = res;
      cache = res;
      setUpdate(true);
    });
  }, [articleId, cache]);

  return (
    <div className={style.wrapper}>
      {needTitle && <div className={style.title}>推荐文章</div>}
      {mode === "inline" ? (
        <ul>
          {(articles.current || []).map(article => {
            return (
              <li key={article.id}>
                <div>
                  <Link href={`/article/[id]`} as={`/article/${article.id}`}>
                    <a>
                      <p className={style.articleTitle}>
                        <strong>{article.title}</strong>
                        {" · "}
                        <span>{format(article.publishAt, "zh_CN")}</span>
                      </p>
                    </a>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <ArticleList articles={articles.current || []} asCard={asCard} />
      )}
    </div>
  );
};
