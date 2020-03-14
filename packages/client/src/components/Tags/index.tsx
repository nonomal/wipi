import React from "react";
import cls from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTags } from "@/hooks/useTags";
import style from "./index.module.scss";

export const Tags = () => {
  const tags = useTags();
  const router = useRouter();
  const { tag: routerTag } = router.query;

  return (
    <div className={style.wrapper}>
      <div className={style.title}>标签</div>
      <ul>
        {tags.map(tag => (
          <li
            key={tag.id}
            className={cls(
              style.item,
              routerTag === tag.value ? style.active : false
            )}
          >
            <Link href={`/tag/[tag]`} as={`/tag/` + tag.value}>
              <a>{tag.label}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
