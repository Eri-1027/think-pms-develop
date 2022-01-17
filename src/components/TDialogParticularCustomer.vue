<template>
  <v-dialog
    v-if="particularCustomer.length"
    v-model="dialogUnCheckInConfirmCustomer"
    max-width="500"
    persistent
    @click:outside="dialogUnCheckInConfirmCustomer = false"
  >
    <v-card>
      <div class="pa-2">
        <v-card-title class="pa-1">
          確認旅客資訊：
          <v-spacer />
          <v-btn icon>
            <v-icon @click="dialogUnCheckInConfirmCustomer = false">
              mdi-close-box
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-title class="py-0">
          <v-spacer />
          <div>
            <v-btn
              outlined
              small
              @click="updateCustomerHandler"
            >
              編輯
            </v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <v-row
            class="d-flex"
            no-gutters
          >
            <v-col
              class="px-0"
              cols="6"
            >
              <v-row
                class="d-flex align-center"
                no-gutters
              >
                <v-col cols="4">
                  <div>旅客姓名：</div>
                </v-col>
                <v-col cols="8">
                  <div v-show="dialogUnCheckInStatus !== 'update'">
                    {{
                      particularCustomer
                        ? particularCustomer[0].customerName
                        : ''
                    }}
                  </div>
                  <v-text-field
                    v-show="dialogUnCheckInStatus === 'update'"
                    v-model="particularCustomer[0].customerName"
                    dense
                    hide-details
                    single-line
                  />
                </v-col>
              </v-row>
              <v-row
                class="d-flex align-center"
                no-gutters
              >
                <v-col cols="4">
                  <div>性別：</div>
                </v-col>
                <v-col cols="8">
                  <div v-show="dialogUnCheckInStatus !== 'update'">
                    {{ customerGender }}
                  </div>
                  <v-select
                    v-show="dialogUnCheckInStatus === 'update'"
                    v-model="particularCustomer[0].customerGender"
                    dense
                    hide-details
                    :items="customerGenderItems"
                    single-line
                  />
                </v-col>
              </v-row>
              <v-row
                class="d-flex align-center"
                no-gutters
              >
                <v-col cols="4">
                  <div>國籍：</div>
                </v-col>
                <v-col cols="8">
                  <div v-show="dialogUnCheckInStatus !== 'update'">
                    {{ particularCustomer[0].customerNationality }}
                  </div>
                  <v-text-field
                    v-show="dialogUnCheckInStatus === 'update'"
                    v-model="particularCustomer[0].customerNationality"
                    dense
                    hide-details
                    single-line
                  />
                </v-col>
              </v-row>
              <v-row
                class="d-flex align-center"
                no-gutters
              >
                <v-col cols="4">
                  <div>身分證：</div>
                </v-col>
                <v-col cols="8">
                  <div v-show="dialogUnCheckInStatus !== 'update'">
                    {{
                      particularCustomer[0].customerIdNumber ? particularCustomer[0].customerIdNumber
                      : '未提供'
                    }}
                  </div>
                  <v-text-field
                    v-show="dialogUnCheckInStatus === 'update'"
                    v-model="particularCustomer[0].customerIdNumber"
                    dense
                    hide-details
                    single-line
                  />
                </v-col>
              </v-row>
              <v-row
                class="d-flex align-center"
                no-gutters
              >
                <v-col cols="4">
                  <div>護照號碼：</div>
                </v-col>
                <v-col cols="8">
                  <div v-show="dialogUnCheckInStatus !== 'update'">
                    {{
                      particularCustomer[0].customerPassportNumber
                        ? particularCustomer[0].customerPassportNumber
                        : '未提供'
                    }}
                  </div>
                  <v-text-field
                    v-show="dialogUnCheckInStatus === 'update'"
                    v-model="particularCustomer[0].customerPassportNumber"
                    dense
                    hide-details
                    single-line
                  />
                </v-col>
              </v-row>
              <v-row
                class="d-flex align-center"
                no-gutters
              >
                <v-col cols="4">
                  <div>聯絡電話：</div>
                </v-col>
                <v-col cols="8">
                  <div v-show="dialogUnCheckInStatus !== 'update'">
                    {{ particularCustomer[0].customerPhone }}
                  </div>
                  <v-text-field
                    v-show="dialogUnCheckInStatus === 'update'"
                    v-model="particularCustomer[0].customerPhone"
                    dense
                    hide-details
                    single-line
                  />
                </v-col>
              </v-row>
              <v-row
                class="d-flex align-center"
                no-gutters
              >
                <v-col cols="4">
                  <div>E-mail：</div>
                </v-col>
                <v-col cols="8">
                  <div v-show="dialogUnCheckInStatus !== 'update'">
                    {{ particularCustomer[0].customerEmail }}
                  </div>
                  <v-text-field
                    v-show="dialogUnCheckInStatus === 'update'"
                    v-model="particularCustomer[0].customerEmail"
                    dense
                    hide-details
                    single-line
                  />
                </v-col>
              </v-row>
            </v-col>
            <v-col
              v-show="showUnCheckInRoomsStatus === 'empty'"
              cols="3"
            >
              尚未選擇房號，請先排房
            </v-col>
            <v-col
              v-show="showUnCheckInRoomsStatus === 'plural'"
              class="px-0 text-center"
              cols="3"
            >
              <div
                class="mt-1"
              >
                選擇入住房：
              </div>
            </v-col>
            <v-col
              v-show="showUnCheckInRoomsStatus === 'plural'"
              class="px-0"
              cols="3"
            >
              <v-checkbox
                v-model="checkInRoomCheckboxAll"
                class="mt-0"
                hide-details
                label="全部房型"
                @click.stop="getCheckInRoom(checkInRoomCheckboxAll,particularCustomer)"
              />
              <v-radio-group
                v-model="checkInRoomRadio"
                multiple
              >
                <v-radio
                  v-for="(item,index) in particularCustomer"
                  :key="index"
                  :label="item.roomNumber"
                  :value="item.bookingDetailId"
                  @click.stop="getCheckInRoom(item.bookingDetailId,item.bookingDetailId)"
                />
              </v-radio-group>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-show="dialogUnCheckInStatus === 'update'"
            color="primary"
            outlined
            small
            @click="updateCustomer()"
          >
            完成
          </v-btn>

          <v-btn
            color="primary"
            depressed
            :disabled="showUnCheckInRoomsStatus === 'empty'"
            small
            @click="checkInHandlerForUnCheckIn"
          >
            下一步
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>
