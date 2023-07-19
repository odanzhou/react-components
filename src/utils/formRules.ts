import { WrappedFormUtils } from 'antd/lib/form/Form'
import moment from 'moment'
import { getLangTextId } from 'src/components/Form/constants'
import { precision2float, isMinStep, valIsEmpty } from './helper'

/**
 * 判断值是否为空值或者false
 * @param {*} val
 */
const valIsEmptyOrFalse = val => val === false || valIsEmpty(val);

/**
 * 最大值规则
 * @param {number} max 
 * @param {stirng} [title] 
 */
export const maxRules = (max, title='') => [{
  max,
  message: `${title ? title + ' ' : ''}cannot be longer than ${max} characters`,
}]

/**
 * 多字段依赖规则
 * @param {WrappedFormUtils} form 
 * @param {string | ((form) => any)} field 
 * @param {{
 *  msg?: string,
 *  useLang?: boolean,
 *  show?: bolean,
 *  showRely?: boolean,
 *  isArr?: boolean,
 * }} [conf] useLang 依赖字段是否使用多语言
 * @param { (value, relyVal, msg) => void } errHandle
 */
const relyRulesHandle = (form, field, conf = {}, errHandle) => {
  const { msg, useLang = false, show = true, relyMsg, isArr = true } = conf
  let { showRely } = conf
  const getRelyVal = typeof field === 'function' ?
    field : () => form?.getFieldValue(getLangTextId(field, useLang))
  if(typeof showRely !== 'boolean') {
    showRely = !!relyMsg
  }
  const res = {
    validator: async (rule, value) => {
      const relyVal = getRelyVal(form)
      if(show) {
        errHandle?.(value, relyVal, msg, conf)
      }
      if(showRely) {
        errHandle?.(relyVal, value, relyMsg, conf)
      }
    }
  }
  return isArr ? [res] : res
}

const ruleErrorHandle = (value, relyVal, msg) => {
  if(valIsEmptyOrFalse(value) && !valIsEmptyOrFalse(relyVal)) {
    throw new Error(msg || `${ value === false ? '必选' : '不能为空'}`);
  }
}

/**
 * 依赖规则，当依赖的字段不为空时，当前字段不能为空
 * @param {Parameters<relyRulesHandle>[0]} form 
 * @param {Parameters<relyRulesHandle>[1]} field 
 * @param {Parameters<relyRulesHandle>[2]} [conf]
 */
export const relyRules = (form, field, conf) => {
  return relyRulesHandle(form, field, conf, ruleErrorHandle)
}

const requiredOneErrorHandle = (value, relyVal, msg) => {
  if(valIsEmptyOrFalse(value) && valIsEmptyOrFalse(relyVal) ) {
    throw new Error(msg || `${ value === false ? '必选' : '不能为空'}`);
  }
}

/**
 * 选一规则，所有字段中必须存在至少一个值
 * @param {Parameters<relyRulesHandle>[0]} form 
 * @param {Parameters<relyRulesHandle>[1]} field 
 * @param {Parameters<relyRulesHandle>[2]} [conf]
 */
export const requiredOneRules = (form, field, conf) => {
  return relyRulesHandle(form, field, conf, requiredOneErrorHandle)
}

/**
 * 时间校验
 * @param {{
 *  msg?: string,
 *  getMoment?: (moment: Moment) => Moment,
 *  allowEqual?: boolean,
 * }} conf
 */
export const dateValidator = (conf) => {
  const { msg, getMomment, allowEqual = true } = conf || {}
  const handler = (value, dateValue) => {
    if (value && value.valueOf){
      const valueTime = value.valueOf()
      const isError = allowEqual ? valueTime <= dateValue : valueTime < dateValue
      if (isError) {
        throw new Error(msg || '必须大于当前时间')
      }
    }
  }
  return {
    validator: async (rule, value) => {
      const momentIns = moment()
      const dateValue = (getMomment?.(momentIns) || momentIns).valueOf();
      if(Array.isArray(value)) {
        for(let valueItem of value) {
          handler(valueItem, dateValue)
        }
      } else {
        handler(value, dateValue)
      }
    }
  }
}

/**
 * 未来时间校验
 */
export const futureDate = dateValidator()

/**
 * 差 n 分钟时间校验
 * @param {number} n
 */
export const nMinuteDateValidator = (n) => dateValidator({ getMoment: m => m.add(n, 'm'), msg: `必须大于当前时间${n}分钟以上` })

const nMinuteEndDateErrorHandle = (value, relyVal, msg, { n, label = '开始时间', isGT = false}) => {
  if(!valIsEmptyOrFalse(value) && !valIsEmptyOrFalse(relyVal) ) {
    // isGT: 是否大于等于符号
    const showErr = isGT ? value.isAfter(moment(relyVal).add(n, 'm'), 'minute') :
    value.isBefore(moment(relyVal).add(n, 'm'), 'minute')
    if(showErr) {
      throw new Error(msg || `必须大于等于${label}${n}分钟以上`);
    }
  }
}
/**
 * 结束时间大于开始时间n分钟
 * @param {Parameters<relyRulesHandle>[0]} form 
 * @param {Parameters<relyRulesHandle>[1]} field 
 * @param {Parameters<relyRulesHandle>[2]} [conf]
 */
export const nMinuteEndDateRules = (form, field, conf) => {
  return relyRulesHandle(form, field, conf, nMinuteEndDateErrorHandle)
}

const endDateErrorHandle = (value, relyVal, msg) => {
  if(!valIsEmptyOrFalse(value) && !valIsEmptyOrFalse(relyVal) ) {
    if(value.valueOf() <= relyVal.valueOf()) {
      throw new Error(msg || `必须大于开始时间`);
    }
  }
}

/**
 * 结束时间大于开始时间
 * @param {Parameters<relyRulesHandle>[0]} form 
 * @param {Parameters<relyRulesHandle>[1]} field 
 * @param {Parameters<relyRulesHandle>[2]} [conf]
 */
export const endDateRules = (form, field, conf) => {
  return relyRulesHandle(form, field, conf, endDateErrorHandle)
}

const floorNumErrorHandle = (value, relyVal, msg) => {
  if(!valIsEmptyOrFalse(value) && !valIsEmptyOrFalse(relyVal) ) {
    if(+value <= +relyVal) {
      throw new Error(msg || `必须大于下限数`);
    }
  }
}

/**
 * 上线数据大于下限数据
 * @param {Parameters<relyRulesHandle>[0]} form 
 * @param {Parameters<relyRulesHandle>[1]} field 
 * @param {Parameters<relyRulesHandle>[2]} [conf]
 */
export const floorNumRules = (form, field, conf) => {
  return relyRulesHandle(form, field, conf, floorNumErrorHandle)
}

const disabledErrorHandle = (value, relyVal, msg) => {
  if(valIsEmptyOrFalse(relyVal) && !valIsEmptyOrFalse(value)) {
    throw new Error(msg || `不允许设置`);
  }
}

/**
 * 禁用规则（依赖值不存在时，当前值不允许设置）
 * @param {Parameters<relyRulesHandle>[0]} form 
 * @param {Parameters<relyRulesHandle>[1]} field 
 * @param {Parameters<relyRulesHandle>[2]} [conf]
 */
export const disabledRules = (form, field, conf) => {
  return relyRulesHandle(form, field, conf, disabledErrorHandle)
}

const mutexErrorHandle = (value, relyVal, msg) => {
  if(valIsEmptyOrFalse(relyVal) && valIsEmptyOrFalse(value)) {
    throw new Error(msg || `必须设置`);
  }
  if(!valIsEmptyOrFalse(relyVal) && !valIsEmptyOrFalse(value)) {
    throw new Error(msg || `不允许设置`);
  }
}

/**
 * 互斥规则（依赖值不存在时，当前值允许设置）
 * @param {Parameters<relyRulesHandle>[0]} form 
 * @param {Parameters<relyRulesHandle>[1]} field 
 * @param {Parameters<relyRulesHandle>[2]} [conf]
 */
export const mutexRules = (form, field, conf) => {
  return relyRulesHandle(form, field, conf, mutexErrorHandle)
}

const isUsableNum = (val, baseVal, isEqual = false) => {
  return isEqual ? val <= baseVal : val < baseVal
}

const equalMsg = (isEqual) => isEqual ? '等于' : ''

/**
 * 数值最大最小值校验
 */
export const numValidator = ({ min, minEqual = false, minMsg, max, maxEqual = false, maxMsg, errorMsg }) => ({
  validator: async (rule, value) => {
    if(valIsEmpty(value) || (valIsEmpty(min) && valIsEmpty(max))) return
    const val = Number(value)
    if(Number.isNaN(val)) throw new Error(errorMsg || '请输入正确的数值')
    if(!valIsEmpty(min) && !isUsableNum(min, val, minEqual)) {
      throw new Error(minMsg || `可输入的最小值大于${equalMsg(minEqual)}${min}`)
    }
    if(!valIsEmpty(max) && !isUsableNum(val, max, minEqual)) {
      throw new Error(maxMsg || `可输入的最大值小于${equalMsg(maxEqual)}${max}`)
    }
  }
})

/**
 * 精度校验规则
 * @param {number} precision
 * @param {Record<string, any>} [conf]
 */
export const precisionValidator = (precision, conf) => {
  const { msg } = conf || {}
  const precesionVal = precision2float(precision)
  return {
    validator: async(rule, value) => {
      if(!valIsEmpty(value) && !valIsEmpty(precesionVal) && !isMinStep(value, precesionVal)) {
        throw new Error(msg || `不符合精度要求：${precesionVal}`)
      }
    },
  }
}
