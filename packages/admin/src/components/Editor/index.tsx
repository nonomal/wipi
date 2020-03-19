import React, { useState, useEffect, useRef, useCallback } from 'react';
import cls from 'classnames';
import { Spin, Upload, Icon } from 'antd';
import { FileProvider } from '@providers/file';
import style from './index.module.scss';
import { ContentUtils } from 'braft-utils';
import 'braft-editor/dist/index.css';

interface IProps {
  value: string;
  onChange: (arg: any) => void;
  getToolbar?: (arg: any) => void;
}

let BraftEditor;

export const Editor: React.FC<IProps> = ({
  value = '',
  onChange,
  getToolbar,
}) => {
  const ref = useRef(null);
  const [editorState, setEditorState] = useState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    setEditorState(BraftEditor.createEditorState(value));
  }, [mounted, value]);

  useEffect(() => {
    Promise.all([import('braft-editor')]).then(res => {
      BraftEditor = res[0].default;
      setMounted(true);
    });

    return () => {
      setMounted(false);
    };
  }, []);

  const upload = param => {
    if (!param.file) {
      return false;
    }
    FileProvider.uploadFile(param.file).then(res => {
      setEditorState(
        ContentUtils.insertMedias(editorState, [
          {
            type: 'IMAGE',
            url: res.url,
          },
        ])
      );
    });
  };

  const controls = [
    'undo',
    'redo',
    'separator',
    'headings',
    'font-size',
    // 'line-height',
    // 'letter-spacing',
    'separator',
    'list-ul',
    'list-ol',
    'blockquote',
    'code',
    'emoji',
    'separator',
    'link',
    'separator',

    'text-color',
    'bold',
    'italic',
    'underline',
    'strike-through',
    'separator',
    'superscript',
    'subscript',
    'remove-styles',
    'separator',
    'text-indent',
    'text-align',
    'separator',

    'hr',
    'separator',
  ];
  const extendControls = [
    {
      key: 'antd-uploader',
      type: 'component',
      component: (
        <Upload accept="image/*" showUploadList={false} customRequest={upload}>
          <button
            type="button"
            className="control-item button upload-button"
            data-title="插入图片"
          >
            <Icon type="picture" theme="filled" />
          </button>
        </Upload>
      ),
    },
  ];

  return mounted ? (
    <div className={cls(style.wrapper, '')} ref={ref}>
      <BraftEditor
        value={editorState}
        onChange={editorState => {
          const html = editorState.toHTML();
          onChange(html);
        }}
        controls={controls}
        extendControls={extendControls}
      />
    </div>
  ) : (
    <Spin tip="编辑器努力加载中..." spinning={true}></Spin>
  );
};
