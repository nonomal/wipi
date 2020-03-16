import React, { useState, useEffect } from 'react';
import cls from 'classnames';
import style from './index.module.scss';

let CKEditor = (() => null) as any;
let DecoupledEditor = () => null;

interface IProps {
  value: string;
  onChange: (arg: any) => void;
}

export const Editor: React.FC<IProps> = ({ value, onChange }) => {
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

  return mounted ? (
    <div className={cls(style.wrapper, 'markdown')}>
      <CKEditor
        editor={DecoupledEditor}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  ) : null;
};
