import { useRef, useEffect } from 'react'

/**
 * 是不是更新后
 */
const useIsUpdate = () => {
  const isUpdateRef = useRef(false)
  useEffect(() => {
    return () => {
      isUpdateRef.current = true
    }
  })
  return isUpdateRef
}

export default useIsUpdate
