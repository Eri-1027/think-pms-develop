/**
 * 資料格式化
 */
import _ from 'lodash'
export const createFormat = () => {
  /**
   * 給定字串，擷取需要的長度並加上 `...`
   * @param { string } item 給予字串
   * @param { number } number 從 0 的位置擷取需要的字串長度
   * @example
   * // getDotsAppendByString('hello world', 3)
   * // Output => 'hel...'
   * @returns string 如：hel...
   */
  const getDotsAppendByString = (item, number) => {
    return _.isString(item) && _.isNumber(number)
      ? item.length > number
        ? `${item.substr(0, number)}...`
        : item
      : item
  }

  /**
   * 給定陣列，轉為字串、擷取需要的長度並加上 `...`
   * @param { array } item 給予陣列。如：['101','102','103']
   * @param { number } number 從 0 的位置擷取需要的陣列長度。如 input:2 => output: ['101','102']
   * @param { string } spt
   * @example
   * // getDotsAppendBySplit(['101','102','103'], 2, ',')
   * // Output => 101, 102...
   * @returns {string}
   */
  const getDotsAppendBySplit = (item, number, spt) => {
    return _.isArray(item) && _.isNumber(number) && _.isString(spt)
      ? item.length > number
        ? `${item.slice(0, number).join(spt)}...`
        : item.join(spt)
      : ''
  }

  return {
    getDotsAppendByString,
    getDotsAppendBySplit
  }
}
