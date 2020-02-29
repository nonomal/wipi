import React, { useState, useEffect, useRef } from "react";
import { NextPage } from "next";
import hljs from "highlight.js";
import { Layout } from "@/layout/Layout";
import Viewer from "viewerjs";
import { CommentAndRecommendArticles } from "@components/CommentAndRecommendArticles";
import { PageProvider } from "@providers/page";
import style from "./index.module.scss";

interface IProps {
  page: IPage;
}

const Page: NextPage<IProps> = ({ page }) => {
  const ref = useRef(null);
  const [tocs, setTocs] = useState([]);

  useEffect(() => {
    if (!page) {
      return;
    }

    let tocs = JSON.parse(page.toc);
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
    setTocs(tocs);
  }, []);

  // 更新阅读量
  useEffect(() => {
    PageProvider.updatePageViews(page.id);
  }, []);

  // 高亮
  useEffect(() => {
    if (ref.current) {
      hljs.initHighlightingOnLoad();
      hljs.highlightBlock(ref.current);
    }
  }, []);

  // 大图插件
  useEffect(() => {
    new Viewer(ref.current, { inline: false });
  }, []);

  return (
    <Layout backgroundColor="#fff">
      {!page ? (
        <div className="container">
          <p>页面不存在</p>
        </div>
      ) : (
        <div className={style.container}>
          <div className="container">
            {page.cover && (
              <div className={style.meta}>
                <img className={style.cover} src={page.cover} alt="文章封面" />
              </div>
            )}
            <div className={style.content}>
              <div
                ref={ref}
                className={"markdown"}
                dangerouslySetInnerHTML={{ __html: page.html }}
              ></div>
            </div>
          </div>
          <CommentAndRecommendArticles pageId={page.id} isCommentable={true} />
        </div>
      )}
    </Layout>
  );
};

Page.getInitialProps = async ctx => {
  const { id } = ctx.query;
  const page = await PageProvider.getPage(id);
  return { page };
};

export default Page;
