import { createDialog } from '../../../../src/utils/create/createDialog'
const _dialog = createDialog()

describe('createDialog', () => {
  it('setDialog should return boolean', async () => {
    const result = await _dialog.setDialog({ autoClose: true, type: 'success', msg: 'test success' })
    expect(result).toBe(true)
  })
})
