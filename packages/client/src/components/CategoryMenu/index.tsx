import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import cls from "classnames";
import { useCategory } from "@/hooks/useCategory";
import style from "./index.module.scss";

export const CategoryMenu = () => {
  const categories = useCategory();
  const router = useRouter();
  const { category: routerCategory } = router.query;

  return (
    <div className={cls(style.wrapper)}>
      <div className={cls("container")}>
        <ul>
          <li
            key={"all"}
            className={cls(
              style.tagItem,
              !routerCategory && !/tag/.test(router.pathname)
                ? style.active
                : false
            )}
          >
            <Link href="/">
              <a>
                <span>全部</span>
              </a>
            </Link>
          </li>
          {categories.map(t => {
            return (
              <li
                key={t.id}
                className={cls(
                  style.tagItem,
                  routerCategory === t.value ? style.active : false
                )}
              >
                <Link href="/[category]" as={`/` + t.value} shallow={false}>
                  <a>
                    <span>{t.label}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
