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
