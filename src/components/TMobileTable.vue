<script>
/**
 * 響應式 > 表格(用在哪需要找找)
 */
export default {
  props: {
    orderInfo: {
      type: Object,
      default: () => {}
    }
  }
}
</script>

<template>
  <div class="t-component__mobile">
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              <v-simple-checkbox />
            </th>
            <th class="text-left">
              房號
            </th>
            <th class="text-left">
              {{ orderInfo }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(order,index) in orders"
            :key="index"
          >
            {{ order }}
            <td>{{ item.name }}</td>
            <td>{{ item.calories }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>
