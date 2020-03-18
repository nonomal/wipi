import React, { useState, useEffect, useRef, useCallback } from 'react';
import cls from 'classnames';
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
    return this.loader.file.then(file => FileProvider.uploadFile(file));
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
          onChange(data);
        }}
        config={{
          extraPlugins: [MyCustomUploadAdapterPlugin],
        }}
      />
    </div>
  ) : null;
};
