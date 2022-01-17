<script>
import {
  mapState,
  mapMutations
} from 'vuex'
import { createDialog } from '../utils/helpers/createDialog'
import TDialogConfirm from './TDialogConfirm.vue'
import TDialogAnimation from './TDialogAnimation.vue'

export default {
  components: {
    TDialogConfirm,
    TDialogAnimation
  },
  data () {
    return {
      dialog: null
    }
  },
  computed: {
    ...mapState({
      map: state => state.dialog.map,
      msg: state => state.dialog.msg,
      payload: state => state.dialog.payload
    })
  },
  created () {
    this.dialog = createDialog()
  },
  methods: {
    ...mapMutations([
      'dialog/SET_DIALOG'
    ]),
    async setDialog ({
      msg,
      type,
      show
    }) {
      this['dialog/SET_DIALOG']({
        msg,
        type,
        show
      })
    },
    setAction ({ callback }) {
      this.$emit('action', {
        fn: callback[0],
        payload: callback[1]
      })
    }
  }
}
</script>
<template>
  <div>
    <!-- success -->
    <t-dialog-confirm
      :t-confirm-text="msg"
      :t-dialog="map.success"
    >
      <template #text>
        <t-sign-animation
          :t-sign-type="'success'"
        />
      </template>
    </t-dialog-confirm>

    <!-- failed -->
    <t-dialog-confirm
      :t-confirm-text="msg"
      :t-dialog="map.failed"
    >
      <template #text>
        <t-sign-animation
          :t-sign-type="'failed'"
        />
      </template>
    </t-dialog-confirm>

    <!-- failed with error code -->
    <t-dialog-confirm
      v-if="msg && payload"
      :t-actions="true"
      :t-confirm-text="msg"
      :t-dialog="map.failedWithCode"
      :t-icon-text="'mdi-close-octagon'"
      :t-persistent="true"
    >
      <template v-slot:title>
        {{ payload.messageTitle }}
      </template>
      <template v-slot:actions>
        <v-spacer />
        <v-btn
          color="primary"
          depressed
          small
          @click="dialog.setDialog({
            type:'failedWithCode',
            show:false
          })"
        >
          確認
        </v-btn>
      </template>
    </t-dialog-confirm>

    <!-- 房號為 -->
    <t-dialog-confirm
      :t-confirm-text="msg"
      :t-dialog="map.keycard"
      t-icon
      :t-icon-color="'primary'"
      :t-icon-text="'mdi-credit-card-check-outline'"
      :width="800"
    />

    <!-- 登出 -->
    <t-dialog-confirm
      :t-actions="true"
      :t-confirm-text="'確定要登出嗎？'"
      :t-dialog="map.logOut"
      t-icon
      :t-icon-color="'danger'"
      :t-icon-text="'mdi-alert-circle-outline'"
      :t-persistent="true"
    >
      <template v-slot:actions>
        <v-btn
          color="danger"
          outlined
          small
          @click="dialog.setDialog({
            type:'logOut',
            show:false
          })"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          depressed
          small
          @click="setAction({callback:['logOut',payload]})"
        >
          確定
        </v-btn>
      </template>
    </t-dialog-confirm>

    <!-- Notification -->
    <t-dialog-confirm
      v-if="msg && payload"
      :t-actions="true"
      :t-confirm-text="msg"
      :t-dialog="map.showNotification"
      :t-icon-text="'mdi-alert-circle-outline'"
      :t-persistent="true"
    >
      <template v-slot:title>
        {{ payload.messageTitle }}
      </template>
      <template v-slot:actions>
        <v-btn
          color="danger"
          outlined
          small
          @click="setAction({
            callback:['deleteNotification',payload]
          })"
        >
          清除
        </v-btn>
        <v-btn
          color="primary"
          depressed
          small
          @click="setAction({
            callback:['setNotiFicationStateToRead',payload]
          })"
        >
          確定
        </v-btn>
      </template>
    </t-dialog-confirm>

    <!-- 到時提醒 -->
    <t-dialog-confirm
      v-if="msg"
      :t-confirm-text="`${msg} 尚有15分鐘!`"
      :t-dialog="map.reminder"
      :t-text-class="'subtitle-1'"
    >
      <template v-slot:title>
        到時提醒
      </template>
      <template v-slot:actions>
        <v-btn
          color="success"
          depressed
          style="width:150px"
          @click="setDialog({
            type:'reminder',
            show:false
          })"
        >
          確定
        </v-btn>
      </template>
    </t-dialog-confirm>

    <t-dialog-confirm
      v-if="msg"
      :t-actions="true"
      :t-confirm-text="msg"
      :t-dialog="map.confirmNotify"
      t-icon
      :t-icon-color="'danger'"
      :t-icon-text="'mdi-alert-circle-outline'"
      :t-persistent="true"
    >
      <template v-slot:actions>
        <div class="text-center">
          <v-btn
            color="primary"
            depressed
            small
            @click="setDialog({
              type:'confirmNotify',
              show:false
            })"
          >
            確認
          </v-btn>
        </div>
      </template>
    </t-dialog-confirm>

    <t-dialog-animation :dialog="map.animationGIF" />
  </div>
</template>
