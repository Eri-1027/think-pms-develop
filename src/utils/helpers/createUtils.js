export const createUtils = () => {
  // helpers
  const getSortedByProp = (items, prop, asc) => {
    return items && items.length
      ? items.sort((a, b) => {
        return a[prop]
          ? asc
            ? (+a[prop]) - (+b[prop])
            : (+b[prop]) - (+a[prop])
          : 0
      })
      : []
  }

  // hash
  const getHash = (str, algo = 'SHA-256') => {
    const strBuf = new TextEncoder('utf-8').encode(str)
    return crypto.subtle.digest(algo, strBuf).then(hash => {
      window.hash = hash
      // here hash is an arrayBuffer,
      // so we'll connvert it to its hex version
      let result = ''
      const view = new DataView(hash)
      for (let i = 0; i < hash.byteLength; i += 4) {
        result += ('00000000' + view.getUint32(i).toString(16)).slice(-8)
      }
      return result
    })
  }

  // timer
  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // data type convert
  const createConvertFunction = setting => {
    switch (setting) {
      case 'TO_BOOLEAN':
        return getPropsBoolean
      default:
        break
    }
  }

  const getPropsBoolean = (props, fetchs) => {
    return fetchs.map(fetch => {
      props.forEach(prop => {
        if (
          fetch[prop] &&
          typeof prop === 'string' &&
          (fetch[prop] === '1' || fetch[prop] === '0')
        ) {
          fetch[prop] = !!+fetch[prop]
        }
      })
      return fetch
    })
  }

  /**
   *
   * @param { array } props props want to convert
   * @param { string } setting type want to convert to
   * @param { array } fetchs fetch data
   * @returns { array }
     example:
    const fetchs = [{
     isAvailable:"1",
     isSuccess:"0",
     otherProp:{}
    }]

    getResponseModified('isAvailable','TO_BOOLEAN',fetchs)

    [{
     isAvailable:true,
     isSuccess:"0",
     otherProp:{}
    }]
   */
  const getResponseModified = (props, setting, fetchs) => {
    const isSetting = typeof setting === 'string'
    const isProps = Array.isArray(props) && props.length
    const isFetchs = Array.isArray(fetchs) && fetchs.length
    return isSetting && isProps && isFetchs
      ? createConvertFunction(setting)(props, fetchs)
      : []
  }

  // object
  const pickProps = (obj, keys) => {
    return keys
      .map(k => k in obj ? { [k]: obj[k] } : {})
      .reduce((res, o) => Object.assign(res, o), {})
  }

  return {
    sleep,
    getResponseModified,
    getHash,
    pickProps,
    getSortedByProp
  }
}
