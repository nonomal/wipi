import React, { useRef, useEffect, useState } from 'react';
import { SettingProvider } from '@providers/setting';

export const useSetting = () => {
  const [, setMounted] = useState(false);
  const value = useRef(null);

  useEffect(() => {
    SettingProvider.getSetting().then(res => {
      value.current = res;
      setMounted(true);
    });
  }, []);

  return value.current || {};
};
