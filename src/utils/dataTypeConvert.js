/**
 * @deprecated v0.5.3
 */
import Vue from 'vue'

export const convert = {
  transBeforeReq  (data) {
    for (const i in data) {
      if (typeof data[i] === 'boolean') {
        data[i] = data[i] === true ? '1' : '0'
      }

      // if is an array
      if (Array.isArray(data[i])) {
        data[i] = data[i].join(',')
      }
    }
    // console.log(data)
    return data
  },
  transAfterRes  (data, prop) {
    // prop can be an array or a tring type

    // 假如是物件
    if (data.length === undefined) {
      console.log('res-data is empty')
      return
    }

    // is "'1','2','3'" format
    data.forEach(el => {
      for (const i in el) {
        if (typeof el[i] === 'string' && el[i].indexOf(',') !== -1) {
          el[i] = el[i].split(',')
        }
      }
    })

    // for boolean props
    // is a string?
    if (prop && typeof prop === 'string') {
      data.forEach(el => {
        for (const i in el) {
          if (i === prop && typeof el[i] === 'string') {
            el[i] = !!+(el[i])
          }
        }
      })
    }
    // is an array?
    if (prop && Array.isArray(prop)) {
      data.forEach(el => {
        for (const i in el) {
          prop.forEach(el2 => {
            if (i === el2) {
              el[i] = !!+(el[i])
            }
          })
        }
      })
    }
    return data
  }
}

Vue.prototype._$dataTypeConvert = convert
