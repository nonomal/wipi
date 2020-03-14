import React, { useState, useRef, useEffect } from "react";
import { CategoryProvider } from "@providers/category";

let cache = null;

export const useCategory = () => {
  const [, setMounted] = useState(false);
  const value = useRef(cache);

  useEffect(() => {
    if (!cache) {
      CategoryProvider.getCategory().then(res => {
        value.current = res;
        cache = res;
        setMounted(true);
      });
    }
  }, []);

  return value.current || [];
};
