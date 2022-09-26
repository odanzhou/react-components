import { useMemo } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';

/**
 * 返回保存最新值的引用
 * @param { T } [initVal]
 * @param {{ auto?: boolean, fns: string[] | true }} [conf]
 */
const useRefWrapper = (initVal, conf) => {
  const { auto = false, fns } = conf || {}
  const valRef = useRef(initVal);
  useMemo(() => {
    if (auto) {
      valRef.current = initVal;
    }
  }, [initVal, auto])
  const getRef = useCallback(() => {
    return valRef.current
  }, [])
  const setRef = useCallback((val) => valRef.current = val)

  /**
   * 获取对象的某个属性值
   */
  const pickRef = useCallback((key) => {
    return getRef()?.[key]
  }, [getRef])


  /**
   * 返回函数，获取对象的某个属性值，当值为函数时执行调用
   */
  const pickFnRef = useCallback((key) => {
    return (...args) => {
      const val = getRef()?.[key]
      if (typeof val === 'function') {
        return val(...args)
      }
      return val
    }
  }, [getRef])

  /**
   * 获取引用值，当为函数时，会调用函数
   */
  const fnRef = useCallback((...args) => {
    const val = getRef()
    if (typeof val === 'function') {
      return val(...args)
    }
    return val
  }, [getRef])

  const objWrapper = useMemo(() => {
    if(Array.isArray(fns)) {
      return fns.reduce((res, fnName) => {
        res[fnName] = pickFnRef(fnName)
        return res
      }, {})
    }
    return {}
  }, [fns, pickFnRef])

  return {
    getRef,
    setRef,
    fnRef,
    pickRef,
    objWrapper,
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
