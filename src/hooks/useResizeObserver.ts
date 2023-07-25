import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ResizeObserver from 'resize-observer-polyfill';

const useObserver = ({ callback, elementRef }) => {
  const current = elementRef && elementRef.current;

  const observer = useRef(null);

  const observe = () => {
    if (elementRef && elementRef.current && observer.current) {
      observer.current.observe(elementRef.current);
    }
  };

  useEffect(() => {
    if (observer && observer.current && current) {
      observer.current.unobserve(current);
    }
    observer.current = new ResizeObserver(callback);
    observe();

    return () => {
      if (observer && observer.current && elementRef && elementRef.current) {
        observer.current.unobserve(elementRef.current);
      }
    };
  }, [current]);
};

useObserver.propTypes = {
  elementRef: PropTypes.object,
  callback: PropTypes.func,
};

export default useObserver;
