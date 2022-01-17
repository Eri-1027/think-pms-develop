<script>
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'
import { mixinUpdate } from '@/mixins/update.mixin'
import { createDialog } from '@/utils/helpers/createDialog'
import eventService from '../../utils/eventService'
const PageDialog = () => import('@/components/PageDialog')
const TCardOrderInfo = () => import('@/components/TCardOrderInfo')
const PagePayment = () => import('@/components/PagePayment')
const TLoading = () => import('@/components/TLoading')
const ListItemDebug = () => import('@/views/TheHome/ListItemDebug')
const ListItemStaffInfo = () => import('@/views/TheHome/ListItemStaffInfo')
const ListItemNotification = () => import('@/views/TheHome/ListItemNotification')
const ListItemSidebar = () => import('@/views/TheHome/ListItemSidebar')
const ListItemMenu = () => import('@/views/TheHome/ListItemMenu')
export default {
  name: 'TheHome',
  components: {
    PageDialog,
    TCardOrderInfo,
    PagePayment,
    TLoading,
    ListItemDebug,
    ListItemStaffInfo,
    ListItemNotification,
    ListItemSidebar,
    ListItemMenu
  },
  mixins: [mixinUpdate],
  data () {
    return {
      dialog: null,
      drawer: false,
      mini: true,
      naviColor: 'primary',
      itemsBookings: [
        { title: '當日房況', icon: 'mdi-clock-outline', name: 'TheDailySchedule' },
        { title: '房號安排', icon: 'mdi-key-variant', name: 'TheRoomArrangement' },
        { title: '旅客資訊', icon: 'mdi-account-group', name: 'TheCustomerInfo' }
      ],
      itemsManagement: [
        { title: '所有訂單', icon: 'mdi-text-box-outline', name: 'TheOrderList' },
        { title: '結帳作業', icon: 'mdi-credit-card-outline', name: 'ThePayment' },
        { title: '住房日報', icon: 'mdi-text-box-multiple', name: 'TheDailyReport' }
      ],
      itemsSupport: [
        { title: '房型編輯', icon: 'mdi-bed-empty', name: 'TheRoomType' },
        { title: '房價與專案', icon: 'mdi-shape', name: 'TheDiscount' },
        { title: '人員管理', icon: 'mdi-account-settings', name: 'TheStaff' },
        { title: '購物中心', icon: 'mdi-shopping', name: 'TheExtraExpense' }
      ],
      notificationItem: {},
      timerForeceToCancel: null,
      timerShowMessages: null,
      notificationMessages: [],
      cardNumber: null
    }
  },
  computed: {
    ...mapState({
      // token: state => state.auth.token,
      debug: state => state.debug.debug,
      // hotelId: state => state.hotel.hotelId,
      isLoading: state => state.loading.isLoading,
      // staffName: state => state.user.staff.staffName,
      // staffAccount: state => state.user.staff.staffAccount,
      dialogLogout: state => state.dialog.map.logOut,
      dialogShowNotification: state => state.dialog.map.showNotification
    }),

    layout () {
      if (!this.$route.meta.layout) {
        return 'div'
      } else {
        return `${this.$route.meta.layout}-layout`
      }
    },
    dialogSwitch: {
      get () {
        return true
      },
      set (val) {
        this.dialog.setDialog({ type: 'logOut', show: val })
      }
    },
    isAllRead () {
      return this.notificationMessages.every(el => el.messageRead === '1')
    },
    rwd () {
      return this.$vuetify.breakpoint.name
    },
    srHeight () {
      return this.$vuetify.breakpoint.height
    },
    srWidth () {
      return this.$vuetify.breakpoint.width
    }
  },
  mounted () {
    this.$bus.$on('change', async () => {
      await this.showMessages()
    })
  },
  created () {
    this.forceToCancel()
    this.showMessages()
    this.dialog = createDialog()
  },
  beforeDestroy () {
    window.clearInterval(this.timerForeceToCancel)
    window.clearInterval(this.timerShowMessages)
  },
  methods: {
    ...mapMutations([
      'user/DELETE_DUTY_ID',
      'dialog/SET_DIALOG'
    ]),
    ...mapActions([
      'auth/authLogout',
      'dialog/setDialog'
    ]),
    // notification
    async deleteNotification (item) {
      const data = {
        messageId: item.messageId
      }
      const res = await eventService.deleteMessage(data)
      if (res.data.success) {
        await this.dialog.setDialog({
          type: 'showNotification',
          show: false
        })
        await this.dialog.setDialog({
          autoClose: true,
          msg: '消息已清除',
          type: 'failed'
        })
        this.$bus.$emit('change')
      }
    },
    async setNotiFicationStateToRead (item) {
      const temp = {
        messageId: item.messageId
      }
      const res = await eventService.updateMessage(temp)
      if (res.data.success) {
        await this.dialog.setDialog({
          type: 'showNotification',
          show: false
        })
        this.$bus.$emit('change')
      }
    },
    async showNotificationDetail (item) {
      this.notificationItem = this.notificationMessages.filter(el => el.messageId === item.messageId)[0]
      if (this.notificationItem) {
        await this.dialog.setDialog({
          msg: `${this.notificationItem.messageContent}(剩餘數量${this.cardNumber}張)`,
          type: 'showNotification',
          show: true,
          payload: this.notificationItem
        })
      }
    },
    async showLogOutDialog () {
      await this.dialog.setDialog({
        msg: '確定要登出嗎？',
        type: 'logOut',
        show: true
      })
    },
    async logOut () {
      const success = await this['auth/authLogout']()
      if (success) {
        this['user/DELETE_DUTY_ID']()
        await this.dialog.setDialog({
          type: 'logOut',
          show: false
        })
        const result = await this.dialog.setDialog({
          autoClose: true,
          msg: '已登出',
          type: 'success'
        })
        if (result) {
          this.$router.push('/login')
        }
      }
    },
    async forceToCancel () {
      window.setTimeout(() => {
        this.timerForeceToCancel = window.setInterval(async () => {
          eventService.forceToCancel().then(res => {
          }).catch(err => {
            console.log(err)
            window.location.reload()
          })
        }, 30000)
      }, 1000)
    },
    async showMessages () {
      try {
        await eventService.checkCardsStatus()
        const res = await eventService.showMessage()
        if (res.data.success) {
          if (res.data.fetch.message.length) {
            this.notificationMessages = res.data.fetch.message
            this.cardNumber = res.data.fetch.cardNumber
          } else {
            return false
          }
        } else {
          return false
        }

        this.timerShowMessages = window.setInterval(async () => {
          const res = await eventService.showMessage()
          if (res.data.fetch.message.length) {
            this.notificationMessages = res.data.fetch.message
          } else {
            this.notificationMessages = []
          }
        }, 30000)
      } catch (err) {
        console.log(err)
      }
    },
    async dispatchDialogAction ({ fn, payload }) {
      if (fn) {
        if (payload) {
          await this[fn](payload)
        } else {
          await this[fn]()
        }
      }
    }
  }
}
</script>
<template>
  <v-app id="inspire">
    <div v-if="rwd === 'xs'">
      <div class="pa-2">
        <template v-if="isAllRead">
          <v-btn
            icon
            @click.stop="drawer = !drawer"
          >
            <v-icon large>
              mdi-menu
            </v-icon>
          </v-btn>
        </template>
        <template v-else>
          <v-badge
            color="pink"
            dot
          >
            <v-btn
              icon
              @click.stop="drawer = !drawer"
            >
              <v-icon large>
                mdi-menu
              </v-icon>
            </v-btn>
          </v-badge>
        </template>
      </div>
      <v-navigation-drawer
        v-model="drawer"
        app
      >
        <v-layout
          column
          fill-height
        >
          <v-list dense>
            <ListItemStaffInfo />
            <ListItemNotification
              v-if="notificationMessages && notificationMessages.length"
              :messages="notificationMessages"
              sub-header="Notification"
              @dialog="showNotificationDetail"
            />
            <ListItemSidebar
              :items="itemsBookings"
              sub-header="BOOKINGS"
            />
            <ListItemSidebar
              :items="itemsManagement"
              sub-header="MANAGEMENT"
            />
            <ListItemSidebar
              :items="itemsSupport"
              sub-header="SUPPORT"
            />
          </v-list>
          <v-spacer />
          <v-list dense>
            <v-list-item>
              <v-switch
                v-model="dialogSwitch"
                color="dark"
                :disabled="!dialogSwitch"
                inset
                label="Log Out"
                @click="showLogOutDialog"
              />
            </v-list-item>
          </v-list>
        </v-layout>
      </v-navigation-drawer>
    </div>
    <div v-else>
      <v-navigation-drawer
        v-model="drawer"
        app
        class="noPrint"
        :color="mini ? 'primary' : 'gray'"
        :dark="mini"
        expand-on-hover
        :light="!mini"
        :mini-variant.sync="mini"
        permanent
      >
        <v-layout
          column
          fill-height
        >
          <v-list
            v-show="mini"
            dense
          >
            <ListItemMenu :is-all-read="isAllRead" />
          </v-list>
          <v-list dense>
            <ListItemStaffInfo v-if="!mini" />
            <ListItemDebug v-if="debug && !mini" />
            <ListItemNotification
              v-if="notificationMessages && notificationMessages.length && !mini"
              :messages="notificationMessages"
              sub-header="Notification"
              @dialog="showNotificationDetail"
            />
            <ListItemSidebar
              v-if="!mini"
              :items="itemsBookings"
              sub-header="BOOKINGS"
            />
            <ListItemSidebar
              v-if="!mini"
              :items="itemsManagement"
              sub-header="MANAGEMENT"
            />
            <ListItemSidebar
              v-if="!mini"
              :items="itemsSupport"
              sub-header="SUPPORT"
            />
          </v-list>
          <v-spacer />
          <v-list dense>
            <v-list-item>
              <v-switch
                v-show="!mini"
                v-model="dialogSwitch"
                color="dark"
                :disabled="!dialogSwitch"
                inset
                label="Log Out"
                @click="showLogOutDialog"
              />
            </v-list-item>
          </v-list>
        </v-layout>
      </v-navigation-drawer>
    </div>
    <v-main>
      <v-container
        class="py-0"
        fill-height
        fluid
      >
        <v-row class="d-flex justify-center rowHeight py-0">
          <v-col class="text-center pa-0">
            <transition
              mode="out-in"
              name="fade"
            >
              <component
                :is="layout"
                :key="$route.name"
              >
                <router-view :layout.sync="layout" />
              </component>
            </transition>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <page-dialog @action="dispatchDialogAction" />
    <t-card-order-info />
    <page-payment />

    <v-snackbar
      timeout="-1"
      top
      :value="updateExists"
    >
      發現新版本
      <template v-slot:action="{ attrs }">
        <v-btn
          v-bind="attrs"
          color="info"
          text
          @click="refreshApp"
        >
          立即更新
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style lang="scss">
@import 'src/assets/scss/utils/_variables.scss';
@media screen and  (orientation:landscape) {
  // .landscape {
  //   border: 2px solid palegoldenrod;
  // }
}
@media (max-width: 600px) {
}
@media (min-width: 600px) {
}
@media (max-width: 600px) and (max-width: 960px) {
}
@media (min-width: 960px) and (max-width: 1264px) {
}
@media (min-width: 1264px) and (max-width: 1904px) {
}
@media (min-width: 1904px) {
}

.rowHeight {
  height: 100%;
}
.active {
  //background-color: $haha;
  background-color: $primary;
  .v-icon {
    color: $success !important;
  }
  .v-list-item__content {
    color: $white;
  }
}

.v-list-item--active::before {
  opacity: 0 !important;
}

.fade-enter-active ,
.fade-leave-active {
  transition: opacity .75s ease;
}
.fade-enter ,
.fade-leave-active {
  opacity: 0;
}
.child-view {
  position: absolute;

  transition: all .75s cubic-bezier(.55,0,.1,1);
}

.slide-left-enter ,
.slide-right-leave-active {
  -webkit-transform: translate(30px, 0);
          transform: translate(30px, 0);

  opacity: 0;
}
.slide-left-leave-active ,
.slide-right-enter {
  -webkit-transform: translate(-30px, 0);
          transform: translate(-30px, 0);

  opacity: 0;
}
</style>
