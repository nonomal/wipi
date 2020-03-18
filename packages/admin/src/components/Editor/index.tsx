import React, { useState, useEffect, useRef, useCallback } from 'react';
import cls from 'classnames';
import { Spin } from 'antd';
import { FileProvider } from '@providers/file';
import style from './index.module.scss';

interface IProps {
  value: string;
  onChange: (arg: any) => void;
  getToolbar?: (arg: any) => void;
}

// 自定义文件上传
class MyUploadAdapter {
  loader: any;

  constructor(loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(file => {
      return new Promise(resolve => {
        FileProvider.uploadFile(file).then(res => {
          resolve({ ...res, default: res.url });
        });
      });
    });
  }
}

function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => {
    return new MyUploadAdapter(loader);
  };
}

let CKEditor = (() => null) as any;
let CustomEditor = () => null;

export const Editor: React.FC<IProps> = ({ value, onChange, getToolbar }) => {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.all([
      import('@ckeditor/ckeditor5-react'),
      import('./ckeditor/ckeditor'),
    ]).then(res => {
      CKEditor = res[0].default;
      CustomEditor = res[1].default;
      setMounted(true);
    });

    return () => {
      setMounted(false);
    };
  }, []);

  return mounted ? (
    <div className={cls(style.wrapper, '')} ref={ref}>
      <CKEditor
        editor={CustomEditor}
        data={value}
        onInit={editor => {
          getToolbar && getToolbar(editor.ui.view.toolbar.element);
        }}
        onChange={(_, editor) => {
          const data = editor.getData();
          console.log(data);
          onChange(data);
        }}
        config={{
          extraPlugins: [MyCustomUploadAdapterPlugin],
          wordCount: {
            onUpdate: stats => {
              // Prints the current content statistics.
              console.log(
                `Characters: ${stats.characters}\nWords: ${stats.words}`
              );
            },
          },
        }}
      />
    </div>
  ) : (
    <Spin tip="编辑器努力加载中..." spinning={true}></Spin>
  );
};
