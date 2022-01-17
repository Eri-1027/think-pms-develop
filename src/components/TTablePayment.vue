<script>
/**
 * 結帳作業 > 表格
 */
export default {
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
          class: ['primary', 'white--text']
        },
        {
          text: '房號',
          align: 'left',
          sortable: false,
          value: 'roomNumber',
          class: ['primary', 'white--text']
        },
        {
          text: '收款人員',
          align: 'left',
          sortable: false,
          value: 'staffName',
          class: ['primary', 'white--text']
        },
        {
          text: '收款金額',
          align: 'right',
          sortable: false,
          value: 'paymentAmount',
          class: ['lightGrey', 'white--text']
        },
        {
          text: '收款時間',
          align: 'left',
          sortable: false,
          value: 'paymentDatetime',
          class: ['primary', 'white--text']
        },
        {
          text: '備註',
          align: 'left',
          sortable: false,
          value: 'paymentNote',
          class: ['primary', 'white--text']
        }
      ]
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
  <v-card outlined>
    <v-data-table
      :footer-props="{
        itemsPerPageText:'每頁顯示',
        itemsPerPageAllText:'全部',
        firstIcon:'mdi-chevron-double-left',
        lastIcon:'mdi-chevron-double-right',
        prevIcon:'mdi-chevron-left',
        nextIcon:'mdi-chevron-right'
      }"
      :headers="headers"
      :hide-default-footer="tItems.length === 1 ? true : false"
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
      <template v-slot:[`item.staffName`]="{item}">
        {{
          item.staffName
            ? item.staffName
            : '－－'
        }}
      </template>
      <template v-slot:[`item.paymentAmount`]="{item}">
        <span
          v-if="item.paymentAmount !== '0'"
          v-math:round="item.paymentAmount"
          v-price="item.paymentAmount"
        />
        <span v-else>
          －－
        </span>
      </template>
    </v-data-table>
  </v-card>
</template>
