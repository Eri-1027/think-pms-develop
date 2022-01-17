import { createCustomer } from '@/utils/create/createCustomer'
const customer = createCustomer()

describe('createCustomer', () => {
  it('createSearchingByOrder should return an Async Function', async () => {
    const config = {
      searchOrder: '1',
      searchType: '1'
    }
    const fn = customer.createSearchingByOrder(config)
    const isAsync = fn.constructor.name === 'AsyncFunction'
    expect(isAsync).toBe(true)
  })
})
