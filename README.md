
最近疫情比较紧张，在家调休，闲着无聊便写了个前后端分离，服务端渲染的博客系统。支持特性：

- 文章创建、编辑、发布
- 文章及页面评论
- 文章搜索及搜索记录管理
- 页面动态创建
- 文件上传（上传到 阿里云 OSS）
- 邮件通知
- 动态系统设置（系统标题、Logo、favicon、页脚及 SEO 配置等）
- 系统访问统计（ip + user-agent）

使用技术：react.js typescript nextjs nestjs mysql。
GitHub 地址：https://github.com/zhxuc/wipi （欢迎 star）。

## 线上预览

### 前台页面

地址：https://custw.qifengle1412.cn/

### 后台页面

地址：https://custw.qifengle1412.cn/admin/register （支持访客注册，也可使用账户：`wipi` `wipi123456`）。

![登录页面](https://wipi.oss-cn-shanghai.aliyuncs.com/2020-02-13/PMHJN7AB7S95TU83JGRZW0/wipi-login.png)
![后台首页](https://wipi.oss-cn-shanghai.aliyuncs.com/2020-02-13/PMHJN7AB7S95TU83JGRZR2/wipi-admin-index.png)
![文章管理](https://wipi.oss-cn-shanghai.aliyuncs.com/2020-02-13/PMHJN7AB7S95TU83JGRZOL/wipi-admin-article.png)
![页面管理](https://wipi.oss-cn-shanghai.aliyuncs.com/2020-02-13/PMHJN7AB7S95TU83JGRZTJ/wipi-admin-page.png)

地址：https://custw.qifengle1412.cn/admin/login （账户：`wipi`，密码：`wipi123456`）。

## 本地启动

- clone 本项目。

```bash
git clone --depth=1 https://github.com/zhxuc/wipi.git your-project-name
```

-  安装依赖

首先安装 `MySQL`，推荐使用 docker 进行安装。

```bash
docker run -d --restart=always --name wipi-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql
```

然后安装项目 node 依赖。

```bash
cd client && yarn
cd server && yarn
```

- 启动项目

分别启动前台页面和服务端。

```bash
cd client && yarn dev
cd server && yarn start:dev
```

打开浏览器，访问 `http://localhost:3000` 即可访问前台页面，`http://localhost:3000/admin` 为后台管理页面。

服务端接口运行在 `http://localhost:4000`。

首次启动，默认创建管理员用户：admin，密码：admin（可在 `server/src/config` 文件中进行修改）。

[PS] 如服务端配置启动失败，请先确认 MySQL 的配置是否正确，配置文件在 `server/src/config`。

## 项目部署

在服务器使用 pm2 进行部署即可，可以查看 `deploy.sh` 文件。

## 搜索服务

该项目使用了 MySQL 模糊查询提供搜索接口。如果服务器配置较高，或想体验更强大的搜索服务（elasticsearch），可以参考 `elasticsearch` 文件下 `deploy.sh` 文件。

最后说一句：

1. 首页：https://custw.qifengle1412.cn/
2. 后台：https://custw.qifengle1412.cn/admin/login （账户：<code>wipi</code>，密码：<code>wipi123456</code>）
4. 源码：https://github.com/zhxuc/wipi （欢迎 star）

## 交流群

如果有问题，欢迎提 issue 或者加入下方微信群。

![二维码](https://wipi.oss-cn-shanghai.aliyuncs.com/2020-03-08/TYM4W4F54Y5KLFDJOJGK7G/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20200308182855.jpg)
