import React, { useState } from 'react';
import { Layout, Row, Col, Menu, Icon, Dropdown, Button } from 'antd';
import Link from 'next/link';
import cls from 'classnames';
import { Helmet } from 'react-helmet';
import { useSetting } from '@/hooks/useSetting';
import { useRouter } from 'next/router';
import { UserInfo } from '@/components/UserInfo';
import style from './index.module.scss';

const menus = [
  {
    icon: 'dashboard',
    label: '工作台',
    path: '/',
  },
  {
    divider: true,
  },
  {
    icon: 'form',
    label: '所有文章',
    path: '/article',
  },
  {
    label: '新建文章',
    path: '/article/editor',
    ignore: true,
  },
  {
    label: '编辑文章',
    path: '/article/editor/[id]',
    ignore: true,
  },
  {
    icon: 'tag',
    label: '分类管理',
    path: '/article/category',
  },
  {
    icon: 'tag',
    label: '标签管理',
    path: '/article/tags',
  },
  {
    divider: true,
  },
  {
    icon: 'snippets',
    label: '所有页面',
    path: '/page',
  },
  {
    label: '新建页面',
    path: '/page/editor',
    ignore: true,
  },
  {
    label: '编辑页面',
    path: '/page/editor/[id]',
    ignore: true,
  },
  {
    divider: true,
  },
  {
    icon: 'message',
    label: '评论管理',
    path: '/comment',
  },
  {
    icon: 'mail',
    label: '邮件管理',
    path: '/mail',
  },
  {
    icon: 'folder-open',
    label: '文件管理',
    path: '/file',
  },
  {
    divider: true,
  },
  {
    icon: 'search',
    label: '搜索记录',
    path: '/search',
  },

  {
    icon: 'project',
    label: '访问统计',
    path: '/view',
  },
  {
    divider: true,
  },
  {
    label: '个人中心',
    icon: 'user',
    path: '/ownspace',
    ignore: true,
  },
  {
    icon: 'user',
    label: '用户管理',
    path: '/user',
    ignore: true,
  },

  {
    icon: 'setting',
    label: '系统设置',
    path: '/setting',
  },
];

const resolveBreadcrumbs = pathname => {
  const breadcrumbs = [];

  for (let menu of menus) {
    if (menu.path === pathname) {
      breadcrumbs.push(menu);
      break;
    }

    menu.path === '/admin' && breadcrumbs.push(menu);
  }

  return breadcrumbs;
};

const findActiveMenu = pathname => {
  return menus.find(menu => menu.path === pathname);
};

interface IAdminLayoutProps {
  background?: string;
  padding?: any;
}

const ResourceCreate = () => {
  const menu = (
    <Menu>
      <Menu.Item>
        <Link href={'/article/editor'}>
          <a>
            <span>新建文章</span>
          </a>
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link href={'/page/editor'}>
          <a>
            <span>新建页面</span>
          </a>
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} placement="bottomLeft">
      <Button style={{ width: '100%' }} type="primary" size="large" icon="plus">
        新建
      </Button>
    </Dropdown>
  );
};

export const AdminLayout: React.FC<IAdminLayoutProps> = ({
  children,
  background = '#fff',
  padding = 24,
}) => {
  const setting = useSetting();
  const router = useRouter();
  const { pathname } = router;
  const activeMenu = findActiveMenu(pathname);

  return (
    <Layout className={style.wrapper}>
      <Helmet>
        <title>{'管理后台 - ' + setting.systemTitle}</title>
        <meta name="keyword" content={setting.seoKeyword} />
        <meta name="description" content={setting.seoDesc} />
        <link rel="shortcut icon" href={setting.systemFavicon} />
        <link
          href="//fonts.googleapis.com/css?family=Nunito:400,400i,700,700i&amp;display=swap"
          rel="stylesheet"
        ></link>
      </Helmet>
      <div className={style.container}>
        <aside className={style.asider}>
          <div className={style.logo}>管理后台</div>
          <div className={style.resourceCreate}>
            <ResourceCreate />
          </div>
          <nav className={style.menus}>
            <ul>
              {menus
                .filter((m: any) => !m.ignore)
                .map(menu => {
                  return menu.divider ? (
                    <div className={style.divider}></div>
                  ) : (
                    <li key={menu.path}>
                      <Link href={menu.path}>
                        <a
                          className={cls({
                            [style.active]:
                              activeMenu && activeMenu.path === menu.path,
                          })}
                        >
                          <Icon type={menu.icon} />
                          <span>{menu.label}</span>
                        </a>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </nav>
        </aside>
        <main className={style.main}>
          <header>
            <Row>
              <Col span={12}>
                <div className={style.title}>
                  {activeMenu && activeMenu.label}
                </div>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <div className={style.info}>
                  <a
                    className={style.github}
                    href="https://github.com/zhxuc/wipi"
                    target="_blank"
                  >
                    <Icon type="github" />
                    <span></span>
                  </a>
                  <UserInfo />
                </div>
              </Col>
            </Row>
          </header>
          <article>
            <div>{children}</div>
          </article>
        </main>
      </div>
    </Layout>
  );
};
