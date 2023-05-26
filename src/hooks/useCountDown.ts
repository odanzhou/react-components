import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useDispatch } from 'dva';

const JoinSymbol = '-';
const isSameTime = (val, old) => val.join(JoinSymbol) === old.join(JoinSymbol);
const countDownIsEnd = val => val.join(JoinSymbol) === ['00', '00', '00'].join(JoinSymbol);

const hiddenProperty =
  'hidden' in document
    ? 'hidden'
    : 'webkitHidden' in document
      ? 'webkitHidden'
      : 'mozHidden' in document
        ? 'mozHidden'
        : '';
const visibilityChangeEvent = hiddenProperty.replace(
  /hidden/i,
  'visibilitychange',
);

/**
 * 倒计时逻辑
 * @param {number | string} remainTime
 * @param {{
 *  totalTime?: number | string,
 *  isEnd?: boolean,
 *  onFinish?: Function | null,
 *  poll?: number,
 *  onRest?: Function | null,
 *  maxDiffTime?: number,
 *  needH?: boolean,
 *  delay?: number,
 * }} [conf] totalTime: 用来计算进度条; isEnd: 是否已结束; onRest: 用于重新获取数据;
 */
const useCountDown = (remainTime, conf) => {
  const {
    onFinish: onFinishProp, totalTime: totalTimeProp = remainTime, pathTime = 150, poll = 10,
    isEnd: isEndOrigin = false, onRest, maxDiffTime = 1 * 1000, needH = false, delay = 1000,
  } = conf || {};
  const totalTime = Math.max(totalTimeProp, remainTime);
  const dispatch = useDispatch();
  const remainTimeVal = Number(remainTime);
  const getTime = useCallback((maxTime) => {
    // pathTime（毫秒）值作为延迟的一种补充
    if (typeof maxTime !== 'number' || Number.isNaN(maxTime) || maxTime < pathTime || isEndOrigin) {
      return ['00', '00', '00'];
    }
    // 转化为秒
    let timeVal = Math.ceil(maxTime / 1000);
    let hours = 0;
    // 展示小时
    if (needH) {
      hours = Math.floor(timeVal / 3600);
      timeVal -= hours * 3600;
    }
    const minutes = Math.floor(timeVal / 60);
    timeVal -= minutes * 60;
    const seconds = Math.floor(timeVal);
    const padTime = val => `${val < 10 ? '0' : ''}${val}`;
    return [padTime(hours), padTime(minutes), padTime(seconds)];
  }, [pathTime, isEndOrigin]);

  const resetDataTimer = useRef();
  // 重新获取数据
  const resetDataHandle = useCallback(debounce((cb) => {
    clearTimeout(resetDataTimer.current);
    if (timerRef.current == null) return;
    if (typeof onRest === 'function') {
      onRest();
    }
    if (typeof cb === 'function') {
      cb();
    }
  }, 1000), [dispatch, onRest]);

  const resetData = useCallback((...args) => {
    clearTimeout(resetDataTimer.current);
    if (delay > 0) {
      resetDataTimer.current = setTimeout(() => {
        resetDataHandle(...args);
      }, delay);
    } else {
      resetDataHandle(...args);
    }
  }, [delay, resetDataHandle]);

  const onFinishHandle = useCallback((isDelay, ...args) => {
    if (typeof onFinishProp === 'function') {
      onFinishProp(resetData, args);
    } else if (isDelay) {
      resetDataHandle(...args);
    } else {
      resetData(...args);
    }
  }, [onFinishProp, resetData, resetDataHandle]);

  const onFinishTimer = useRef();
  const onFinish = useCallback((...args) => {
    clearTimeout(onFinishTimer.current);
    if (delay > 0) {
      onFinishTimer.current = setTimeout(() => {
        onFinishHandle(true, ...args);
      }, delay);
    } else {
      onFinishHandle(false, ...args);
    }
  }, [delay, onFinishHandle]);

  const [times, setTimes] = useState(() => getTime(remainTimeVal));
  const getInitProgressRate = useCallback((timesVal) => {
    return isEndOrigin || (remainTime > 0 && countDownIsEnd(timesVal)) ? 1 : 0;
  }, [isEndOrigin, remainTime]);
  // 已结束进度条 1
  const [progressRate, setProgressRate] = useState(() => getInitProgressRate(times));

  const countDown = useMemo(() => {
    return { h: times[0], m: times[1], s: times[2] };
  }, [times]);
  const timerRef = useRef();
  const timesRef = useRef(times);
  timesRef.current = times;

  // 重置数据
  useEffect(() => {
    const timesVal = getTime(remainTimeVal);
    setTimes(timesVal);
    const rate = isEndOrigin || countDownIsEnd(timesVal) ?
      getInitProgressRate(timesVal) : (totalTime - remainTimeVal) / totalTime;
    setProgressRate(rate);
  }, [remainTimeVal, getTime, totalTime, isEndOrigin, getInitProgressRate]);

  useEffect(() => {
    let countDownTime = remainTimeVal;
    let hasHideDiffTime = false
    if (isEndOrigin || countDownTime <= 0) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    let timeStart = Date.now();
    const pollTime = Math.floor(1000 / poll);
    timerRef.current = setInterval(() => {
      countDownTime -= pollTime;
      const val = getTime(countDownTime);
      if (!isSameTime(val, timesRef.current)) {
        setTimes(val);
        setProgressRate((totalTime - countDownTime) / totalTime);
      }
      if (countDownIsEnd(val)) {
        clearInterval(timerRef.current);
        onFinish(() => {
          timerRef.current = null;
        });
        setProgressRate(1);
      }
      const diffTime = (Date.now() - timeStart) - (remainTimeVal - countDownTime);
      // 本地时间的差异与 setInterval 执行后变更的时间差异大于设定的时间（默认1秒）
      if (maxDiffTime && diffTime >= maxDiffTime) {
        // 重置差异时间
        countDownTime -= diffTime;
        // 页面隐藏时不发起数据请求
        if(document?.[hiddenProperty]) {
          hasHideDiffTime = true
        } else {
          // 重新请求数据
          resetData();
          hasHideDiffTime = false
        }
      } else if(hasHideDiffTime && !document?.[hiddenProperty]) {
        // 重新请求数据
        resetData();
        hasHideDiffTime = false
      }
    }, pollTime);
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [remainTimeVal, getTime, onFinish, poll, totalTime, isEndOrigin, maxDiffTime, resetData]);

  // 处理页面隐藏显示后的逻辑
  useEffect(() => {
    // resetData();
    // 监听页面显示
    let timer = null;
    if (!visibilityChangeEvent || !hiddenProperty) {
      clearTimeout(timer);
      return;
    }
    const onVisibilityChange = () => {
      if (!document[hiddenProperty]) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          // 每次显示页面都刷新倒计时
          resetData();
        }, 60 * 1000);
      }
    };
    document.addEventListener(visibilityChangeEvent, onVisibilityChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener(visibilityChangeEvent, onVisibilityChange);
    };
  }, [resetData]);
  const isEnd = progressRate === 1; // 已结束
  return {
    countDown,
    isEnd, // 已结束
    progress: progressRate, // 0 - 1 进度比率
    noStarted: remainTime <= 0 && !isEnd, // 剩余时间为0且未结束，表示未启动
    isActive: remainTime > 0, // 活动中
  };
};

export default useCountDown;
