<script>
import { mapState } from 'vuex'
import { mixinPayment } from '../mixins/payment.mixin'
import { mixinRoomActions } from '../mixins/roomActions.mixin'
import { createDialog } from '../utils/helpers/createDialog'
/**
 * 頁面用來放所有新增收款元件（這裡需要重構，新增收款明顯只需要一個元件）
 * @requires ./TDialogPayment.vue
 */
export default {
  mixins: [
    mixinPayment,
    mixinRoomActions
  ],
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    ...mapState({
      // page-payment
      price: state => state.price.price,
      payments: state => state.price.payments,
      difference: state => state.price.difference,
      discounts: state => state.price.discounts,
      bookingId: state => state.price.bookingId,
      bookingDetailId: state => state.price.bookingDetailId,
      bookingNumber: state => state.price.bookingNumber,
      staffItems: state => state.payment.staffItems,
      // 以下 discountItems, tempChangeRoom 換房使用
      discountItems: state => state.changeRoom.discountItems,
      tempChangeRoom: state => state.changeRoom.tempChangeRoom,
      // dialog
      dialogPaymentAfterInsertBooking: state => state.dialog.map.paymentAfterInsertBooking,
      dialogPaymentAfterInsertRestBooking: state => state.dialog.map.paymentAfterInsertRestBooking,
      dialogPaymentUnCheckIn: state => state.dialog.map.paymentUnCheckIn,
      dialogPaymentAfterCheckOut: (state) =>
        state.dialog.map.paymentAfterCheckOut,
      dialogPaymentExtra: state => state.dialog.map.paymentExtra,
      dialogPaymentKeepPrice: state => state.dialog.map.paymentKeepPrice
    })
  },
  created () {
    this.dialog = createDialog()
  },
  methods: {
    /**
     * 透過選擇專案拿到新價格
     * @public
     * @param {object} {discountId}
     */
    showNewPrice ({ discountId }) {
      this.$bus.$emit('get-new-price-by-discount', { discountId })
    }
  }
}
</script>
<template>
  <div>
    <!-- after-insert-booking -->
    <t-dialog-payment
      ref="paymentInsertBooking"
      :t-dialog="dialogPaymentAfterInsertBooking"
      :t-payment-item-difference="difference"
      :t-payment-item-paid="payments"
      :t-payment-item-total="price"
      :t-payment-methods-items="paymentMethodsItems"
      t-payment-source="PAYMENT_INSERT_BOOKING"
      :t-payment-type-items="paymentTypeItems"
      :t-staff-items="cashStaffItems"
      :t-temp-payment="tempPayment"
      :t-temp-payment-methods="tempPaymentMethods"
      @add-payment-methods="addPaymentMethods"
      @close-dialog="dialog.afterSetDialog({type:'paymentAfterInsertBooking',show:false},{afterAction:'clear-temp-payment'})"
      @delete-payment-methods="deletePaymentMethods"
      @payment="handleClickPayment('PAYMENT_INSERT_BOOKING','paymentFather')"
      @set-price-as-payment-amount="setPriceAsPaymentAmount"
      @update-payment-item-total="handleClickUpdatePaymentItemTotal"
    />

    <!-- after-insert-rest-booking-->
    <t-dialog-payment
      ref="paymentInsertRestBooking"
      :t-dialog="dialogPaymentAfterInsertRestBooking"
      :t-payment-item-difference="difference"
      :t-payment-item-paid="payments"
      :t-payment-item-total="price"
      :t-payment-methods-items="paymentMethodsItems"
      t-payment-source="PAYMENT_INSERT_REST_BOOKING"
      :t-payment-type-items="paymentTypeItems"
      :t-staff-items="cashStaffItems"
      :t-temp-payment="tempPayment"
      :t-temp-payment-methods="tempPaymentMethods"
      @add-payment-methods="addPaymentMethods"
      @close-dialog="dialog.afterSetDialog({type:'paymentAfterInsertRestBooking',show:false},{afterAction:'clear-temp-payment'})"
      @delete-payment-methods="deletePaymentMethods"
      @payment="handleClickPayment('PAYMENT_INSERT_REST_BOOKING','paymentFather')"
      @set-price-as-payment-amount="setPriceAsPaymentAmount"
      @update-payment-item-total="handleClickUpdatePaymentItemTotal"
    />

    <!-- un-check-in-->
    <t-dialog-payment
      ref="paymentUnCheckIn"
      :t-dialog="dialogPaymentUnCheckIn"
      :t-payment-item-difference="difference"
      :t-payment-item-paid="payments"
      :t-payment-item-total="price"
      :t-payment-methods-items="paymentMethodsItems"
      t-payment-source="PAYMENT_UNCHECKIN"
      :t-payment-type-items="paymentTypeItems"
      :t-staff-items="cashStaffItems"
      :t-temp-payment="tempPayment"
      :t-temp-payment-methods="tempPaymentMethods"
      @add-payment-methods="addPaymentMethods"
      @close-dialog="dialog.afterSetDialog({type:'paymentUnCheckIn',show:false},{afterAction:'clear-temp-payment'})"
      @delete-payment-methods="deletePaymentMethods"
      @payment="handleClickPayment('PAYMENT_UNCHECKIN','paymentFather')"
      @set-price-as-payment-amount="setPriceAsPaymentAmount"
      @update-payment-item-total="handleClickUpdatePaymentItemTotal"
    />

    <!-- after-check-out-->
    <t-dialog-payment
      ref="paymentCheckOut"
      :t-dialog="dialogPaymentAfterCheckOut"
      :t-payment-item-difference="difference"
      :t-payment-item-paid="payments"
      :t-payment-item-total="price"
      :t-payment-methods-items="paymentMethodsItems"
      t-payment-source="PAYMENT_CHECKOUT"
      :t-payment-type-items="paymentTypeItems"
      :t-staff-items="cashStaffItems"
      :t-temp-payment="tempPayment"
      :t-temp-payment-methods="tempPaymentMethods"
      @add-payment-methods="addPaymentMethods"
      @close-dialog="dialog.afterSetDialog({type:'paymentAfterCheckOut',show:false},{afterAction:'clear-temp-payment'})"
      @delete-payment-methods="deletePaymentMethods"
      @payment="handleClickPayment('PAYMENT_CHECKOUT','checkOutPaymentFather')"
      @set-price-as-payment-amount="setPriceAsPaymentAmount"
      @update-payment-item-total="handleClickUpdatePaymentItemTotal"
    />

    <!-- extra -->
    <t-dialog-payment
      ref="paymentExtraPayment"
      :t-dialog="dialogPaymentExtra"
      :t-payment-item-difference="difference"
      :t-payment-item-paid="payments"
      :t-payment-item-total="price"
      :t-payment-methods-items="paymentMethodsItems"
      t-payment-source="PAYMENT_EXTRA_PAYMENT"
      :t-payment-type-items="paymentTypeItems"
      :t-staff-items="cashStaffItems"
      :t-temp-payment="tempPayment"
      :t-temp-payment-methods="tempPaymentMethods"
      @add-payment-methods="addPaymentMethods"
      @close-dialog="dialog.afterSetDialog({type:'paymentExtra',show:false},{afterAction:'clear-temp-payment'})"
      @delete-payment-methods="deletePaymentMethods"
      @payment="handleClickPayment('PAYMENT_EXTRA_PAYMENT','payment')"
      @set-price-as-payment-amount="setPriceAsPaymentAmount"
      @update-payment-item-total="handleClickUpdatePaymentItemTotal"
    />
    <!-- keep price -->
    <template v-if="Object.keys(tempChangeRoom)">
      <t-dialog-payment
        ref="paymentChangeRoom"
        :t-dialog="dialogPaymentKeepPrice"
        :t-discount-type="tempChangeRoom.discountType"
        :t-payment-item-difference="difference"
        :t-payment-item-paid="payments"
        :t-payment-item-total="price"
        :t-payment-methods-items="paymentMethodsItems"
        t-payment-source="PAYMENT_CHANGE_ROOM"
        :t-payment-type-items="paymentTypeItems"
        :t-staff-items="cashStaffItems"
        :t-temp-payment="tempPayment"
        :t-temp-payment-methods="tempPaymentMethods"
        @add-payment-methods="addPaymentMethods"
        @close-dialog="dialog.afterSetDialog({type:'paymentKeepPrice',show:false},{afterAction:'clear-temp-payment'})"
        @delete-payment-methods="deletePaymentMethods"
        @payment="handleClickPayment('PAYMENT_CHANGE_ROOM','formNewPricePayment')"
        @set-price-as-payment-amount="setPriceAsPaymentAmount"
        @update-payment-item-total="handleClickUpdatePaymentItemTotal"
      >
        <template v-slot:discountType>
          <v-select
            class="py-1 px-2"
            dense
            height="22"
            hide-details
            :items="discountItems"
            label="選擇專案"
            single-line
            style="width:100px;"
            :value="tempChangeRoom.discountId"
            @input="showNewPrice({
              discountId:$event
            })"
          />
        </template>
      </t-dialog-payment>
    </template>
  </div>
</template>
