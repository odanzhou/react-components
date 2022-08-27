import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import clxs from 'classnames';
import { Button } from 'antd';
import Particle from './utils';
import style from './style.less';

const ButtonConf = [
  {
    className: style.firstButton,
  },
  {
    className: style.secondButton,
    variant: 'outlined',
  },
];

/**
 * Banner 页
 * @param {{
 *  data: {
 *    buttonInfos: { text: string, url: string }[],
 *    projectIntroduce: string,
 *    projectName: string,
 *    pictureUrl: string,
 *    mPictureUrl: string,
 *  },
 * }} props
 */
const Spot = (props) => {
  const { data } = props;
  const { buttonInfos, projectIntroduce, projectName, pictureUrl, mPictureUrl } = data;
  const buttonList = useMemo(() => {
    return buttonInfos?.filter((item) => item.text && item.url) || [];
  }, [buttonInfos]);
  const canvasRef = useRef(null);
  const canvasStatusRef = useRef('pending');
  const arrRef = useRef([]);
  const isMobile = false;
  const { innerWidth: viewWidth, innerHeight: viewHeight } = window;
  const isApp = false;
  const height = viewHeight - (isApp ? 0 : isMobile ? 60 : 80);
  const _mediaUrl = isMobile ? mPictureUrl : pictureUrl;
  const onMouseMove = useCallback(
    (e) => {
      if (isMobile || canvasStatusRef.current !== 'rendered') {
        arrRef.current = [];
        return;
      }
      const { pageX: x, pageY: y } = e;
      const arr = arrRef.current.map((item) => {
        const dx = x - item.x;
        const dy = y - item.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 64) {
          const r = Math.atan2(dy, dx);
          // 继承原型链
          return Object.setPrototypeOf(
            {
              ...item,
              vx: -d * Math.cos(r),
              vy: -d * Math.sin(r),
            },
            Object.getPrototypeOf(item),
          );
        }
        return item;
      });

      arrRef.current = arr;
    },
    [isMobile],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    let timer;
    const cb = () => {
      arrRef.current = [];
      clearTimeout(timer);
    };
    if (!canvas || !_mediaUrl) {
      return cb;
    }
    const context = canvas.getContext('2d');
    const image = new Image(viewWidth, height);
    const particle_size = isMobile ? 5 : 10;
    image.crossOrigin = 'Anonymous';
    image.src = _mediaUrl + '?c=' + Date.now();
    image.onload = () => {
      canvas.width = viewWidth;
      canvas.height = height;
      context.drawImage(image, 0, 0, viewWidth, height);
      const idata = context.getImageData(0, 0, viewWidth, height);
      const imageData = idata.data;
      context.clearRect(0, 0, viewWidth, height);
      const arr = [];
      for (let y = 0; y < height; y += particle_size) {
        for (let x = 0; x < viewWidth; x += particle_size) {
          const o = x * 4 + y * 4 * idata.width;
          if (imageData[o + 3] > 210) {
            const c =
              'rgba(' +
              imageData[o] +
              ',' +
              imageData[o + 1] +
              ',' +
              imageData[o + 2] +
              ',' +
              imageData[o + 3] +
              ')';
            const p = new Particle(x, y, c, particle_size);
            p.x = Math.random() * viewWidth;
            p.y = Math.random() * height;
            arr.push(p);
          }
        }
      }
      arrRef.current = arr;
      update();
      render();
      canvasStatusRef.current = 'rendered';
    };
    function update() {
      const arr = arrRef.current;
      for (let i = 0, l = arr.length; i < l; i++) {
        arr[i].update();
      }
      timer = setTimeout(update, 1000 / 30);
    }

    function render() {
      context.clearRect(0, 0, viewWidth, height);
      const arr = arrRef.current;
      for (let i = 0, l = arr.length; i < l; i++) {
        arr[i].render(context);
      }
      requestAnimationFrame(render);
    }
    return cb;
  }, [_mediaUrl]);
  return (
    <div
      onMouseMove={onMouseMove}
      className={clxs(style.banner, {
        [style.bannerInApp]: isApp,
      })}
    >
      <div
        className={clxs(style.mediaContainer, {
          [style.mediaContainerInApp]: isApp,
        })}
      >
        <img className={style.media} src={_mediaUrl} />
        <canvas className={style.mediaCanvas} ref={canvasRef} />
      </div>
      <div className={style.infoContainer}>
        <div className={style.infoTitle}>{projectName}</div>
        <div className={style.infoDesc}>{projectIntroduce}</div>
        <div className={style.buttonContainer}>
          {buttonList.map(({ text, url }, index) => {
            if (!text && !url) return null;
            const { className, ...others } = ButtonConf[index];
            return (
              <a
                href={url || 'javascript: void(0);'}
                target={url ? '_blank' : '_self'}
                rel="noreferrer"
                key={index}
              >
                <Button className={clxs(style.button, className)} {...others}>
                  {text}
                </Button>
              </a>
            );
          })}
        </div>
      </div>
      <div className={style.mouseNoteContainer}>
        <div className={style.mouseLine} />
      </div>
    </div>
  );
};

export default Spot;
