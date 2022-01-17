<script>
export default {
  props: {
    tMaxWidth: {
      type: String,
      default: '290'
    },
    tIconText: {
      type: String,
      default: ''
    },
    tIconColor: {
      type: String,
      default: 'primary'
    },
    tConfirmText: {
      type: String,
      default: ''
    },
    tSubTitle: {
      type: String,
      default: ''
    },
    tActions: {
      type: Boolean,
      default: false
    },
    tDialog: {
      type: Boolean,
      default: false
    },
    tPersistent: {
      type: Boolean,
      default: false
    },
    tIcon: {
      type: Boolean,
      default: false
    },
    tTextClass: {
      type: String,
      default: 'title'
    },
    // 以下為尚未啟用的功能
    tTimer: {
      type: Boolean,
      defalut: false
    },
    tTimeOut: {
      type: Number,
      default: 500
    }
  },
  data () {
    return {
      timer: null
    }
  },
  created () {
    this.setTimer()
  },
  beforeDestroy () {
    window.clearTimeout(this.timer)
  },
  methods: {
    setTimer () {
      this.timer = window.setTimeout(() => {
        this.$emit('close-dialog')
      }, this.tTimeOut)
    }
  }
}
</script>

<template>
  <div class="components__tDialogConfirm">
    <v-dialog
      :max-width="400"
      :persistent="tPersistent"
      :value="tDialog"
    >
      <v-card>
        <v-card-title class="d-flex justify-center">
          <slot name="title" />
          <v-icon
            v-if="tIcon"
            :color="tIconColor"
            x-large
          >
            {{ tIconText }}
          </v-icon>
        </v-card-title>
        <v-card-text class="d-flex justify-center py-0">
          <slot name="sub-title" />
        </v-card-text>
        <v-card-text class="d-flex justify-center py-0">
          <slot name="text" />
        </v-card-text>
        <v-card-text class="d-flex justify-center py-0">
          <p :class="tTextClass">
            {{ tConfirmText }}
          </p>
        </v-card-text>

        <v-card-actions
          v-show="tActions"
          class="d-flex justify-center"
        >
          <slot name="actions" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
