<script>
export default {
  props: {
    subHeader: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>
<template>
  <div>
    <v-subheader>
      {{ subHeader }}
    </v-subheader>
    <template v-if="items && items.length">
      <v-list-item
        v-for="item in items"
        :key="item.title"
        exact
        exact-active-class="active"
        :to="{name:item.name}"
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>{{ item.title }}</v-list-item-content>
      </v-list-item>
    </template>
  </div>
</template>
