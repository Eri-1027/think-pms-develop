<script>
import {
  mapState,
  mapMutations,
  mapActions
} from 'vuex'
import { createDialog } from '@/utils/helpers/createDialog'
import _ from 'lodash'
import eventService from '../../utils/eventService'
const TLoginBtn = () => import('@/components/TLogingBtn.vue')
const TLoading = () => import('@/components/TLoading.vue')
export default {
  name: 'TheLogin',
  components: {
    TLoginBtn,
    TLoading
  },
  data () {
    return {
      account: '',
      password: '',
      showPassword: false,
      dialog: null,
      loginMsg: '',
      loginSign: '',
      loginDialog: false
    }
  },
  computed: {
    ...mapState({
      staffId: (state) => state.user.staff.staffId,
      isLoading: (state) => state.loading.isLoading
    }),
    rwd () {
      return this.$vuetify.breakpoint.name
    }
  },
  created () {
    this.dialog = createDialog()
  },
  methods: {
    ...mapMutations([
      'loading/SET_LOADING',
      'user/SET_DUTY_ID'
    ]),
    ...mapActions([
      'auth/authRequest',
      'initialState'
    ]),
    /**
     * @param {string} msg 根據 this['auth/authRequest'] 得到的 message
     */
    parseErrMsg (msg) {
      if (msg) {
        console.log(typeof (msg), msg)
        switch (msg) {
          case 'error: account didnt exist':
            return '此帳號不存在'
          case 'error: password didnt match':
            return '密碼有誤'
          case /^ERR10001/.test(msg):
            return '錯誤代碼：ERR10001'
          case /^ERR50001/.test(msg):
            return '錯誤代碼：ERR50001'
          default:
            return msg
        }
      }
    },
    async dialogHandler ({ success, message }) {
      const errMsg = success
        ? '登入成功'
        : this.parseErrMsg(message)
      const sign = success
        ? 'success'
        : 'failed'
      this['loading/SET_LOADING'](false)
      this.loginMsg = errMsg
      this.loginSign = sign
      this.loginDialog = true
      window.setTimeout(() => {
        this.loginMsg = ''
        this.loginSign = ''
        this.loginDialog = false
      }, 2200)
    },
    handleClickLogin: _.debounce(async function () {
      try {
        const valid = await this.$refs.formLogin.validate()
        if (!valid) return
        const {
          account,
          password
        } =
           this
        const {
          success,
          message
        } = await this['auth/authRequest']({
          account,
          password
        })
        if (success) {
          this['loading/SET_LOADING'](true)
          try {
            const callback = (data, error) => {
              if (error) {
                console.error(error)
              }
            }
            const request = async (retries, callback) => {
              try {
                const timer = window.setInterval(async () => {
                  console.log(this.res)
                  const res = await eventService.punchIn()
                  if (res.status === 200) {
                    window.clearInterval(timer)
                    callback(res)
                    if (res.data.fetch.dutyId) {
                      this['user/SET_DUTY_ID'](res.data.fetch.dutyId)
                      await this.initialState()
                      this.$router
                        .push({
                          name: 'TheDailySchedule',
                          params: { hotel: this.$store.state.hotel.url }
                        })
                        .catch((err) => err)
                    }
                  } else {
                    if (retries > 0) {
                      request(--retries, callback)
                    } else {
                      this.callback([], 'out of retries')
                    }
                  }
                }, 500)
              } catch (err) {
                if (retries > 0) {
                  request(--retries, callback)
                } else {
                  this.callback([], this.error)
                }
              }
            }
            request(10000, callback)
          } catch (err) {
            console.log(err)
          }
        } else {
          this.dialogHandler({
            success,
            message
          })
        }
      } catch (err) {
        await this.dialog.setDialog({
          autoClose: true,
          msg: '系統錯誤，請稍後再試',
          type: 'failed'
        })
      }
    }, 400)
  }
}
</script>
<template>
  <v-app id="inspire">
    <v-main>
      <v-container
        fill-height
        fluid
      >
        <v-row>
          <v-col
            class="d-flex align-center justify-center"
            cols="12"
          >
            <v-card
              v-if="!isLoading"
              flat
              max-width="400"
            >
              <ValidationObserver ref="formLogin">
                <form>
                  <v-card-title class="d-flex justify-center">
                    <h2 v-show="rwd !== 'xs'">
                      Think PMS 旅宿管理系統
                    </h2>
                    <h3 v-show="rwd === 'xs'">
                      Think PMS 旅宿管理系統
                    </h3>
                  </v-card-title>
                  <v-card-text>
                    <p
                      class="text--subtitle text-center"
                    >
                      Welcome to Think Property Management System
                    </p>
                    <v-card-text class="py-0">
                      <ValidationProvider
                        v-slot="{ errors }"
                        name="帳號"
                        rules="required|max:30|email"
                      >
                        <v-text-field
                          v-model="account"
                          append-icon="mdi-account-outline"
                          dense
                          :error-messages="errors"
                          label="帳號"
                          outlined
                          required
                          rounded
                          @keydown.enter="handleClickLogin"
                        />
                      </ValidationProvider>
                      <ValidationProvider
                        v-slot="{ errors }"
                        name="密碼"
                        rules="required|max:30"
                      >
                        <v-text-field
                          v-model="password"
                          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          dense
                          :error-messages="errors"
                          label="密碼"
                          outlined
                          required
                          rounded
                          :type="showPassword ? 'text' : 'password'"
                          @click:append="showPassword = !showPassword"
                          @keydown.enter="handleClickLogin"
                        />
                      </ValidationProvider>
                    </v-card-text>

                    <v-card-actions class="py-0">
                      <v-spacer />
                      <TLoginBtn @submit="handleClickLogin" />
                    </v-card-actions>
                  </v-card-text>
                </form>
              </ValidationObserver>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <t-loading />
    <t-dialog-confirm
      :t-confirm-text="loginMsg"
      :t-dialog="loginDialog"
    >
      <template #text>
        <t-sign-animation :t-sign-type="loginSign" />
      </template>
    </t-dialog-confirm>
  </v-app>
</template>

<style lang="scss">
.views__theLogin{
  .v-content__wrap{
    display:flex;
    align-content:center;
    justify-content:center;
    div{
      height:100%;
    }
  }

  .text--subtitle{
    font-size:14px;
  }

  .container{
    height:100%;
  }

  .v-input__slot{
    box-shadow:2px 2px 5px lightgray;
    fieldset{
      color:#fff !important;
    }
  }
}
</style>
