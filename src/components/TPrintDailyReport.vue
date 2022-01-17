<script>
import { mapState } from 'vuex'
const TTableDailyReport = () => import('@/components/TTableDailyReport')
/**
 * 住房日報列印
 * @requires ./TTableDailyReport.vue
 */
export default {
  components: {
    TTableDailyReport
  },
  props: {
    tDailyPriceData: {
      type: Object,
      default: () => {}
    },
    tDailyPriceAndType: {
      type: Object,
      default: () => {}
    },
    dailyReportData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapState({
      showPrintDailyReport: state => state.print.dailyReport
    })
  }
}
</script>

<template>
  <div
    v-if="showPrintDailyReport"
    class="c_printDailyReport d-none d-print-block"
  >
    <table class="print__table">
      <tr>
        <th>收款：</th>
        <th>現金：</th>
        <th>信用卡：</th>
        <th>轉帳：</th>
        <th>其它：</th>
        <th>應收：</th>
        <th>待收：</th>
      </tr>
      <tr>
        <td>{{ tDailyPriceData.payments }}</td>
        <td>{{ tDailyPriceAndType.cashAmount }}</td>
        <td>{{ tDailyPriceAndType.creditAmount }}</td>
        <td>{{ tDailyPriceAndType.transAmount }}</td>
        <td>{{ tDailyPriceAndType.othersAmount }}</td>
        <td>{{ tDailyPriceData.price }}</td>
        <td>{{ tDailyPriceData.difference }}</td>
      </tr>
    </table>
    <div
      v-for="(rowItem,index) in dailyReportData"
      :key="index"
    >
      <t-table-daily-report
        :t-items="rowItem"
      />
    </div>
  </div>
</template>

<style lang="scss">
.c_printDailyReport {
  position: absolute;
  left: -52px;
  table.print__table {
    font-family: arial, sans-serif;

    width: 100%;

    border-collapse: collapse;
    td ,
    th {
      padding: 8px;

      text-align: center;

      border: 1px solid #ddd;
    }
  }
}
</style>
