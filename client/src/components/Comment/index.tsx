import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Comment,
  Button,
  Input,
  Icon,
  Pagination,
  message
} from "antd";
import { format } from "timeago.js";
import cls from "classnames";
import { CommentProvider } from "@providers/comment";
import { Editor } from "./Editor";
import style from "./index.module.scss";

const { TextArea } = Input;

interface ICommemtItemProps {
  articleId: string;
  comment: IComment;
  getComments: () => void;
  isInPage?: boolean; // 为 true 时，评论组件在动态页面而非文章
  depth?: number; // 第几层嵌套
  parentComment?: IComment | null; // 父级评论
}

const CommentItem: React.FC<ICommemtItemProps> = ({
  children,
  articleId,
  comment,
  getComments,
  isInPage = false,
  depth = 1,
  parentComment = null
}) => {
  const [isReply, setReply] = useState(false);

  return (
    <Comment
      style={depth > 1 ? { marginLeft: -44 } : {}}
      actions={null}
      author={
        <a>
          <strong>{comment.name}</strong>
          {parentComment ? (
            <>
              {" reply "}
              <strong>{parentComment.name}</strong>
            </>
          ) : null}
          {"  "}
          <span>{format(comment.createAt, "zh_CN")}</span>
        </a>
      }
      avatar={null}
      content={
        <div
          className={cls(
            style.commentContent,
            !isReply ? style.addLine : false
          )}
        >
          <div
            className={cls("markdown")}
            dangerouslySetInnerHTML={{ __html: comment.html }}
          ></div>
          {isReply ? (
            <Editor
              articleId={articleId}
              isInPage={isInPage}
              parentCommentId={comment.id}
              parentComment={comment}
              onSuccess={() => {
                getComments();
                setReply(false);
              }}
              renderFooter={({ disabled, loading, submit }) => {
                return (
                  <>
                    <Button
                      size="small"
                      style={{ marginRight: 16 }}
                      onClick={() => {
                        setReply(false);
                      }}
                    >
                      关闭
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      loading={loading}
                      disabled={disabled}
                      onClick={() => {
                        submit();
                      }}
                    >
                      评论
                    </Button>
                  </>
                );
              }}
            />
          ) : (
            <span
              className={style.commentActions}
              key="comment-nested-reply-to"
              onClick={() => {
                setReply(true);
              }}
            >
              <Icon type="message" />
              <span>评论</span>
            </span>
          )}
        </div>
      }
    >
      {children}
    </Comment>
  );
};

interface IProps {
  articleId: string;
  isInPage?: boolean; // 为 true 时，评论组件在动态页面而非文章
}

const renderCommentList = (
  articleId,
  comments = [],
  getComments,
  isInPage,
  depth = 0,
  parentComment = null
) => {
  return (
    <>
      {comments.map(comment => {
        return (
          <CommentItem
            key={comment.id}
            articleId={articleId}
            comment={comment}
            getComments={getComments}
            isInPage={isInPage}
            depth={depth}
            parentComment={parentComment}
          >
            {comment.children
              ? renderCommentList(
                  articleId,
                  comment.children,
                  getComments,
                  isInPage,
                  depth + 1,
                  comment
                )
              : null}
          </CommentItem>
        );
      })}
    </>
  );
};

export const MyComment: React.FC<IProps> = ({
  articleId,
  isInPage = false
}) => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [comments, setComments] = useState<IComment[]>([]);

  const getComments = useCallback(
    (page, pageSize) => {
      CommentProvider.getArticleComments(articleId, {
        page,
        pageSize
      }).then(res => {
        setComments(res[0]);
        setTotal(res[1]);
      });
    },
    [articleId]
  );

  useEffect(() => {
    getComments(page, pageSize);
  }, [articleId]);

  return (
    <div>
      <Comment
        avatar={null}
        content={
          <Editor
            articleId={articleId}
            isInPage={isInPage}
            parentCommentId={null}
            parentComment={null}
            onSuccess={() => {}} // 因为要审核，所以不必重新拉取数据
          />
        }
      />
      {renderCommentList(articleId, comments, getComments, isInPage)}
      <div className={style.pagination}>
        <Pagination
          simple
          total={total}
          current={page}
          pageSize={pageSize}
          hideOnSinglePage={true}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
            getComments(page, pageSize);
          }}
        />
      </div>
    </div>
  );
};
