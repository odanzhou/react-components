import React, { useState, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import useObserver from './useResizeObserver';
import useNewRef from './useNewRef';

/**
 * 通过获取容器宽度，来获取布局信息
 * @param {{
 *  elementRef:  React.MutableRefObject<HTMLElement | undefined>,
 *  list?: { screen: string, width: number }[],
 *  maxScreen?: string,
 * }} conf
 */
const useResizeObserverLayout = (conf) => {
  const { elementRef, list: listProp, maxScreen = 'MaxPlus' } = conf || {};
  const [width, setWidth] = useState(0);

  const list = useMemo(() => {
    return [
      ...(Array.isArray(listProp) ? listProp : []),
      {
        screen: maxScreen,
        width: Number.MAX_SAFE_INTEGER,
      },
    ];
  }, [listProp, maxScreen]);

  const domObserverCallBack = useCallback(
    debounce(([entry]) => {
      if (entry) {
        const { width } = entry.contentRect || {};
        setWidth(width);
      }
    }, 50),
    [],
  );
  useObserver({
    elementRef,
    callback: domObserverCallBack,
  });

  const [screen, listMap] = useMemo(() => {
    let minWidth = Infinity;
    const resMap = {};
    const resVal = list.reduce((res, item) => {
      const { width: w, screen: lable } = item;
      // 值越小的越精确
      if (w < minWidth && width < w) {
        res = lable;
        minWidth = w;
      }
      resMap[lable] = item;
      return res;
    }, '');
    return [resVal, resMap];
  }, [list, width]);
  // 比较屏幕

  const breakpointsCompareHandle = useCallback(
    (type) => (screenVal) => {
      // type 值 equal down up
      const notProd = _ENV_ !== 'prod';
      if (notProd && !['equal', 'down', 'up'].includes(type)) {
        console.error('出错了，type值只支持 equal、down、up', type);
      }
      // 判断是否相等
      if (type === 'equal') {
        return screenVal === screen;
      }
      const isDown = type === 'down';
      const compareWidth = listMap[screenVal]?.width;
      // 当不存在时处理
      if (!compareWidth) {
        if (_ENV_ !== 'prod') {
          console.error('出错了，没有当前的响应式值：', screenVal, listMap);
        }
        return false;
      }

      return isDown ? width < compareWidth : compareWidth < width;
    },
    [listMap, screen, maxScreen, width],
  );

  const breakpointsCompare = useCallback(
    (screenVal, type) => {
      return breakpointsCompareHandle(type)(screenVal);
    },
    [breakpointsCompareHandle],
  );

  const [breakpointsDown, breakpointsEqual, breakpointsUp] = useMemo(() => {
    return [
      breakpointsCompareHandle('down'),
      breakpointsCompareHandle('equal'),
      breakpointsCompareHandle('up'),
    ];
  }, [breakpointsCompareHandle]);

  return useMemo(
    () => ({
      width,
      screen,
      breakpointsCompare,
      breakpointsDown,
      breakpointsEqual,
      breakpointsUp,
    }),
    [width, screen, breakpointsCompare, breakpointsDown, breakpointsEqual, breakpointsUp],
  );
};

/**
 * 基于body的响应式
 * @param {{ screen: string, width: number }[]} [breakList]
 */
export const useResizeObserverBody = (breakList) => {
  const wrapRef = useNewRef(document.body);
  const list = useMemo(() => {
    return (
      breakList || [
        {
          width: 768,
          screen: 'Max768',
        },
        {
          width: 1200,
          screen: 'Max1200',
        },
        {
          width: 1440,
          screen: 'Max1440',
        },
      ]
    );
  }, [breakList]);

  return useResizeObserverLayout({
    elementRef: wrapRef,
    list,
  });
};

export default useResizeObserverLayout;
