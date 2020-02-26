import React, { useState, useEffect, useRef } from "react";
import { Button, Input, message, Popover, Tabs, Avatar } from "antd";
import cls from "classnames";
import { CommentProvider } from "@providers/comment";
import { marked } from "./mark";
import emojis from "./emojis.json";
import style from "./index.module.scss";

const { TextArea } = Input;
const { TabPane } = Tabs;

export const Editor = ({
  articleId,
  isInPage = false,
  parentComment,
  renderFooter = null,
  onSuccess = () => {}
}) => {
  const textarea = useRef(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    let userInfo: any = window.localStorage.getItem("user");

    try {
      userInfo = JSON.parse(userInfo);
      setName(userInfo.name);
      setEmail(userInfo.email);
    } catch (err) {}
  }, [loading]);

  useEffect(() => {
    if (parentComment) {
      setContent(
        `<blockquote>${parentComment.html}</blockquote>\r\n @${parentComment.name} `
      );
      textarea.current.focus();
    }
  }, [parentComment]);

  const submit = () => {
    let regexp = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;

    if (!regexp.test(email)) {
      message.error("请输入合法邮箱地址");
      return;
    }

    const data = {
      articleId,
      name,
      email,
      content,
      isInPage
    };

    if (parentComment) {
      if (parentComment.id) {
        Object.assign(data, { parentCommentId: parentComment.id });
      }

      if (parentComment.email) {
        Object.assign(data, { reply: parentComment.email });
      }
    }

    setLoading(true);
    CommentProvider.addComment(data).then(() => {
      message.success("评论成功，已提交审核");
      setLoading(false);
      setContent("");
      let userInfo: any = window.localStorage.getItem("user");
      try {
        userInfo = JSON.parse(userInfo);
        window.localStorage.setItem(
          "user",
          JSON.stringify(Object.assign(userInfo, { name, email }))
        );
      } catch (err) {}
      onSuccess();
    });
  };

  return (
    <div className={cls(style.editor)}>
      <div className={style.avatar}>
        <Avatar
          size={32}
          shape="square"
          icon={"user"}
          // style={{ backgroundColor: getRandomColor(comment.name) }}
        >
          {/* {("" + comment.name).charAt(0).toUpperCase()} */}
        </Avatar>
      </div>
      <div>
        <Tabs
          type="card"
          tabBarExtraContent={
            <div className={style.controls}>
              <Popover
                content={
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
                }
                title={null}
                trigger="click"
                placement="topLeft"
              >
                <span>表情</span>
              </Popover>
            </div>
          }
        >
          <TabPane tab="编辑" key="edit">
            <TextArea
              ref={textarea}
              style={{ marginBottom: 16 }}
              placeholder={"请输入评论，支持 Markdown"}
              rows={8}
              onChange={e => {
                setContent(e.target.value);
              }}
              value={content}
            />
          </TabPane>
          <TabPane tab="预览" key="preview">
            <div
              className={cls(style.markdown, "markdown")}
              dangerouslySetInnerHTML={{ __html: marked(content) }}
            ></div>
          </TabPane>
        </Tabs>

        <div className={style.nameAndMail}>
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
        </div>
      </div>

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
            评论
          </Button>
        )}
      </div>
    </div>
  );
};
