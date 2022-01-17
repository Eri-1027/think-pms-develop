<script>
import { mixinUtils } from '../mixins/utils.mixin'
const TDivider = () => import('@/components/TDivider')
/**
 * @requires ./TDivider.vue
 */
export default {
  components: {
    TDivider
  },
  mixins: [mixinUtils],
  props: {
    tItems: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      headers: [
        {
          text: '訂單編號',
          align: 'left',
          sortable: false,
          value: 'bookingNumber',
          class: ['primary', 'white--text'],
          width: 100
        },
        {
          text: '入住時間',
          align: 'left',
          sortable: false,
          value: 'stayingDays',
          class: ['primary', 'white--text'],
          width: 300
        },
        {
          text: '房號',
          align: 'left',
          sortable: false,
          value: 'roomNumber',
          class: ['primary', 'white--text'],
          width: 80
        },
        {
          text: '收款人員',
          align: 'left',
          sortable: false,
          value: 'staffName',
          class: ['primary', 'white--text'],
          width: 100
        },
        {
          text: '付款類型',
          align: 'left',
          sortable: false,
          value: 'paymentType',
          class: ['primary', 'white--text']

        },
        {
          text: '付款方式',
          align: 'left',
          sortable: false,
          value: 'paymentMethod',
          class: ['primary', 'white--text']

        },
        {
          text: '收款',
          align: 'right',
          sortable: false,
          value: 'paymentAmount',
          class: ['lightGrey', 'white--text']

        },
        {
          text: '應收',
          align: 'right',
          sortable: false,
          value: 'totalPrice',
          class: ['primary', 'white--text'],
          width: 150
        },
        {
          text: '備註',
          align: 'left',
          sortable: false,
          value: 'bookingNote',
          class: ['lightGrey', 'white--text']
        }
      ]
    }
  },
  computed: {
    displayPaymentAmounts () {
      return (item) => {
        if (item.paymentAmounts.length) {
          return item.paymentAmounts.map(amount => {
            amount = amount
              .toString()
              .replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
            return amount
          }).join(' / ')
        }
      }
    }
  },
  methods: {
    dialogHandler (type, item) {
      this.$emit('dialog', {
        type,
        bookingId: item.bookingId
      })
    }
  }
}
</script>

<template>
  <div class="components__tTableDailyReport">
    <TDivider>
      {{ $date(tItems[0].paymentDatetime).format('YYYY/MM/DD') }}
    </TDivider>
    <v-card outlined>
      <v-data-table
        :headers="headers"
        hide-default-footer
        :items="tItems"
      >
        <template v-slot:[`item.bookingNumber`]="{item}">
          <v-btn
            class="success--text pa-0"
            text
            @click.stop="dialogHandler('ORDER_ORDER_INFO',item)"
          >
            {{ `# ${item.bookingNumber}` }}
          </v-btn>
        </template>
        <template v-slot:[`item.stayingDays`]="{item}">
          {{ $date(item.expectedCheckInTime).format('YYYY/MM/DD') }} - {{ $date(item.expectedCheckOutTime).format('YYYY/MM/DD') }}
        </template>
        <template v-slot:[`item.staffName`]="{item}">
          {{
            item.staffName
              ? item.staffName
              : '－－'
          }}
        </template>
        <template v-slot:[`item.paymentType`]="{item}">
          {{ paymentType(item.paymentType) }}
        </template>
        <template v-slot:[`item.paymentMethod`]="{item}">
          {{ paymentMethods(item.paymentMethod) }}
        </template>
        <template v-slot:[`item.paymentAmount`]="{item}">
          <template v-if="item.paymentAmounts.length">
            <span>{{ displayPaymentAmounts(item) }}</span>
          </template>
          <span v-else>－－</span>
        </template>
        <template v-slot:[`item.totalPrice`]="{item}">
          <span
            v-if="item.totalPrice !== 0"
            v-math:round="item.totalPrice"
            v-price="item.totalPrice"
          />
          <span v-else>－－</span>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
