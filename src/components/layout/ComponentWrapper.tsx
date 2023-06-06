import React, { memo, useState, useEffect, useRef } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { debounce } from 'lodash';
import * as AllWrapperContext from './context';
import { event } from '@/utils/event';
import { Wrapper } from './style';

let resizeObserver;

const defaultBreakPoints = [768, 1024];

const defaultBreakPointsStrs = ['sm', 'md', 'lg'];

const defaultMin = -1;
const defaultMax = 1000000;

const breakPointMatch = ({
  min = defaultMin,
  max = defaultMax,
  v,
  index,
  isCustomKey,
}) => {
  const defaultStr =
    index <= 2 ? defaultBreakPointsStrs[index] : `lg${index - 2}`;
  // 完整区间
  if (min <= v && v < max) {
    // min没取到，用的默认的（断点便利第一次）
    if (min === defaultMin) {
      return isCustomKey ? `${max}` : defaultStr;
      // max没取到，用的默认的（断点便利最后）
    } else if (max === defaultMax) {
      return isCustomKey ? `${min}` : defaultStr;
      // 区间内
    } else {
      return isCustomKey ? `${min}-${max}` : defaultStr;
    }
  }
};

/**
 * @description 组件容器,根据容器进行自适应
 * @param {boolean} props.isCustomKey 是否使用自定义key，
 * 为true时，将根据传递的断点返回,
 * example:
 * breakPoints:[400, 600, 800, 1000],
 * 容器宽度满足(0, 400),screen: "400",
 * 容器宽度满足[400, 600),screen: "400-600"
 * 容器宽度满足[600, 800), screen: "600-800"
 * 容器宽度满足[800, 1000), screen: "800-1000"
 * 容器宽度满足[1000, max), screen: "1000"
 * 为false（默认值）时,
 * 容器宽度满足(0, 400),screen: "sm",
 * 容器宽度满足[400, 600),screen: "md"
 * 容器宽度满足[600, 800), screen: "lg"
 * 容器宽度满足[800, 1000), screen: "lg1"（自增模式了）
 * 容器宽度满足[1000, max), screen: "lg2"（自增模式了）
 * @default props.isCustomKey false
 */
const ComponentWrapper = memo(
  ({
    children,
    name,
    breakPoints = defaultBreakPoints,
    isCustomKey = false,
    ...others
  }) => {
    const ref = useRef();
    const [screen, setScreen] = useState('');
    const WrapperContext = AllWrapperContext[name];
    const eventName = `screen_${name}_change`;
    const hasScreen = !!screen;

    // 监听wrapper变化
    useEffect(() => {
      if (ref.current && breakPoints.length > 0) {
        const fx = debounce((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            // 这里需要多便利一次
            for (let i = 0; i < breakPoints.length + 1; i++) {
              const _screen = breakPointMatch({
                // 取上一个
                min: breakPoints[i - 1],
                // 取当前
                max: breakPoints[i],
                // 当前宽度
                v: width,
                // 索引
                index: i,
                // 是否自定义key
                isCustomKey,
              });
              if (_screen) {
                console.log();
                event.emit(eventName, { screen, width, height });
                return setScreen(_screen);
              }
            }
          }
        }, 100);
        resizeObserver = new ResizeObserver((entries) => {
          fx(entries);
        });
        resizeObserver.observe(ref.current);
      }
      return () => {
        if (ref.current) {
          resizeObserver.unobserve(ref.current);
        }
      };
    }, [ref, hasScreen, setScreen, breakPoints, eventName]);

    return (
      <WrapperContext.Provider value={screen}>
        <Wrapper className={screen} ref={ref} {...others}>
          {screen && children}
        </Wrapper>
      </WrapperContext.Provider>
    );
  },
);

export default ComponentWrapper;
