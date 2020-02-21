import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArticleProvider } from "@providers/article";
import { ArticleList } from "@components/ArticleList";

let cache = null;

export const RecommendArticles = () => {
  const articles = useRef(cache || []);
  const [, setUpdate] = useState(false);

  useEffect(() => {
    if (cache) {
      return;
    }

    ArticleProvider.getArticles(true).then(res => {
      articles.current = res.slice(0, 6);
      cache = res.slice(0, 6);
      setUpdate(true);
    });
  }, []);

  return (
    <div>
      <ArticleList articles={articles.current} />
    </div>
  );
};
