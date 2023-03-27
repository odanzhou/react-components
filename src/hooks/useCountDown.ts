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
 *  isEnd?: boolean;
 *  onFinish?: Function | null,
 *  poll?: number,
 *  actionType?: string,
 * }} conf totalTime: 用来计算进度条; isEnd: 是否已结束
 */
const useCountDown = (remainTime, conf) => {
  const {
    onFinish: onFinishProp, totalTime = remainTime, pathTime = 150, poll = 10,
    isEnd: isEndOrigin = false, actionType
  } = conf || {};
  const dispatch = useDispatch();
  const remainTimeVal = Number(remainTime);
  const getTime = useCallback((maxTime) => {
    // pathTime（毫秒）值作为延迟的一种补充
    if (typeof maxTime !== 'number' || Number.isNaN(maxTime) || maxTime < pathTime || isEndOrigin) {
      return ['00', '00', '00'];
    }
    const hours = Math.floor(maxTime / 1000 / 3600);
    const minutes = Math.floor((maxTime / 1000 / 60) % 60);
    const seconds = Math.floor((maxTime / 1000) % 60);
    const padTime = val => `${val < 10 ? '0' : ''}${val}`;
    return [padTime(hours), padTime(minutes), padTime(seconds)];
  }, [pathTime, isEndOrigin]);

  // 重新获取数据
  const resetData = useCallback(() => {
    if (timerRef.current == null || !actionType) return;
    dispatch({ type: actionType });
  }, [dispatch, actionType]);

  const onFinish = useCallback((...args) => {
    if (typeof onFinishProp === 'function') {
      onFinishProp(...args);
    } else if (typeof onFinishProp === 'undefined') {
      resetData();
    }
  }, [onFinishProp, resetData]);

  const [times, setTimes] = useState(() => getTime(remainTimeVal));
  // 已结束进度条 1
  const [progressRate, setProgressRate] = useState(() => {
    return isEndOrigin || (remainTime > 0 && countDownIsEnd(times)) ? 1 : 0;
  });


  const countDown = useMemo(() => {
    return { h: times[0], m: times[1], s: times[2] };
  }, [times, isEndOrigin, remainTime]);

  const timerRef = useRef();
  const timesRef = useRef(times);
  timesRef.current = times;

  useEffect(() => {
    let countDownTime = remainTimeVal;
    if (isEndOrigin || countDownTime <= 0) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
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
        onFinish();
        timerRef.current = null;
        setProgressRate(1);
      }
    }, pollTime);
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [remainTimeVal, getTime, onFinish, poll, totalTime, isEndOrigin]);

  // 处理页面隐藏显示后的逻辑
  useEffect(() => {
    // resetData();
    // 监听页面显示
    if (!visibilityChangeEvent || !hiddenProperty) {
      return;
    }
    const onVisibilityChange = () => {
      if (!document[hiddenProperty]) {
        // 每次显示页面都刷新倒计时
        resetData();
      }
    };
    document.addEventListener(visibilityChangeEvent, onVisibilityChange);
    return () => {
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
