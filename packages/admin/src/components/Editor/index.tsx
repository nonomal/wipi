import React, { useState, useEffect, useRef, useCallback } from 'react';
import cls from 'classnames';
import hljs from 'highlight.js';
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
    ]).then(res => {
      CKEditor = res[0].default;
      DecoupledEditor = res[1].default;
      setMounted(true);
    });

    return () => {
      setMounted(false);
    };
  }, []);

  const highlight = useCallback(() => {
    // hljs.highlightBlock(ref.current);
  }, []);

  // useEffect(() => {
  //   if (!mounted) {
  //     return;
  //   }

  //   hljs.initHighlightingOnLoad();
  // }, [mounted]);

  return mounted ? (
    <div className={cls(style.wrapper, 'markdown')} ref={ref}>
      <CKEditor
        editor={DecoupledEditor}
        data={value}
        onInit={editor => {
          // editor.ui
          //   .getEditableElement()
          //   .parentElement.insertBefore(
          //     editor.ui.view.toolbar.element,
          //     editor.ui.getEditableElement()
          //   );
          getToolbar && getToolbar(editor.ui.view.toolbar.element);
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          highlight();
          onChange(data);
        }}
      />
    </div>
  ) : null;
};
