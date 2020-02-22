import React, { useState, useCallback, useEffect } from "react";
import { Alert, Drawer, Card, List, message } from "antd";
import { FileProvider } from "@providers/file";
import { SPTDataTable } from "@components/admin/SPTDataTable";
import style from "./index.module.scss";

const { Meta } = Card;

interface IFileProps {
  isCopy?: boolean;
  visible: boolean;
  closeAfterClick?: boolean;
  onClose: () => void;
  onChange?: (arg: any) => void;
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

export const FileSelectDrawer: React.FC<IFileProps> = ({
  visible,
  isCopy = false,
  closeAfterClick = false,
  onClose,
  onChange
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<IFile[]>([]);
  const [params, setParams] = useState(null);

  const getFiles = useCallback(params => {
    return FileProvider.getFiles(params)
      .then(res => {
        setFiles(res[0]);
        setLoading(false);
        return res;
      })
      .catch(err => {
        setLoading(false);
      });
  }, []);

  return (
    <Drawer
      width={760}
      placement="right"
      title={"文件选择"}
      closable={true}
      onClose={onClose}
      visible={visible}
    >
      {isCopy && <Alert message="点击图片即可复制" type="info" />}
      <SPTDataTable
        data={files}
        defaultTotal={0}
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
            grid={{
              gutter: 16,
              sm: 3
            }}
            dataSource={files}
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
                    isCopy && copy(file.url);
                    onChange && onChange(file.url);
                    closeAfterClick && onClose();
                  }}
                >
                  <Meta
                    title={file.originalname}
                    // description={
                    //   "上传于 " +
                    //   dayjs.default(file.createAt).format("YYYY-MM-DD HH:mm:ss")
                    // }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      />
    </Drawer>
  );
};
