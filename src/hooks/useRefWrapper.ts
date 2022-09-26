import { useCallback } from 'react';
import { useRef } from 'react';

/**
 * 返回保存最新值的引用
 * @param { T } [initVal]
 * @param {{ auto?: boolean }} [conf]
 */
const useRefWrapper = (initVal, conf) => {
  const { auto = false } = conf || {}
  const valRef = useRef(initVal);
  useMemo(() => {
    if(auto) {
      valRef.current = initVal;
    }
  }, [initVal, auto])
  const getRef = useCallback(() => {
    return valRef.current
  }, [])
  const setRef = useCallback((val) => valRef.current = val)
  return {
    getRef,
    setRef
  }
};

/**
 * 返回保存最新值的引用
 * @param { Parameters<useRefWrapper>[0] } [val]
 * @param {Parameters<useRefWrapper>[1]} [conf]
 */
export const useRefWrapperAuto = (val, conf) => {
  return useRefWrapper(val, { ...conf, auto: true })
}

export default useRefWrapper;
