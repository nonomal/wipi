import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Comment, Button, Input, Icon, Divider, message } from "antd";
import { format } from "timeago.js";
import cls from "classnames";
import { CommentProvider } from "@providers/comment";
import style from "./index.module.scss";

import { marked } from "./mark";
import emojis from "./emojis.json";

const { TextArea } = Input;

interface ICommemtItemProps {
  articleId: string;
  comment: IComment;
  getComments: () => void;
  isInPage?: boolean; // 为 true 时，评论组件在动态页面而非文章
  depth?: number; // 第几层嵌套
  parentComment?: IComment | null; // 父级评论
}

export const Editor = ({
  articleId,
  isInPage = false,
  parentCommentId,
  onSuccess = () => {},
  renderFooter = null
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const [showEmoji, toggleEmoji] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let userInfo: any = window.localStorage.getItem("commentUser");

    try {
      userInfo = JSON.parse(userInfo);
      setName(userInfo.name);
      setEmail(userInfo.email);
    } catch (err) {}
  }, [loading]);

  const submit = () => {
    let regexp = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;

    if (!regexp.test(email)) {
      message.error("请输入合法邮箱地址");
      return;
    }

    const data = { articleId, name, email, content, parentCommentId, isInPage };

    setLoading(true);
    CommentProvider.addComment(data).then(() => {
      message.success("评论成功，已提交审核");
      setLoading(false);
      setName("");
      setEmail("");
      setContent("");
      window.localStorage.setItem(
        "commentUser",
        JSON.stringify({ name, email })
      );
      onSuccess();
    });
  };

  return (
    <div className={style.editor}>
      <div>
        <Input
          value={name}
          onChange={e => {
            setName(e.target.value);
          }}
          placeholder="请输入您的称呼"
        />
        <Input
          value={email}
          onChange={e => {
            setEmail(e.target.value);
          }}
          placeholder="请输入您的邮箱（不会公开）"
        />
        <TextArea
          style={{ marginBottom: 16 }}
          placeholder={"请输入评论，支持 Markdown"}
          rows={4}
          onChange={e => {
            setContent(e.target.value);
          }}
          value={content}
        />
      </div>
      <div className={style.controls}>
        <span onClick={() => toggleEmoji(!showEmoji)}>表情</span>
        <span className={style.divider}>|</span>
        <span
          onClick={() => {
            if (!content) {
              return;
            }

            setPreview(!preview);
          }}
        >
          预览
        </span>
      </div>

      {showEmoji ? (
        <div className={style.emojis}>
          {Object.keys(emojis).map(type => {
            return (
              <i
                key={type}
                onClick={() => {
                  setContent("" + content + emojis[type]);
                }}
              >
                {emojis[type]}
              </i>
            );
          })}
        </div>
      ) : null}
      {preview ? (
        <div
          className={cls(style.markdown, "markdown")}
          dangerouslySetInnerHTML={{ __html: marked(content) }}
        ></div>
      ) : null}

      <div className={style.footer}>
        {renderFooter ? (
          renderFooter({
            loading,
            submit,
            disabled: !name || !email || !content
          })
        ) : (
          <Button
            loading={loading}
            onClick={submit}
            type="primary"
            disabled={!name || !email || !content}
          >
            回复
          </Button>
        )}
      </div>
    </div>
  );
};
