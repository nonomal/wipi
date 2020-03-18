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

let editor;
let CKEditor = (() => null) as any;
let CustomEditor = () => null;

export const Editor: React.FC<IProps> = ({
  value = '',
  onChange,
  getToolbar,
}) => {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [words, setWords] = useState(0);
  const [chars, setChars] = useState(0);

  const [initialData, setInitialData] = useState(value);

  // useEffect(() => {
  //   if (!mounted || !editor) {
  //     return;
  //   }

  //   try {
  //     console.log(value);
  //     var viewFragment = editor.data.processor.toView(
  //       `<p>78979798</p><p>测试</p><p>sdfsdfsdfsdfsd</p><p>dsads</p><pre><code><span>代码片段</span>console.<span>log</span><span>1</span>)</code></pre>`
  //     );
  //     var modelFragment = editor.data.toModel(viewFragment);
  //     editor.model.insertContent(modelFragment);
  //     console.log(editor);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }, [mounted, editor, value]);

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

  // console.log(value);

  return mounted ? (
    <div className={cls(style.wrapper, '')} ref={ref}>
      <CKEditor
        editor={CustomEditor}
        // data={escapeHtml(value)}
        onInit={_editor => {
          editor = _editor;
          getToolbar && getToolbar(editor.ui.view.toolbar.element);
        }}
        onChange={(_, editor) => {
          let data = editor.getData();
          // TODO: 优化正则
          data = data.replace(/<figure class="image">([\S]+)\)/g, (_, $2) => {
            return `<figure class="image">\n${$2})`;
          });
          data = data.replace(
            /<figure class="image image-style-side">([\S]+)\)/g,
            (_, $2) => {
              return `<figure class="image image-style-side">\n${$2})`;
            }
          );
          onChange(data);
        }}
        config={{
          extraPlugins: [MyCustomUploadAdapterPlugin],
          wordCount: {
            onUpdate: stats => {
              setWords(stats.words);
              setChars(stats.characters);
            },
          },
        }}
      />
      <p className={style.stats}>
        字数：{chars}，行数：{words}
      </p>
    </div>
  ) : (
    <Spin tip="编辑器努力加载中..." spinning={true}></Spin>
  );
};
