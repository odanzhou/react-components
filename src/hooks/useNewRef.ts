import { useRef, useMemo } from 'react';

/**
 * 返回保存最新值的引用
 * @param { T } val
 */
const useNewRef = (val) => {
  const valRef = useRef(val);
  useMemo(() => {
    valRef.current = val;
  }, [val])
  return valRef;
};

export default useNewRef;
