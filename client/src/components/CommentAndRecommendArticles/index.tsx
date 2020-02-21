import React from "react";
import { NextPage } from "next";
import "highlight.js/styles/atelier-dune-dark.css";
import { MyComment } from "@/components/Comment";
import { RecommendArticles } from "@components/RecommendArticles";
import style from "./index.module.scss";

interface IProps {
  article: IArticle;
}

export const CommentAndRecommendArticles: NextPage<IProps> = ({ article }) => {
  return (
    <div className={style.wrapper}>
      {/* S 评论 */}
      {article.isCommentable && (
        <div className={style.comments}>
          <p className={style.title}>评论</p>
          <div className={style.commentContainer}>
            <MyComment articleId={article.id} />
          </div>
        </div>
      )}
      {/* E 评论 */}

      {/* S 推荐阅读 */}
      <div className={style.recmmendArticles}>
        <p className={style.title}>推荐阅读</p>
        <RecommendArticles />
      </div>
      {/* E 推荐阅读 */}
    </div>
  );
};
