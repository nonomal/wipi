import React, { useState, useEffect, useRef, useCallback } from 'react';
import cls from 'classnames';
import style from './index.module.scss';

let CKEditor = (() => null) as any;
let DecoupledEditor = () => null;

interface IProps {
  value: string;
  onChange: (arg: any) => void;
  getToolbar?: (arg: any) => void;
}

export const Editor: React.FC<IProps> = ({ value, onChange, getToolbar }) => {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.all([
      import('@ckeditor/ckeditor5-react'),
      import('@ckeditor/ckeditor5-build-decoupled-document'),
      import(
        '@ckeditor/ckeditor5-build-decoupled-document/build/translations/zh-cn.js'
      ),
    ]).then(res => {
      CKEditor = res[0].default;
      DecoupledEditor = res[1].default;
      setMounted(true);
    });

    return () => {
      setMounted(false);
    };
  }, []);

  return mounted ? (
    <div className={cls(style.wrapper, '')} ref={ref}>
      <CKEditor
        editor={DecoupledEditor}
        data={value}
        onInit={editor => {
          getToolbar && getToolbar(editor.ui.view.toolbar.element);
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          toolbar: [
            'heading',
            'fontSize',
            'highlight',
            'highlight:yellowMarker',
            'highlight:greenMarker',
            'highlight:pinkMarker',
            'highlight:blueMarker',
            'fontFamily',
            'alignment',
            'imageUpload',
            'bold',
            'italic',
            'underline',
            'imageStyle:full',
            'imageStyle:alignLeft',
            'imageStyle:alignRight',
            'link',
            'Table',
            'undo',
            'redo',
          ],
          fontSize: {
            options: [
              8,
              9,
              10,
              11,
              12,
              'default',
              14,
              16,
              18,
              20,
              22,
              24,
              26,
              28,
              36,
              44,
              48,
            ],
          },
          language: 'zh-cn',
        }}
      />
    </div>
  ) : null;
};
