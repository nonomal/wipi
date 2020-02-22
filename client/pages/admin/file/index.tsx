import React, { useState, useCallback } from "react";
import { NextPage } from "next";
import {
  Row,
  Col,
  Drawer,
  Button,
  Spin,
  Upload,
  Icon,
  message,
  Card,
  List,
  Popconfirm
} from "antd";
import * as dayjs from "dayjs";
import { AdminLayout } from "@/layout/AdminLayout";
import { FileProvider } from "@providers/file";
import { SPTDataTable } from "@components/admin/SPTDataTable";
import style from "./index.module.scss";

const { Meta } = Card;
const { Dragger } = Upload;

const DescriptionItem = ({ title, content }) => (
  <div className={style.description}>
    <p>{title}:</p>
    <div>{content}</div>
  </div>
);

interface IFileProps {
  files: IFile[];
  total: number;
}

const copy = value => {
  let textarea: any = document.createElement("textarea");
  textarea.id = "t";
  textarea.style.height = 0;
  document.body.appendChild(textarea);
  textarea.value = value;
  let selector: any = document.querySelector("#t");
  selector.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  message.success("链接已复制到剪切板");
};

const File: NextPage<IFileProps> = ({ files: defaultFiles = [], total }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [files, setFiles] = useState<IFile[]>(defaultFiles);
  const [currentFile, setCurrentFile] = useState<IFile | null>(null);
  const [params, setParams] = useState(null);

  const uploadProps = {
    name: "file",
    multiple: false,
    action: "",
    beforeUpload(file) {
      setLoading(true);
      FileProvider.uploadFile(file)
        .then(() => {
          message.success("上传成功");
          getFiles(params);
        })
        .catch(() => {
          setLoading(false);
        });
      return Promise.reject();
    }
  };

  const getFiles = useCallback((params = {}) => {
    return FileProvider.getFiles(params)
      .then(res => {
        setParams(params);
        setFiles(res[0]);
        setLoading(false);
        return res;
      })
      .catch(err => {
        setLoading(false);
      });
  }, []);

  const deleteFile = useCallback(
    id => {
      FileProvider.deleteFile(id).then(() => {
        setVisible(false);
        setLoading(true);
        getFiles(params);
      });
    },
    [params]
  );

  return (
    <AdminLayout>
      <div className={style.wrapper}>
        <div style={{ marginBottom: "1.5rem" }}>
          <Spin tip="文件上传中..." spinning={loading}>
            <Upload {...uploadProps}>
              {/* <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">点击选择文件或将文件拖拽到此处</p>
              <p className="ant-upload-hint">
                文件将上传到 阿里云 OSS, 如未配置请先配置
              </p> */}
              <Button>
                <Icon type="upload" /> 上传文件
              </Button>
            </Upload>
          </Spin>
        </div>

        <SPTDataTable
          data={files}
          defaultTotal={total}
          columns={[]}
          searchFields={[
            {
              label: "文件名称",
              field: "originalname",
              msg: "请输入文件名称"
            },
            {
              label: "文件类型",
              field: "type",
              msg: "请输入文件类型"
            }
          ]}
          onSearch={getFiles}
          customDataTable={data => (
            <List
              className={style.imgs}
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 4,
                lg: 4,
                xl: 4,
                xxl: 6
              }}
              dataSource={data}
              renderItem={(file: IFile) => (
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      <div className={style.preview}>
                        <img alt={file.originalname} src={file.url} />
                      </div>
                    }
                    onClick={() => {
                      setCurrentFile(file);
                      setVisible(true);
                    }}
                  >
                    <Meta
                      title={file.originalname}
                      description={
                        "上传于 " +
                        dayjs
                          .default(file.createAt)
                          .format("YYYY-MM-DD HH:mm:ss")
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          )}
        />

        <Drawer
          width={640}
          placement="right"
          title={"文件信息"}
          closable={true}
          onClose={() => setVisible(false)}
          visible={visible}
        >
          <div className={style.previewContainer}>
            <img
              alt={currentFile && currentFile.originalname}
              src={currentFile && currentFile.url}
            />
          </div>

          <Row>
            <Col span={24}>
              <DescriptionItem
                title="文件名称"
                content={currentFile && currentFile.originalname}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <DescriptionItem
                title="存储路径"
                content={currentFile && currentFile.filename}
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <DescriptionItem
                title="文件类型"
                content={currentFile && currentFile.type}
              />
            </Col>
            <Col span={12}>
              <DescriptionItem
                title="文件大小"
                content={currentFile && currentFile.size + " Byte"}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <DescriptionItem
                title="访问链接"
                content={
                  <>
                    <div
                      className={style.urlContainer}
                      onClick={() => {
                        copy(currentFile && currentFile.url);
                      }}
                    >
                      {currentFile && currentFile.url}
                    </div>
                    <Button
                      type="link"
                      onClick={() => {
                        copy(currentFile && currentFile.url);
                      }}
                    >
                      复制
                    </Button>
                  </>
                }
              />
            </Col>
          </Row>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              borderTop: "1px solid #e8e8e8",
              padding: "10px 16px",
              textAlign: "right",
              left: 0,
              background: "#fff",
              borderRadius: "0 0 4px 4px"
            }}
          >
            <Button
              style={{
                marginRight: 8
              }}
              onClick={() => setVisible(false)}
            >
              关闭
            </Button>
            <Popconfirm
              placement="topRight"
              title="确认删除这个文件？"
              onConfirm={() => deleteFile(currentFile && currentFile.id)}
              okText="确认"
              cancelText="取消"
            >
              <Button type="danger">删除</Button>
            </Popconfirm>
          </div>
        </Drawer>
      </div>
    </AdminLayout>
  );
};

File.getInitialProps = async () => {
  const files = await FileProvider.getFiles({ page: 1, pageSize: 12 });
  return { files: files[0], total: files[1] };
};

export default File;
