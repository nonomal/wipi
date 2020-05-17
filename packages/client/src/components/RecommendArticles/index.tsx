import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from 'antd';
import { ArticleProvider } from '@providers/article';
import { ArticleList } from '@components/ArticleList';
import { format } from 'timeago.js';
import style from './index.module.scss';

interface IProps {
  articleId?: string;
  mode?: 'inline' | 'vertical';
  needTitle?: boolean;
  asCard?: boolean;
}

export const RecommendArticles: React.FC<IProps> = ({
  mode = 'vertical',
  articleId = null,
  needTitle = true,
  asCard = false,
}) => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    ArticleProvider.getRecommend(articleId).then((res) => {
      setArticles(res);
    });
  }, [articleId]);

  return (
    <div className={style.wrapper}>
      {needTitle && (
        <div className={style.title}>
          <Icon type="file-text" />
          <span>推荐</span>
        </div>
      )}
      {mode === 'inline' ? (
        <ul>
          {(articles || []).map((article) => {
            return (
              <li key={article.id}>
                <div>
                  <Link
                    href={`/article/[id]`}
                    as={`/article/${article.id}`}
                    scroll={false}
                  >
                    <a>
                      <p className={style.articleTitle}>
                        <span>{article.title}</span>
                        {' · '}
                        <span>{format(article.publishAt, 'zh_CN')}</span>
                      </p>
                    </a>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <ArticleList articles={articles || []} asCard={asCard} />
      )}
    </div>
  );
};
