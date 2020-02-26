import React, { useState, useEffect, useCallback } from "react";
import { Button, Icon, Avatar } from "antd";
import { format } from "timeago.js";
import cls from "classnames";
import { CommentProvider } from "@providers/comment";
import { Editor } from "./Editor";
import style from "./index.module.scss";

const colors = [
  "#52c41a",
  "#f5222d",
  "#1890ff",
  "#faad14",
  "#ff0064",
  "#722ed1"
];
const getRandomColor = (() => {
  let cache = {};

  return (key): string => {
    if (!cache[key]) {
      let color = colors[Math.floor(Math.random() * colors.length)];
      cache[key] = color;
      return color;
    } else {
      return cache[key];
    }
  };
})();

export const CommentItem = ({ comment, parentComment, onReply = d => d }) => {
  return (
    <div className={style.commentItem}>
      <div className={style.avatar}>
        <Avatar
          size={32}
          shape="square"
          style={{ backgroundColor: getRandomColor(comment.name) }}
        >
          {("" + comment.name).charAt(0).toUpperCase()}
        </Avatar>
      </div>
      <header>
        <div className={style.commentTitle}>
          <strong>{comment.name}</strong>
          {parentComment ? (
            <>
              {" reply "}
              <strong>{parentComment.name}</strong>
            </>
          ) : null}
          {"  "}
          <span>{format(comment.createAt, "zh_CN")}</span>
        </div>

        <div>
          <span onClick={() => onReply(comment)}>
            <Icon type="message" />
            回复
          </span>
        </div>
      </header>
      <main>
        <div
          className={cls("markdown")}
          dangerouslySetInnerHTML={{ __html: comment.html }}
        ></div>
      </main>
    </div>
  );
};

interface IProps {
  articleId: string;
  isInPage?: boolean;
}

export const MyComment: React.FC<IProps> = ({
  articleId,
  isInPage = false
}) => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyComment, setReplyComment] = useState(null);

  const getComments = useCallback(
    (page, pageSize) => {
      setLoading(true);
      CommentProvider.getArticleComments(articleId, {
        page,
        pageSize
      })
        .then(res => {
          setLoading(false);
          setComments(comments => [...comments, ...res[0]]);
          setTotal(res[1]);
        })
        .catch(err => {
          setLoading(false);
        });
    },
    [articleId]
  );

  const loadMore = () => {
    setPage(page + 1);
    getComments(page + 1, pageSize);
  };

  useEffect(() => {
    getComments(page, pageSize);
  }, [articleId]);

  return (
    <div className={style.commentWrapper}>
      <div className={style.commentContainer}>
        {comments.map(comment => {
          return (
            <CommentItem
              key={comment.id}
              comment={comment}
              parentComment={comment.parentComment}
              onReply={comment => {
                setReplyComment(comment);
              }}
            />
          );
        })}
      </div>
      <div className={style.pagination}>
        {page * pageSize < total ? (
          <Button
            type="primary"
            onClick={loadMore}
            disabled={loading}
            loading={loading}
          >
            加载更多
          </Button>
        ) : (
          <span>共 {total} 条</span>
        )}
      </div>
      <Editor
        articleId={articleId}
        isInPage={isInPage}
        parentComment={replyComment}
        onSuccess={() => setReplyComment(null)}
      />
    </div>
  );
};
