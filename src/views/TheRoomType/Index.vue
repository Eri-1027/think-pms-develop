<script>
import { mapState } from 'vuex'
import { createDialog } from '@/utils/helpers/createDialog'
import { createRoomType } from '@/utils/create/createRoomType'
import { createValidate } from '@/utils/helpers/createValidate'
import { createUtils } from '@/utils/helpers/createUtils'
import eventService from '../../utils/eventService'
const _roomType = createRoomType()
const _v = createValidate()

export default {
  data () {
    return {
      dialog: null,
      records: [],
      roomTypes: [],
      tempUploadFile: [],
      tempCacheRoomNumbers: '',
      cacheRoomNumbers: [],
      tempRoomType: {
        roomTypeName: '',
        roomAccommodate: '',
        weekdayPrice: '',
        weekdayDays: [],
        weekendPrice: '',
        weekendDays: [],
        roomAddable: false,
        restHourDefault: '',
        restPrice: '',
        restPerHour: '',
        roomNumber: [],
        roomDescription: '',
        url: '',
        upload: []
      },
      tempDeleteNumber: '',
      tempDeleteNumbers: [], // 欲刪除的該筆房號,
      roomNumberDataAll: [],
      restHourDefaultItems: [
        { text: '1小時', value: '1' },
        { text: '2小時', value: '2' },
        { text: '3小時', value: '3' },
        { text: '4小時', value: '4' },
        { text: '5小時', value: '5' },
        { text: '6小時', value: '6' },
        { text: '7小時', value: '7' },
        { text: '8小時', value: '8' },
        { text: '9小時', value: '9' }
      ],
      weekendDaysItems: [
        { id: 'we0', name: '日', value: '0' },
        { id: 'we1', name: '一', value: '1' },
        { id: 'we2', name: '二', value: '2' },
        { id: 'we3', name: '三', value: '3' },
        { id: 'we4', name: '四', value: '4' },
        { id: 'we5', name: '五', value: '5' },
        { id: 'we6', name: '六', value: '6' }
      ],
      isNew: false,
      // data table
      headerRoomTypes: [
        {
          text: '名稱',
          value: 'roomTypeName',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '房號',
          value: 'roomItem',
          sortable: false,
          align: 'left',
          class: ['primary', 'white--text']
        },
        {
          text: '平日房價',
          value: 'weekdayPrice',
          sortable: false,
          align: 'right',
          class: ['primary', 'white--text']
        },
        {
          text: '假日房價',
          value: 'weekendPrice',
          sortable: false,
          align: 'right',
          class: ['primary', 'white--text']
        },
        {
          text: '',
          value: 'action',
          sortable: false,
          align: 'center',
          class: ['primary', 'white--text']
        }
      ],
      buttonDisableds: []
    }
  },
  computed: {
    ...mapState({
      hotelId: state => state.hotel.hotelId,
      dialogCreateRoomNumber: state => state.dialog.map.createRoomNumber,
      dialogCreateRoomType: state => state.dialog.map.createRoomType,
      dialogConfirmDeleteRoomType: state => state.dialog.map.confirmDeleteRoomType,
      dialogConfirmDeleteRoomNumber: state => state.dialog.map.confirmDeleteRoomNumber
    }),
    // for rwd mobile card only
    displayCardRoomNumber () {
      return (item) => {
        const rooms = item.map(room => room.roomNumber)
        if (rooms && rooms.length) {
          return rooms && rooms.length > 5
            ? `${rooms.slice(0, 5).join(' ')}...`
            : rooms.join(' ')
        } else {
          return '沒有房號'
        }
      }
    },
    displayRoomNumbers: {
      get () {
        return (this.cacheRoomNumbers && this.cacheRoomNumbers.length)
          ? this.cacheRoomNumbers.filter(room =>
            (room.action === 'keep' || room.action === 'post' || room.action === 'put')
          )
          : []
      },
      set (val) {
        this.displayRoomNumbers = val
      }
    },
    rwd () {
      return this.$vuetify.breakpoint.name
    },
    isBtnDisabled () {
      return this.buttonDisableds.some(el => el.id)
    }
  },
  created () {
    this.getRoomTypesHandler()
    this.getRoomNumberDataAll()
    this.dialog = createDialog()
    this.utils = createUtils()
  },
  updated () {
    this.$bus.$on('init-temp-room-type', () => {
      if (this.$refs.formInsertRoomType) {
        this.$refs.formInsertRoomType.reset()
      } else {
        console.log('reset failed')
      }
      this.tempRoomType = this.initialRoomType()
    })
    this.$bus.$on('init-temp-room-numbers', () => {
      this.cacheRoomNumbers = this.records = []
    })
  },
  methods: {
    initialRoomType () {
      return JSON.parse(JSON.stringify({
        roomTypeName: '',
        roomAccommodate: '',
        weekdayPrice: '',
        weekdayDays: [],
        weekendPrice: '',
        weekendDays: [],
        roomAddable: false,
        restHourDefault: '',
        restPrice: '',
        restPerHour: '',
        roomNumber: [],
        roomDescription: '',
        url: '',
        upload: []
      }))
    },
    async showEditRoomType ({ isNew, item }) {
      if (isNew) {
        this.isNew = true
      } else {
        this.tempRoomType = Object.assign(this.initialRoomType(), item)
        if (!item.roomImage) {
          console.log('roomImage not found!')
        } else {
          this.$set(this.tempRoomType, 'url', `${process.env.VUE_APP_ROOM_TYPE_BASEURL}/${item.roomImage}`)
        }
        const isRoomAddable = this.tempRoomType.roomAddable !== '0'
        this.tempRoomType.roomAddable = isRoomAddable
        this.isNew = false
      }
      this.dialog.setDialog({ type: 'createRoomType', show: true })
    },
    async postHandler (id) {
      this.buttonDisableds.push({
        id: await id
      })
      if (this.isNew) {
        const success = await this.postRoomTypeHandler()
        if (success) {
          await this.dialog.setDialog({
            type: 'createRoomType',
            show: false
          })
        }
      } else {
        this.updateRoomTypeHandler()
        await this.dialog.setDialog({
          type: 'createRoomType',
          show: false
        })
      }
    },
    // crud roomType
    async fetchPostImageURL (e) {
      try {
        if (this.tempUploadFile) {
          const reader = new FileReader()
          reader.onload = (e) => {
            document
              .getElementById('hotelPic')
              .setAttribute('src', e.target.result)
          }
          reader.readAsDataURL(this.tempUploadFile[0]) // convert to base64 string
          // upload
          const formData = new FormData()
          let fileName
          if (this.hotelId) {
            fileName = `${this.hotelId}_${this.$date().format('YYYYMMDDHHmmss')}`
          } else {
            this.dialog.setDialog({ autoClose: true, msg: '上傳失敗', type: 'failed' })
            return
          }

          formData.append('upload', this.tempUploadFile[0], fileName)
          const res = await eventService.insertPhoto(formData)
          if (res.data.success) {
            await this.dialog.setDialog({ autoClose: true, msg: '上傳成功', type: 'success' })
            this.$set(this.tempRoomType, 'url', res.data.fetch.uploadPhoto)
          } else {
            if (res.data.fetch.uploadPhoto === 'error: moving file failed') {
              await this.dialog.setDialog({ autoClose: true, msg: '檔案移動失敗', type: 'failed' })
            }
          }
        }
      } catch (err) {
        console.log(err)
      }
    },
    async getRoomTypesHandler () {
      this.roomTypes = await _roomType.getRoomTypes()
    },
    // 房號編輯，新增房型不會有刪除，有什麼丟什麼，只會有新增
    async postRoomTypeHandler () {
      const valid = await this.$refs.formInsertRoomType.validate()
      if (!valid) {
        this.buttonDisableds = []
        return
      }
      const val = _roomType.getWeekdayDays(this.tempRoomType.weekendDays)
      if (val) {
        this.$set(this.tempRoomType, 'weekdayDays', val)
      }
      if (this.cacheRoomNumbers && this.cacheRoomNumbers.length) {
        const roomNumbers = this.cacheRoomNumbers
          .map(room => room.roomNumber)
          .join(',')
        this.$set(this.tempRoomType, 'roomNumber', roomNumbers)
      }

      const result = await _roomType.fetchPostRoomType(this.tempRoomType)
      const {
        success,
        message
      } = result
      if (success) {
        await this.dialog.setDialog({
          type: 'createRoomType',
          show: false
        })
        await this.dialog.setDialog({
          type: 'confirmDeleteRoomType',
          show: false
        })
        await this.dialog.setDialog({
          autoClose: true,
          msg: '新增成功',
          type: 'success'
        })
        await this.getRoomTypesHandler()
        this.buttonDisableds = []
      } else {
        await this.dialog.setDialog({
          type: 'createRoomType',
          show: false
        })
        await this.dialog.setDialog({
          type: 'confirmDeleteRoomType',
          show: false
        })
        await this.dialog.setDialog({
          autoClose: true,
          msg: message,
          type: 'failed'
        })
        await this.getRoomTypesHandler()
        this.tempRoomType = this.initialRoomType()
      }
      this.buttonDisableds = []
    },
    async deleteRoomTypeHandler () {
      const temp = {
        roomTypeId: this.tempRoomType.roomTypeId
      }
      const result = await _roomType.fetchDeleteRoomType(temp)
      if (result) {
        await this.dialog.setDialog({
          type: 'confirmDeleteRoomType',
          show: false
        })
        await this.dialog.setDialog({
          autoClose: true,
          msg: '刪除成功',
          type: 'success'
        })
        await this.getRoomTypesHandler()
      } else {
        const complete = await this.dialog.setDialog({
          autoClose: true,
          msg: '操作失敗',
          type: 'failed'
        })
        if (complete) {
          await this.dialog.setDialog({
            type: 'confirmDeleteRoomType',
            show: false
          })
          await this.getRoomTypesHandler()
        }
      }
      this.buttonDisableds = []
    },
    async updateRoomTypeHandler () {
      const valid = this.$refs.formInsertRoomType.validate()
      if (!valid) return
      const val = _roomType.getWeekdayDays(this.tempRoomType.weekendDays)
      if (val) {
        this.$set(this.tempRoomType, 'weekdayDays', val)
      }
      const result = await _roomType.fetchPutRoomType(this.tempRoomType)
      const {
        success,
        message
      } = result
      if (success) {
        const actionFinished = await this.dispatchRoomActions(this.cacheRoomNumbers)
        if (actionFinished) {
          await this.dialog.setDialog({
            type: 'confirmDeleteRoomType',
            show: false
          })
          await this.dialog.setDialog({
            autoClose: true,
            msg: '更新成功',
            type: 'success'
          })
          await this.dialog.setDialog({
            type: 'confirmDeleteRoomType',
            show: false
          })
          await this.getRoomTypesHandler()
          this.cacheRoomNumbers = []
        } else {
          this.cacheRoomNumbers = []
        }
      } else {
        await this.dialog.setDialog({
          type: 'confirmDeleteRoomType',
          show: false
        })
        await this.dialog.setDialog({
          autoClose: true,
          msg: message,
          type: 'failed'
        })
        await this.getRoomTypesHandler()
      }

      this.$refs.formInsertRoomType.reset()
      this.tempRoomType = this.initialRoomType()
      this.buttonDisableds = []
    },
    async dispatchRoomActions (rooms) {
      try {
        const handler = this.makeRoomNumbers()
        const result = await Promise.all([rooms.map(async room => {
          switch (room.action) {
            case 'post':
              await handler.fetchPostRoomNumbers(room)
              break
            case 'delete':
              await handler.fetchDeleteRoomNumber(room)
              break
            case 'put':
              await handler.fetchPutRoomNumbers(room)
              break
            default:
              break
          }
          return room
        })])
        // 這裡需要錯誤處理
        return result && result.length
      } catch (err) {
        console.log(err)
      }
    },
    async closeInsertRoomTypeDialogHandler () {
      this.tempRoomType = this.initialRoomType()
      this.cacheRoomNumbers = this.records = []
      await this.dialog.setDialog({
        type: 'createRoomType',
        show: false
      })
    },
    roomTypeConfirmHandler (item) {
      this.tempRoomType = this.initialRoomType()
      this.tempRoomType.roomTypeId = item.roomTypeId
      this.dialog.setDialog({
        type: 'confirmDeleteRoomType',
        show: true
      })
    },
    // crud roomNumber
    makeRoomNumbers () {
      const isRoomId = async (roomNumber) => {
        const allRooms = await _roomType.fetchGetRooms()
        return allRooms.some(room => room.roomNumber === roomNumber)
      }
      const validate = async (roomNumber) => {
        const allRooms = await _roomType.fetchGetRooms()
        const isNumber = /^[0-9]+$/
        const isRoomExistInDB = () => {
          if (allRooms.length) {
            return allRooms.some(room => room.roomNumber === roomNumber)
          }
          return false
        }
        if (roomNumber.match(isNumber) && !isRoomExistInDB()) {
          return true
        }
        return false
      }
      const isMultipleRoomNumbers = (roomNumbers) => {
        const reg = /,/
        return roomNumbers.match(reg)
      }
      const getSplitRoomNumbers = (roomNumber) => {
        const finals = []
        const numbers = roomNumber.trim().split(',')
        numbers.forEach(number => {
          if (number) {
            finals.push(number)
          }
        })
        return finals
      }
      const getSortCacheRoomNumbers = (cacheRoomNumbers) => {
        return cacheRoomNumbers.sort((a, b) => {
          return (+a.roomNumber) - (+b.roomNumber)
        })
      }
      /**
       * { action:'post',roomId:null,roomNumber:100 }
       * this.cacheRoomNumbers
       */
      const setCacheRoomNumber = async (roomNumber) => {
        const set = new Set()
        const isExistInCache = (roomNumber) => {
          return this.cacheRoomNumbers.some(room => room.roomNumber === roomNumber)
        }
        const index = (roomNumber) => {
          return this.cacheRoomNumbers.findIndex(room => room.roomNumber === roomNumber)
        }
        if (isMultipleRoomNumbers(roomNumber)) {
          // 去除空格、將字串變為陣列
          const newRoomNumbers = getSplitRoomNumbers(roomNumber)
          const result = await Promise.all(
            newRoomNumbers.map(async newNumber => {
              if (await validate(newNumber)) {
                if (isExistInCache(newNumber)) {
                  const idx = index(newNumber)
                  if (this.cacheRoomNumbers[idx].action === 'delete') {
                    if (this.cacheRoomNumbers[idx].roomId) {
                      this.$set(this.cacheRoomNumbers[idx], 'action', 'keep')
                    } else {
                      this.$set(this.cacheRoomNumbers[idx], 'action', 'post')
                    }
                  } else {
                    set.add(newNumber)
                  }
                } else {
                  const idx = this.cacheRoomNumbers.length
                  this.$set(this.cacheRoomNumbers, idx, { action: 'post', roomId: null, roomNumber: newNumber })
                }
              } else {
                set.add(newNumber)
              }
              return newNumber
            })
          )

          if (result.length) {
            const sets = Array.from(set)
            if (sets && sets.length) {
              await this.dialog.setDialog({ autoClose: true, msg: `重複的房號：${sets.join(' ')}`, type: 'failed' })
            }
          }
          this.cacheRoomNumbers = getSortCacheRoomNumbers(this.cacheRoomNumbers)
        }
        if (!isMultipleRoomNumbers(roomNumber)) {
          if (await validate(roomNumber)) {
            if (isExistInCache(roomNumber)) {
              const idx = index(roomNumber)
              if (this.cacheRoomNumbers[idx].action === 'delete') {
                this.$set(this.cacheRoomNumbers[idx], 'action', 'post')
              } else {
                await this.dialog.setDialog({ autoClose: true, msg: '重複的房號', type: 'failed' })
                return
              }
            } else {
              const idx = this.cacheRoomNumbers.length
              this.$set(this.cacheRoomNumbers, idx, { action: 'post', roomId: null, roomNumber: roomNumber })
            }

            // this.cacheRoomNumbers.push({ action: 'post', roomId: null, roomNumber })
          } else {
            await this.dialog.setDialog({ autoClose: true, msg: '該房號已存在', type: 'failed' })
          }
        }
        this.cacheRoomNumbers = getSortCacheRoomNumbers(this.cacheRoomNumbers)
      }
      const getCacheRoomNumber = () => {
        return this.cacheRoomNumbers
      }
      // not really delete the roomNumber from caches but add tag 'delete'
      const deleteCacheRoomNumber = (item) => {
        const index = item => {
          return this.cacheRoomNumbers.findIndex(room => room.roomNumber === item.roomNumber)
        }
        // this.cacheRoomNumbers.splice(index(item), 1)
        this.cacheRoomNumbers.forEach((room, idx) => {
          if (index(item) === idx) {
            this.$set(this.cacheRoomNumbers[idx], 'action', 'delete')
          }
        })
      }
      const clearTempCacheRoomNumbers = () => {
        this.tempCacheRoomNumbers = ''
      }
      const fetchPutRoomNumbers = async (item) => {
        try {
          const data = {
            roomTypeId: this.tempRoomType.roomTypeId,
            roomId: item.roomId,
            roomNumber: item.roomNumber
          }
          const res = await eventService.updateRoomNumber(data)
          if (res.data.success) {
            return true
          }
          return false
        } catch (err) {
          console.log(err)
        }
      }
      const fetchPostRoomNumbers = async (item) => {
        try {
          if (!this.tempRoomType.roomTypeId) {
            await this.dialog.setDialog({ autoClose: true, msg: '請先建立房型', type: 'failed' })
          }
          const data = {
            roomTypeId: this.tempRoomType.roomTypeId,
            roomNumber: item.roomNumber
          }
          const res = await eventService.insertRoomNumber(data)
          if (res.data.success) {
            return true
          }
        } catch (err) {
          console.log(err)
        }
      }
      const fetchDeleteRoomNumber = async (item) => {
        try {
          const res = await eventService.deleteRoomNumber({
            roomId: item.roomId
          })
          return !!res.data.success
        } catch (err) {
          console.log(err)
        }
      }
      // this is may not use in the future
      const dispatchFetchRoomNumbers = async (cacheItems) => {
        try {
          if (this.isNew) {
            this.tempRoomType.roomNumber = cacheItems.map(room => room.roomNumber)
            await this.dialog.setDialog({
              type: 'createRoomNumber',
              show: false
            })
            await this.dialog.setDialog({
              autoClose: true,
              msg: '操作成功',
              type: 'success'
            })
            return
          }
          if (!this.isNew) {
            if (this.tempDeleteNumbers && this.tempDeleteNumbers.length) {
              const success = await fetchDeleteRoomNumber({ roomId: this.tempDeleteNumber.roomId })
              if (success) {
                this.tempDeleteNumber = ''
                this.tempDeleteNumbers = []
              }
              if (!success) {
                this.tempDeleteNumber = ''
                this.tempDeleteNumbers = []
                return
              }
            }
            cacheItems.forEach(async room => {
              if (room.roomId === null) {
                const success = await fetchPostRoomNumbers(room)
                if (!success) {
                  return
                }
              }
              if (room.roomId && room.roomNumber) {
                await fetchPutRoomNumbers(room)
              }
            })
            await this.getRoomTypesHandler()
            const index = id => {
              return this.roomTypes.findIndex(room => room.roomTypeId === id)
            }
            const idx = index(this.tempRoomType.roomTypeId)
            this.tempRoomType.roomItem = this.roomTypes[idx].roomItem
            await this.dialog.setDialog({
              autoClose: true,
              msg: '操作成功',
              type: 'success'
            })
          }
        } catch (err) {
          await this.dialog.setDialog({
            type: 'createRoomNumber',
            show: false
          })
        }
      }
      const copyCacheRoomNumberToTempRoomType = (chacheItem) => {
        this.tempRoomType.roomItem = chacheItem
      }
      return {
        isRoomId,
        validate,
        setCacheRoomNumber,
        getCacheRoomNumber,
        clearTempCacheRoomNumbers,
        fetchPutRoomNumbers,
        fetchPostRoomNumbers,
        fetchDeleteRoomNumber,
        dispatchFetchRoomNumbers,
        deleteCacheRoomNumber,
        copyCacheRoomNumberToTempRoomType
      }
    },
    async handleClickShowDialogEditRoomNumbers () {
      if (_v.isArrays(this.tempRoomType.roomItem)) {
        this.cacheRoomNumbers = this._.clone(this.tempRoomType.roomItem)
        this.cacheRoomNumbers.forEach((room, index) => {
          this.$set(this.cacheRoomNumbers[index], 'action', 'keep')
        })
      }
      await this.dialog.setDialog({
        type: 'createRoomNumber',
        show: true
      })
    },
    // 房號編輯，點選新增
    async setCacheRoomNumberHandler (roomNumber) {
      const handler = this.makeRoomNumbers()
      await handler.setCacheRoomNumber(this.tempCacheRoomNumbers)
      this.records = this._.clone(this.cacheRoomNumbers)
      handler.clearTempCacheRoomNumbers()
    },
    // 房號編輯，修改房號
    async putCacheRoomNumberHandler (item) {
      this.cacheRoomNumbers.forEach((room) => {
        if (room.roomId === item.roomId) {
          room.action = 'put'
        }
      })
    },
    // 房號編輯，點選刪除
    async showDeleteNumberConfirmHandler (item) {
      const handler = this.makeRoomNumbers()
      const isExistInDB = await handler.isRoomId(item.roomNumber)
      if (isExistInDB) {
        // 只有警告的欲刪除房號會放到這裏
        this.tempDeleteNumber = item
        this.dialog.setDialog({
          type: 'confirmDeleteRoomNumber',
          show: true
        })
      } else {
        handler.deleteCacheRoomNumber(item)
      }
      this.records = this._.clone(this.cacheRoomNumbers)
    },
    // 警告，點擊確定
    confirmWarningHandler () {
      this.dialog.setDialog({
        type: 'confirmDeleteRoomNumber',
        show: false
      })
      this.cacheRoomNumbers.forEach(room => {
        if (room.roomNumber === this.tempDeleteNumber.roomNumber) {
          room.action = 'delete'
        }
      })
    },
    // 房號編輯，點選取消（每一次打開房號編輯的操作算一個週期）
    async clearCacheRoomNumbersHandler () {
      if (this.records && !this.records.length) {
        this.cacheRoomNumbers = this._.clone(this.tempRoomType.roomItem)
      }
      if (this.records && this.records.length) {
        const result = await Promise.all([this.cacheRoomNumbers.map(async (room, index) => {
          this.records.forEach(record => {
            if (record.roomNumber === room.roomNumber) {
              if (record.action === 'post') {
                room.action = 'delete-now'
              }
              if (record.action === 'delete') {
                // 有 id 表示 DB 本來就該存在，沒有表示本來是要新增
                if (room.roomId) {
                  this.$set(this.cacheRoomNumbers[index], 'action', 'keep')
                } else {
                  this.$set(this.cacheRoomNumbers[index], 'action', 'post')
                }
              }
            }
          })
          return room
        })])
        if (result && result.length) {
          this.cacheRoomNumbers = this.cacheRoomNumbers.filter(room => {
            return room.action !== 'delete-now'
          })
        }
      }
      await this.dialog.setDialog({
        type: 'createRoomNumber',
        show: false
      })
      this.tempDeleteNumber = ''
      this.tempDeleteNumbers = []
    },
    // 房號編輯，點選確定
    async dispatchFetchRoomNumbersHandler () {
      this.records = this._.clone(this.cacheRoomNumbers)
      await this.dialog.setDialog({
        type: 'createRoomNumber',
        show: false
      })
    },
    cancelWarningHandler () {
      this.dialog.setDialog({
        type: 'confirmDeleteRoomNumber',
        show: false
      })
      this.tempDeleteNumber = ''
      this.cacheRoomNumbers.forEach((room, index) => {
        if (room.roomNumber === this.tempDeleteNumber) {
          if (room.roomId) {
            this.$set(this.cacheRoomNumbers[index], 'action', 'keep')
          } else {
            this.$set(this.cacheRoomNumbers[index], 'action', 'post')
          }
        }
      })
    },
    // 給新增房號判斷是否該房號重複用
    async getRoomNumberDataAll () {
      this.roomNumberDataAll = await _roomType.fetchGetRooms()
    },
    /* ------------------------------------ *\
       $UPLOAD FILES
    \* ------------------------------------ */
    async readURL (e) {
      this.fetchPostImageURL(e)
    }
  }
}
</script>
<template>
  <v-container class="views__theRoomType pt-0 page-fixed">
    <template v-if="rwd === 'xs'">
      <h1 class="text-left pb-1">
        房型編輯
      </h1>
      <div
        v-for="(item,index) in roomTypes"
        :key="index"
        class="mb-4"
      >
        <t-mobile-card
          :item="item"
          @action="showEditRoomType({isNew:false,item})"
        >
          <template #header>
            <span class="white--text">{{ item.roomTypeName }}</span>
          </template>
          <template #default>
            <div class="t-card__text t-card__text--title d-flex justify-start px-2">
              <span class="t-text--title text-left">{{ displayCardRoomNumber(item.roomItem) }}</span>
            </div>
            <div class="t-card__text d-flex justify-space-between px-2">
              <span class="t-text--subtitle">
                平日房價
              </span>
              <span class="t-text--subtitle">{{ item.weekdayPrice }}</span>
            </div>
            <div class="t-card__text d-flex justify-space-between px-2">
              <span class="t-text--subtitle">假日房價 </span>
              <span class="t-text--subtitle">{{ item.weekendPrice }}</span>
            </div>
          </template>
          <template #action>
            <v-spacer />
            <v-btn
              class="ma-1"
              color="primary"
              :disabled="isBtnDisabled"
              outlined
              rounded
              small
              @click.stop="showEditRoomType({isNew:false,item})"
            >
              編輯
            </v-btn>
            <v-btn
              class="ma-1"
              color="danger"
              dark
              depressed
              rounded
              small
              @click.stop="roomTypeConfirmHandler(item)"
            >
              刪除
            </v-btn>
          </template>
        </t-mobile-card>
      </div>
      <div class="my-3">
        <v-btn
          block
          class="rounded-lg"
          color="primary"
          depressed
          @click.stop="showEditRoomType({isNew:true})"
        >
          新增房型
        </v-btn>
      </div>
    </template>
    <template v-else>
      <v-toolbar flat>
        <h1>房型編輯</h1>
        <v-spacer />
        <v-btn
          color="primary"
          depressed
          @click.stop="showEditRoomType({isNew:true})"
        >
          新增房型
        </v-btn>
      </v-toolbar>

      <section>
        <v-data-table
          class="border--default"
          :footer-props="{
            itemsPerPageText:'每頁顯示',
            itemsPerPageAllText:'全部',
            firstIcon:'mdi-chevron-double-left',
            lastIcon:'mdi-chevron-double-right',
            prevIcon:'mdi-chevron-left',
            nextIcon:'mdi-chevron-right'
          }"
          :headers="headerRoomTypes"
          :items="roomTypes"
        >
          <template v-slot:[`item.roomItem`]="{item}">
            {{ item.roomItem.map(room => room.roomNumber).join(' ') ? item.roomItem.map(room => room.roomNumber).join(' ') : '沒有房號' }}
          </template>
          <template v-slot:[`item.weekdayPrice`]="{item}">
            <div
              v-math:round="item.weekdayPrice"
              v-price="item.weekdayPrice"
            />
          </template>
          <template v-slot:[`item.weekendPrice`]="{item}">
            <div
              v-math:round="item.weekendPrice"
              v-price="item.weekendPrice"
            />
          </template>
          <template v-slot:[`item.action`]="{item}">
            <div class="d-flex align-center justify-end">
              <v-btn
                class="mr-2"
                color="primary"
                :disabled="isBtnDisabled"
                outlined
                small
                @click.stop="showEditRoomType({isNew:false,item})"
              >
                編輯
              </v-btn>
              <v-btn
                color="danger"
                dark
                depressed
                small
                @click.stop="roomTypeConfirmHandler(item)"
              >
                刪除
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </section>
    </template>

    <!--新增房型-->
    <v-dialog
      v-model="dialogCreateRoomType"
      max-width="400"
      @click:outside="dialog.beforeSetDialog({initAction:'temp-room-type'},{type:'createRoomType',show:false})"
    >
      <v-card>
        <ValidationObserver ref="formInsertRoomType">
          <form>
            <v-card-title class="headline">
              <div>新增 / 編輯房型</div>
              <v-spacer />
              <v-btn
                icon
                @click="dialog.beforeSetDialog(
                  { initAction:'temp-room-type'},
                  { type:'createRoomType',show:false}
                )"
              >
                <v-icon>mdi-close-box</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row no-gutters>
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="房型名稱"
                    rules="required|max:30"
                  >
                    <v-text-field
                      v-model="tempRoomType.roomTypeName"
                      class="py-2 mx-2"
                      dense
                      :error-messages="errors"
                      label="房型名稱"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="tempRoomType.restPrice"
                    class="py-2 px-2"
                    dense
                    label="休息價位"
                  />
                </v-col>
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="入住人數"
                    rules="required"
                  >
                    <v-text-field
                      v-model="tempRoomType.roomAccommodate"
                      class="py-2 px-2"
                      dense
                      :error-messages="errors"
                      label="入住人數"
                      min="1"
                      required
                      type="number"
                    />
                  </ValidationProvider>
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="tempRoomType.restHourDefault"
                    class="py-2 px-2"
                    dense
                    :items="restHourDefaultItems"
                    label="休息基本時數"
                    required
                  />
                </v-col>
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="平日房價"
                    rules="required"
                  >
                    <v-text-field
                      v-model="tempRoomType.weekdayPrice"
                      class="py-2 px-2"
                      dense
                      :error-messages="errors"
                      label="平日房價"
                      required
                    />
                  </ValidationProvider>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="tempRoomType.restPerHour"
                    class="py-2 px-2"
                    dense
                    label="休息加時"
                  />
                </v-col>
                <v-col cols="6">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="假日房價"
                    rules="required"
                  >
                    <v-text-field
                      v-model="tempRoomType.weekendPrice"
                      class="py-2 px-2"
                      dense
                      :error-messages="errors"
                      label="假日房價"
                    />
                  </ValidationProvider>
                </v-col>
                <v-col cols="6">
                  <div class="d-flexm px-2">
                    <v-btn
                      block
                      class="mt-1"
                      color="success"
                      depressed
                      @click="handleClickShowDialogEditRoomNumbers"
                    >
                      房號新增 / 編輯
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="12">
                  <v-row
                    class="d-flex align-center px-2"
                    no-gutters
                  >
                    <v-col
                      class="caption"
                      cols="3"
                    >
                      假日時段：
                    </v-col>
                    <v-col cols="9">
                      <div
                        class="weekDays-selector my-4 d-flex justify-space-between"
                      >
                        <div
                          v-for="(day2,index2) in weekendDaysItems"
                          :key="index2"
                        >
                          <input
                            :id="day2.id"
                            v-model="tempRoomType.weekendDays"
                            :name="day2.name"
                            type="checkbox"
                            :value="day2.value"
                          >
                          <label :for="day2.id">{{ day2.name }}</label>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12">
                  <v-row
                    class="d-flex align-center px-2"
                    no-gutters
                  >
                    <v-col
                      class="caption"
                      cols="3"
                    >
                      圖片上傳：
                    </v-col>
                    <v-col cols="9">
                      <v-file-input
                        id="upload"
                        v-model="tempUploadFile"
                        class="my-4"
                        label="圖片上傳"
                        multiple
                        name="upload"
                        placeholder="選擇你的圖片"
                        prepend-icon="mdi-camera"
                        type="file"
                        @change="readURL($event)"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12">
                  <div
                    v-show="tempRoomType.url"
                    class="mx-2 my-4"
                  >
                    <img
                      id="hotelPic"
                      alt="hotel_pic"
                      height="100"
                      :src="tempRoomType.url"
                      width="100"
                    >
                  </div>
                </v-col>
                <!-- 房型描述 -->
                <v-col cols="12">
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="房型描述"
                    rules="max:300"
                  >
                    <v-textarea
                      v-model="tempRoomType.roomDescription"
                      auto-grow
                      background-color="grey lighten-2"
                      class="py-2 px-2"
                      counter
                      dense
                      :error-messages="errors"
                      label="房型描述"
                      row-height="20"
                      rows="3"
                    />
                  </ValidationProvider>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="mx-4 py-0">
              <v-checkbox
                v-model="tempRoomType.roomAddable"
                label="可否新增床位"
              />
              <v-spacer />
              <v-btn
                color="red"
                outlined
                small
                @click="closeInsertRoomTypeDialogHandler"
              >
                取消
              </v-btn>
              <v-btn
                color="primary"
                depressed
                small
                type="submit"
                @click.prevent="postHandler(utils.getHash('postHandler'))"
              >
                確認
              </v-btn>
            </v-card-actions>
          </form>
        </ValidationObserver>
      </v-card>
    </v-dialog>

    <!--房號編輯-->
    <v-dialog
      v-model="dialogCreateRoomNumber"
      max-width="290px"
      scrollable
      @click:outside="dialog.beforeSetDialog({initAction:'temp-room-numbers'},{type:'createRoomNumber',show:false})"
    >
      <v-card>
        <v-card-title>房號編輯</v-card-title>
        <v-divider />
        <v-card-text>
          <div class="d-flex my-2 align-center">
            <v-text-field
              v-model="tempCacheRoomNumbers"
              class="mr-2"
              dense
              flat
              hide-details
              label="適用房號"
              required
              @keydown.enter="setCacheRoomNumberHandler"
            />
            <v-btn
              color="success"
              dark
              depressed
              small
              style="margin-top:5px;"
              @click="setCacheRoomNumberHandler(tempCacheRoomNumbers)"
            >
              新增
            </v-btn>
          </div>
          <div
            v-for="(item,index) in displayRoomNumbers"
            :key="index"
            class="d-flex my-2 align-center"
          >
            <v-text-field
              v-model="displayRoomNumbers[index].roomNumber"
              class="mr-2"
              dense
              flat
              hide-details
              single-line
              @change="putCacheRoomNumberHandler({action:'put',roomId:displayRoomNumbers[index].roomId,roomNumber:$event})"
            />
            <v-btn
              color="danger"
              dark
              depressed
              small
              style="margin-top:5px;"
              @click="showDeleteNumberConfirmHandler(item)"
            >
              刪除
            </v-btn>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="danger"
            small
            text
            @click="clearCacheRoomNumbersHandler"
          >
            取消
          </v-btn>
          <v-btn
            color="primary"
            small
            text
            @click="dispatchFetchRoomNumbersHandler"
          >
            確認
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- confirm delete-->
    <t-dialog-confirm
      :t-actions="true"
      :t-confirm-text="'該房型還在使用中，是否確認刪除？'"
      :t-dialog="dialogConfirmDeleteRoomType"
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
          @click="dialog.setDialog({type:'confirmDeleteRoomType',show:false})"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          depressed
          small
          @click="deleteRoomTypeHandler"
        >
          確認
        </v-btn>
      </template>
    </t-dialog-confirm>

    <!-- confirm delete room number -->
    <t-dialog-confirm
      :t-actions="true"
      :t-confirm-text="'房號一經刪除，將永久刪除此房號的 ID。這將導致其他功能無法正常顯示該房號（即使新增一個一模一樣的房號）。請妥善運用！'"
      :t-dialog="dialogConfirmDeleteRoomNumber"
      :t-persistent="true"
      :t-text-class="'subtitle-2'"
    >
      <template v-slot:title>
        <div class="danger--text">
          警告：確定要刪除房號？
        </div>
      </template>
      <template v-slot:actions>
        <v-btn
          color="danger"
          outlined
          small
          @click="cancelWarningHandler"
        >
          取消
        </v-btn>
        <v-btn
          color="primary"
          depressed
          small
          @click="confirmWarningHandler"
        >
          確認
        </v-btn>
      </template>
    </t-dialog-confirm>
  </v-container>
</template>
