import { createValidate } from '@/src/utils/helpers/createValidate'

describe('createValidate', () => {
  it('isHasFetch should be `true` with fetchData', () => {
    const fetchData = {
      JWT: {},
      fetch: {
        prop1: 1
      },
      success: true
    }
    const _v = createValidate({ fetchData })
    const result = _v.isHasFetch(fetchData)
    expect(result).toBe(true)
  })

  it('isHasFetch should be `false` with fetchData', () => {
    const fetchData = {
      JWT: {},
      fetch: {},
      success: true
    }
    const _v = createValidate({ fetchData })
    const result = _v.isHasFetch(fetchData)
    expect(result).toBe(false)
  })

  it('isHasFetch should be `false` with fetchData doesnt contain prop fetch', () => {
    const fetchData = {
      JWT: {},
      success: true
    }
    const _v = createValidate({ fetchData })
    const result = _v.isHasFetch(fetchData)
    expect(result).toBe(false)
  })

  // it('isHasProps should return true with `apple, banana, orange`', () => {
  //   const props = ['apple', 'banana', 'orange']
  //   const data = {
  //     apple: 1,
  //     banana: 2,
  //     orange: 3
  //   }
  //   const fetchData = {
  //     JWT: {},
  //     success: true
  //   }
  //   const _v = createValidate({ fetchData })
  // })
})
