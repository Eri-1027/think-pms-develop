import PRICE from '../../constants/price'
import { createPrice } from '../../utils/create/createPrice'

const actions = {
  async updateDifference ({ state, commit }, { e }) {
    try {
      const config = {
        type: PRICE.PRICE_UPDATE_TOTAL,
        bookingId: state.bookingId,
        price: e
      }
      const price = createPrice()
      const priceItem = await price.getPrice(config)
      commit('SET_PRICE_ITEM', {
        price: priceItem.difference,
        payment: state.payment,
        difference: state.difference
      })
    } catch (err) {
      console.log(err)
    }
  }
}

export default {
  namespaced: true,
  actions
}
