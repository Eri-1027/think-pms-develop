<script>
/**
 * 選取日期
 */
export default {
  props: {
    date: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    min: {
      type: String,
      default: ''
    },
    prependInnerIcon: {
      type: String,
      default: ''
    },
    appendIcon: {
      type: String,
      default: ''
    },
    tClass: {
      type: String,
      default: ''
    },
    tOutlined: {
      type: Boolean,
      default: true
    },
    tSingleLine: {
      type: Boolean,
      default: false
    },
    tHideDetails: {
      type: Boolean,
      default: false
    },
    tSolo: {
      type: Boolean,
      default: false
    },
    tStyle: {
      type: String,
      default: ''
    },
    tNoTitle: {
      type: Boolean,
      default: true
    },
    tHeight: {
      type: String,
      default: '30'
    },
    tRequired: {
      type: Boolean,
      default: false
    },
    tErrors: {
      type: Array,
      default: () => []
    },
    tDisabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      modal: false
    }
  },
  methods: {
    pickDate (date) {
      this.$emit('pick-date', date)
      this.modal = false
    }
  }
}
</script>

<template>
  <v-dialog
    ref="dialog"
    v-model="modal"
    width="290px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-bind="attrs"
        :append-icon="appendIcon"
        :class="tClass"
        dense
        :disabled="tDisabled"
        :error-messages="tErrors"
        :height="tHeight"
        :hide-details="tHideDetails"
        :label="label"
        :no-title="tNoTitle"
        :outlined="tOutlined"
        :prepend-inner-icon="prependInnerIcon"
        readonly
        :required="tRequired"
        :single-line="tSingleLine"
        :solo="tSolo"
        :style="tStyle"
        :value="date"
        v-on="on"
        @input="pickDate($event)"
      />
    </template>
    <v-date-picker
      color="primary"
      :min="min"
      :no-title="tNoTitle"
      :value="date"
      width="290"
      @input="pickDate"
    />
  </v-dialog>
</template>
