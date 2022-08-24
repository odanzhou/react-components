import React, { useCallback, useRef, useEffect, useState, useLayoutEffect } from 'react';
import { debounce } from 'lodash';
import styles from './styles/scroll.less';

/**
 * 滚动类型
 * @typedef {{
 *  children: React.ReactNode,
 *  speed?: number,
 *  width?: number,
 * }} ScrollType
 */

/**
 * 滚动
 * @param {ScrollType} props
 */
const Scroll = (props) => {
  const { speed = 16, width = 1, children } = props;
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showRepeat, setShowRepeat] = useState(false);
  const scrollWrapRef = useRef();

  const onSrcoll = useCallback(() => {
    const scrollWrap = scrollWrapRef.current;
    if (!scrollWrap) return;
    setShowRepeat(true);
    const { scrollLeft, scrollWidth } = scrollWrap;
    const contentWidth = scrollWidth / 2;
    if (scrollLeft >= contentWidth) {
      setScrollLeft(Math.min(scrollLeft - contentWidth, width));
    } else {
      setScrollLeft((left) => left + width);
    }
  }, [width]);

  useLayoutEffect(() => {
    scrollWrapRef.current.scrollLeft = scrollLeft;
  }, [scrollLeft]);

  useEffect(() => {
    const scrollWrap = scrollWrapRef.current;
    let timer;
    const cb = () => {
      setShowRepeat(false);
      clearInterval(timer);
    };
    if (!scrollWrap || scrollWrap.scrollWidth <= scrollWrap.clientWidth + 1) return cb;
    const handle = () => {
      timer = setTimeout(() => {
        onSrcoll();
        handle();
      }, speed);
    };
    setShowRepeat(true);
    handle();
    return cb;
  }, [onSrcoll, speed]);
  const container = <div style={{ display: 'inline-block' }}>{children}</div>;

  let repeatContainer = showRepeat ? React.cloneElement(container) : null;

  return (
    <div ref={scrollWrapRef} className={styles.scroll_wrap} onClick>
      {container} {repeatContainer}
    </div>
  );
};

const ScrollResize = (props) => {
  const { children } = props;
  const childrenRef = useRef(children);
  const [key, setKey] = useState(0);
  useEffect(() => {
    const resizeFn = debounce(() => {
      setKey((key) => ++key);
    }, 100);
    window.addEventListener('resize', resizeFn);
    return () => {
      window.removeEventListener('resize', resizeFn);
    };
  }, []);
  useEffect(() => {
    if (children !== childrenRef.current) {
      setKey((key) => ++key);
      childrenRef.current = children;
    }
  }, [children]);
  return <Scroll {...props} key={key} />;
};

export default ScrollResize;
