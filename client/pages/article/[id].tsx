import React, { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet";
import { NextPage } from "next";
import Router from "next/router";
import Link from "next/link";
import cls from "classnames";
import { Anchor, Modal, Form, Input, message, Tooltip } from "antd";
import * as dayjs from "dayjs";
import hljs from "highlight.js";
import "highlight.js/styles/atelier-dune-dark.css";
import { useSetting } from "@/hooks/useSetting";
import { Layout } from "@/layout/Layout";
import { ArticleProvider } from "@providers/article";
import { CommentAndRecommendArticles } from "@components/CommentAndRecommendArticles";
import style from "./index.module.scss";
const url = require("url");

interface IProps {
  article: IArticle;
}

const buildTocTree = tocs => {
  let tree: any = [];

  for (let toc of tocs) {
    let level = toc[0];

    if (!tree.length) {
      tree.push({ node: toc, children: [] });
    } else {
      let pre = tree[tree.length - 1];
      let nodes = [pre, ...pre.children];
      nodes.reverse();
      let target = nodes.find(node => node.node[0] === level - 1);

      if (target) {
        target.children = target.children || [];
        target.children.push({ node: toc, children: [] });
      } else {
        tree.push({ node: toc, children: [] });
      }
    }
  }
  return tree;
};

const renderTocTree = tocs => {
  return (
    <>
      {tocs.filter(Boolean).map(toc => {
        const node = toc.node;
        return node && node.length === 3 ? (
          <Anchor.Link
            key={node[2]}
            href={"#" + node[1]}
            title={
              <Tooltip title={node[2]} placement={"left"}>
                {node[2]}
              </Tooltip>
            }
          >
            {toc.children ? renderTocTree(toc.children) : null}
          </Anchor.Link>
        ) : null;
      })}
    </>
  );
};

const Article: NextPage<IProps> = ({ article }) => {
  const setting = useSetting();
  const ref = useRef(null);
  const content = useRef(null);
  const [tocs, setTocs] = useState([]);
  const [affix, setAffix] = useState(true);
  const [password, setPassword] = useState(null);
  const [shouldCheckPassWord, setShouldCheckPassword] = useState(
    article.needPassword
  );

  // 检查文章密码
  const checkPassWord = useCallback(() => {
    ArticleProvider.checkPassword(article.id, password).then(res => {
      if (res.pass) {
        setShouldCheckPassword(false);
      } else {
        message.error("密码错误");
        setShouldCheckPassword(true);
      }
    });
  }, [password]);

  const back = useCallback(() => {
    Router.push("/");
  }, []);

  useEffect(() => {
    let tocs = JSON.parse(article.toc);
    let i = 0;
    let max = 10; // 最大尝试次数
    const handle = () => {
      i++;
      try {
        tocs = JSON.parse(tocs);
      } catch (e) {
        i = max + 1;
      }

      if (typeof tocs === "string" && i < max) {
        handle();
      }
    };

    handle();
    setTocs(buildTocTree(tocs));
  }, [article.id]);

  // 更新阅读量
  useEffect(() => {
    if (!shouldCheckPassWord) {
      ArticleProvider.updateArticleViews(article.id);
    }
  }, [shouldCheckPassWord]);

  // 高亮
  useEffect(() => {
    if (!shouldCheckPassWord) {
      hljs.initHighlightingOnLoad();
      hljs.highlightBlock(ref.current);
    }
  }, [shouldCheckPassWord]);

  useEffect(() => {
    const handler = () => {
      const el = content && content.current;
      if (!el) {
        return;
      }
      const { top, height } = el.getBoundingClientRect();
      const diff = top + height;
      setAffix(diff > 100);
    };

    if (!shouldCheckPassWord) {
      document.addEventListener("scroll", handler);
    }

    return () => {
      document.removeEventListener("scroll", handler);
    };
  }, [shouldCheckPassWord]);

  return (
    <Layout backgroundColor="#fff">
      {/* S 密码检验 */}
      <Modal
        title="文章受保护，请输入访问密码"
        cancelText={"回首页"}
        okText={"确认"}
        visible={shouldCheckPassWord}
        onOk={checkPassWord}
        onCancel={back}
      >
        <Form.Item label={"密码"}>
          <Input.Password
            value={password}
            onChange={e => {
              setPassword(e.target.value);
            }}
          />
        </Form.Item>
      </Modal>
      {/* E 密码检验 */}

      {shouldCheckPassWord ? (
        <div className="container">
          <p style={{ margin: "16px 0" }}>请输入文章密码</p>
        </div>
      ) : (
        <div>
          <Helmet>
            <title>{article.title + " - " + setting.systemTitle}</title>
          </Helmet>
          <article className={cls("container", style.container)}>
            {setting.systemUrl && (
              <meta
                itemProp="url"
                content={url.resolve(
                  setting.systemUrl,
                  `/article/${article.id}`
                )}
              />
            )}
            <meta itemProp="headline" content={article.title} />
            {article.tags && (
              <meta
                itemProp="keywords"
                content={article.tags.map(tag => tag.label).join(" ")}
              />
            )}
            <meta itemProp="dataPublished" content={article.updateAt} />
            {article.cover && <meta itemProp="image" content={article.cover} />}
            <div className={style.meta}>
              {article.cover && (
                <img
                  className={style.cover}
                  src={article.cover}
                  alt="文章封面"
                />
              )}
              <h1 className={style.title}>{article.title}</h1>
              <p className={style.desc}>
                <span>
                  发布于{" "}
                  {dayjs
                    .default(article.createAt)
                    .format("YYYY-MM-DD HH:mm:ss")}
                </span>
                <span> • </span>
                <span>阅读量 {article.views}</span>
              </p>
            </div>

            <div className={style.contentWrapper} ref={content}>
              <div className={style.content}>
                <div
                  ref={ref}
                  className={cls("markdown", style.markdown)}
                  dangerouslySetInnerHTML={{ __html: article.html }}
                ></div>
                <div className={style.articleFooter}>
                  {article.tags && article.tags.length ? (
                    <div className={style.tags}>
                      <div>
                        <span>标签：</span>
                        {article.tags.map(tag => {
                          return (
                            <div className={style.tag} key={tag.id}>
                              <Link
                                href={"/tag/[tag]"}
                                as={"/tag/" + tag.value}
                              >
                                <a>
                                  <span>{tag.label}</span>
                                </a>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    版权信息：
                    <a
                      href="https://creativecommons.org/licenses/by-nc/3.0/cn/deed.zh"
                      target="_blank"
                    >
                      非商用-署名-自由转载
                    </a>
                  </div>
                </div>
              </div>
              {/* S 文章目录 */}
              {Array.isArray(tocs) && (
                <div className={style.anchorWidget}>
                  <Anchor targetOffset={32} offsetTop={32} affix={affix}>
                    {renderTocTree(tocs)}
                  </Anchor>
                </div>
              )}
              {/* E 文章目录 */}
            </div>
          </article>
          <CommentAndRecommendArticles
            articleId={article.id}
            isCommentable={article.isCommentable}
          />
        </div>
      )}
    </Layout>
  );
};

Article.getInitialProps = async ctx => {
  const { id } = ctx.query;
  const article = await ArticleProvider.getArticle(id);
  return { article };
};

export default Article;
