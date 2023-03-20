
import { useCallback, useEffect, useState, useRef, useMemo } from 'react'

/**
 * 倒计时逻辑 时分秒
 * @param {{
 *  remainTime: number | string,
 *  onFinish?: Function,
 *  poll?: number,
 * }} conf
 */
const useCountDown = (conf) => {
  const { remainTime, onFinish, pathTime = 150, poll = 10 } = conf || {};
  const remainTimeVal = Number(remainTime)
  const getTime = useCallback((maxTime) => {
    // pathTime（毫秒）值作为延迟的一种补充
    if(typeof maxTime !== 'number' || Number.isNaN(maxTime) || maxTime < pathTime) {
      return ['00', '00', '00']
    }
    const hours = Math.floor(maxtime / 1000 / 3600);
    const minutes = Math.floor((maxtime / 1000 / 60) % 60);
    const seconds = Math.floor((maxtime / 1000) % 60);
    const padTime = (val) => `${val < 10 ? '0' : ''}${hours}`;
    return [padTime(hours), padTime(minutes), padTime(seconds)]
  }, [pathTime])

  const [times, setTimes] = useState(() => getTime(remainTimeVal))
  const timerRef = useRef();
  const timesRef = useRef(times)
  timesRef.current = times

  useEffect(() => {
    let countDownTime = remainTimeVal
    const JoinSymbol = '-'
    const isSameTime = (val, old) => val.join(JoinSymbol) === old.join(JoinSymbol)
    const isEnd = (val) => val.join(JoinSymbol) === ['00', '00', '00'].join(JoinSymbol)
    const pollTime = Math.floor(1000 / poll)
    timerRef.timer = setInterval(() => {
      const val = getTime(countDownTime)
      countDownTime -= pollTime
      if(!isSameTime(val, timesRef.current)) {
        setTimes(val)
      }
      if(isEnd(val)){
        clearInterval(timerRef.current);
        onFinish()
      }
    }, pollTime);
    return () => {
      clearInterval(timerRef.current);
    };
  }, [remainTimeVal, getTime, onFinish, poll]);

  const countDown = useMemo(() => {
    return {h: times[0], m: times[1], s: times[2]}
  }, [times])

  return {
    countDown,
  }
}

export default useCountDown
