/**
 * 对处理返回的正常数据进行处理
 * 基于success的值进行处理success为false则抛错，true则正常
 * onSilenceOk 优先级高于 onOk
 * @template { {code: string, data: any, msg: string, retry: boolean, success: boolean} } T code 在200-300是正常的
 * @param {Promise<T>} response
 * @param {{
 *  onOk?: ((res: T) => false | void | string) | string,
 *  onSilenceOk?: ((res: T) => void) | true,
 *  onError?: ((res?: T) => false | void | string) | string | false,
 *  onUpdate?: () => boolean,
 *  dataFormat?:(data: any) => any
 * }} conf 返回false则意味着不进行弹窗提示, onError 中没有值则表示是其他错误，如状态码为非200时的错误,
 * onOk: 成功执行的方法，函数返回string则表示其作为提示信息,
 * onError: 失败执行的方法，函数返回string则表示其作为提示信息
 * onSilenceOk: 和onOk基本一致只是不弹出成功的信息,
 * onUpdate: 是否更新了请求（废弃上次的请求）
 * dataFormat: 处理数据
 */
export function fetchHandle(response, conf) {
  const { onOk, onError, onSilenceOk, onUpdate, dataFormat, params } = conf;
  const showOkMsg = !onSilenceOk;
  const onOkFn = onSilenceOk || onOk;
  // 是否废弃这次请求的数据处理
  const isAbandon = () => {
    return typeof onUpdate === 'function' && onUpdate() === true
  }
  return response
    .then(async(res) => {
      if (isAbandon()) return
      const successMsg = res.msg || 'success';
      if (typeof onOkFn === 'function') {
        if (typeof dataFormat === 'function') {
          res = dataFormat(res, { params })
        }
        const okMsg = onOkFn(res, { params });
        if (showOkMsg && okMsg !== false) {
          message.success(typeof okMsg === 'string' ? okMsg : successMsg);
        }
      } else if (showOkMsg) {
        message.success(onOkFn || successMsg);
      }
      return res;
    })
    .catch(async(res) => {
      const { response } = res
      if (isAbandon()) return
      const messageError = (msg) => {
        console.error(msg);
        if (onError !== false) {
          message.error(msg);
        }
      };
      
      if (response) {
        switch (response.status) {
          case 500:
          case 404:
          case 403:
            res = await response.json();
            messageError(res.msg)
            return;
          default:
            break;
        }
      }

      // checkError 中的逻辑，抛出来的是res if (json.success === false) {throw json;}
      if (res && res.success === false) {
        const errorMsg = res.msg || 'request failed';
        if (typeof onError === 'function') {
          const errMsg = onError(res);
          if (errMsg !== false) {
            messageError(typeof errMsg === 'string' ? errMsg : errorMsg);
          }
        } else {
          messageError(onError || errorMsg);
        }
        return res;
      } else {
        const getMsg = () => {
          return res != null && typeof res === 'object'
            ? res.msg || res.message
            : res;
        };
        if (typeof onError === 'function') {
          const errMsg = onError(res, params);
          if (errMsg !== false) {
            messageError(typeof errMsg === 'string' ? errMsg : getMsg());
          }
        } else {
          messageError(onError || getMsg());
        }
      }
    });
}
