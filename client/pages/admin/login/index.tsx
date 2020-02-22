import React, { useCallback, useState } from "react";
import { Form, Button, Input, Icon, Checkbox } from "antd";
import Router from "next/router";
import Link from "next/link";
import { FormComponentProps } from "antd/es/form";
import { UserProvider } from "@providers/user";
import style from "./index.module.scss";

interface ILoginProps extends FormComponentProps {}

const _Login: React.FC<ILoginProps> = ({ form }) => {
  const { getFieldDecorator } = form;
  const [loading, setLoading] = useState(false);

  const submit = useCallback(e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        setLoading(true);
        UserProvider.login(values)
          .then(userInfo => {
            localStorage.setItem("user", JSON.stringify(userInfo));
            sessionStorage.setItem("token", userInfo.token);
            setLoading(false);
            Router.push("/admin");
          })
          .catch(e => setLoading(false));
      }
    });
  }, []);

  return (
    <div className={style.wrapper}>
      <div className={style.container}>
        <h2>系统登录</h2>
        <Form onSubmit={submit}>
          <Form.Item>
            {getFieldDecorator("name", {
              rules: [{ required: true, message: "请输入用户名！" }]
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                size="large"
                placeholder="请输入用户名"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("password", {
              rules: [{ required: true, message: "请输入密码！" }]
            })(
              <Input
                prefix={
                  <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="password"
                size="large"
                placeholder="请输入密码"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{ width: "100%" }}
              loading={loading}
              disabled={loading}
            >
              登录
            </Button>
            Or{" "}
            <Link href="/admin/register">
              <a>注册用户</a>
            </Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Form.create<ILoginProps>({ name: "login" })(_Login);
