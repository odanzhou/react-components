import Decimal from 'decimal.js/decimal';

/**
 * 精度转小数格式，eg. 8 -> 0.00000001
 */
export const precision2float = (precision) => {
  // precision必须是正整数
  if (!/(^[1-9]\d*$)/.test(precision)) {
    return 0;
  }
  return new Decimal(10).pow(-1 * precision).toFixed();
};

/**
 * 判断值是否为空值
 * @param {*} val
 */
export const valIsEmpty = val => val == null || String(val).trim() === '';

/**
 * 判断是否满足最小精度
 * @param {any} val
 * @param {number} step
 */
export const isMinStep = (val, step) => {
  return +Decimal.mod(val, step || 1).toFixed() === 0;
};
