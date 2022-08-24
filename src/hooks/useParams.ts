import { useState, useCallback } from 'react'
import useNewRef from './useNewRef'
const InitObj = {}

const useParams = (initParams = InitObj) => {
  const initRef = useNewRef(initParams)
  const [data, setData] = useState(initParams)
  const dataRef = useNewRef(data)
  const [params, setParams] = useState(initParams)
  
  const onSearchReset = useCallback((params = {}) => {
    const res = { ...initRef.current, ...params}
    setData(res)
    setParams(res)
  }, [])

  const onSearchChange = useCallback((key, val) => {
    setData(data => ({...data, [key]: val}))
  }, [])

  const onSearch = useCallback(() => {
    setParams(dataRef.current)
  }, [dataRef])

  return {
    searchParams: params,
    searchData: data,
    onSearchReset,
    onSearchChange,
    onSearch,
  }
}

export default useParams
