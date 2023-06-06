
import React, { useState, useEffect, useRef } from 'react';
import { isEqual, debounce } from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * 获取DOM的数据信息
 * @param { React.MutableRefObject<HTMLElement>} domRef
 */
const useDomBox = (domRef) => {
  const [boxAttributes, setBoxAttributes] = useState({
    width: 0,
  });
  const domFnRef = useRef(() => {
    return domRef?.current;
  });
  const boxAttributesRef = useRef(boxAttributes);
  boxAttributesRef.current = boxAttributes;
  // useEffect(() => {
  //   const resize = () => {
  //     const dom = domFnRef.current();
  //     if (dom) {
  //       const width = dom.offsetWidth;
  //       const res = {
  //         ...boxAttributesRef.current,
  //         width,
  //       };
  //       if (!isEqual(res, boxAttributesRef.current)) {
  //         setBoxAttributes(res);
  //       }
  //     }
  //   };
  //   window.addEventListener('resize', resize);
  //   resize();
  //   return () => {
  //     window.removeEventListener('resize', resize);
  //   };
  // }, []);
  
  useEffect(() => {
    const dom = domFnRef.current();
    if (dom) {
      const fx = debounce(([entry]) => {
        if(entry) {
          const { width } = entry.contentRect;
          console.log('width', width)
          const res = {
            ...boxAttributesRef.current,
            width,
          };
          if (!isEqual(res, boxAttributesRef.current)) {
            setBoxAttributes(res);
          }
        }
      }, 100);
      const resizeObserver = new ResizeObserver((entries) => {
        fx(entries);
      });
      resizeObserver.observe(dom);
      return () => {
        if(dom) {
          resizeObserver.unobserve(dom);
        }
      }
    }
  })

  return boxAttributes;
};

export default useDomBox;
