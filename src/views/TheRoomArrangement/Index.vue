<script>
import ROOM_STATUS from '@/constants/roomStatus'
import { mapState } from 'vuex'
import { mixinRoomActions } from '@/mixins/roomActions.mixin'
import { mixinToday } from '@/mixins/today.mixin'
import { mixinInsertBooking } from '@/mixins/insertBooking.mixin'
import { mixinPayment } from '@/mixins/payment.mixin'
import { mixinUnCheckIn } from '@/mixins/unCheckIn.mixin'
import { mixinPagination } from '@/mixins/pagination.mixin'
import { createDialog } from '@/utils/helpers/createDialog'
import { createRooms } from '@/utils/create/createRooms'
import { createArrangementBar } from '@/utils/create/createArrangementBar'
import { createArrangementCell } from '@/utils/create/createArrangementCell'
import { createArrangementTooltip } from '@/utils/create/createArrangementTooltip'
import { createValidate } from '@/utils/helpers/createValidate'
import { createUtils } from '@/utils/helpers/createUtils'
import eventService from '../../utils/eventService'
import TDialogRoomStatusDetail from '@/components/TDialogRoomStatusDetail'// 2021/2/20:房卡的資料與狀態
import { mixinOrderInfo } from '@/mixins/orderInfo.mixin'// 2021/2/20:房卡的資料與狀態
import { mixinUtils } from '@/mixins/utils.mixin'// 2021/3/3:測試用
import LayoutDefault from '@/components/layout/LayoutDefault'// 2021/3/3:測試用
const CardUnArrangement = () => import('@/components/CardUnArrangement.vue')

const TCardDragAndDropBar = () => import('@/components/TCardDragAndDropBar.vue')
const TDragAndDropBar = () => import('@/components/TDragAndDropBar.vue')
const _rooms = createRooms()
const _v = createValidate()
const _utils = createUtils()
const _arrangementBar = createArrangementBar()
const _arrangementCell = createArrangementCell()
const _arrangementTooltip = createArrangementTooltip()
export default {
  name: 'TheDailySchedule', // 2021/3/3:測試用
  components: {
    TDialogRoomStatusDetail,
    CardUnArrangement,
    TCardDragAndDropBar,
    TDragAndDropBar
  },
  mixins: [
    mixinToday,
    mixinInsertBooking,
    mixinPayment,
    mixinUnCheckIn,
    mixinPagination,
    mixinRoomActions,
    mixinOrderInfo, // 2021/2/20:房卡的資料與狀態
    mixinUtils, // 2021/3/3:測試用
    LayoutDefault// 2021/3/3:測試用
  ],
  data () {
    return {
      dialog: null,
      // tooltip
      isToolTipShow: false,
      tooltipData: [],
      // navbar fixed
      sticky: null,
      container: null,
      header: null,
      headerGhost: null,
      isHeaderFixed: false,
      scrollTimeout: null,
      tableTop: null,
      tableBottom: null,
      headerHeight: null,
      // this is for edge-size
      stop: true, // this is for drag item to top and bottom smoothly
      dateSearchDay: '',
      /* ------------------------------------ *\
        $UNARRANGEMENT
      \* ------------------------------------ */
      unArrangeCardsData: [],
      arrangeItem: {},
      tempArrangeItem: {
        roomId: ''
      },
      arrangeNumberItems: [],
      /* ------------------------------------ *\
        $BAR DETAIL
      \* ------------------------------------ */
      displayCardData: [],
      priceItem: {},
      cardItem: {},
      /* ------------------------------------ *\
        $DRAG & DROP
      \* ------------------------------------ */
      // dialog
      // dialogDragAndDropBar: false,
      // loacl data
      getDragAndDropOriginData: {},
      specificData: [],
      // temp
      tempCardInfo: {
        bookingDetailId: '',
        checkIn: '',
        checkOut: '',
        customerName: '',
        numberOfPeople: '',
        roomTypeId: '',
        roomId: '',
        roomStatus: ''
      },
      roomStatusData: [],
      // mobile
      originalX: '',
      originalY: '',
      activeEvent: '',
      cleaningCardsItem: {}// 2021/2/20:房卡的資料與狀態
    }
  },
  computed: {
    ...mapState({
      currentDay: state => state.date.currentDay,
      isLoading: state => state.loading.isLoading,
      dialogArrangement: state => state.dialog.map.arrangement,
      dialogUnCheckIn: state => state.dialog.map.unCheckIn, // 2021/2/20:房卡的資料與狀態
      dialogCheckIn: state => state.dialog.map.checkIn, // 2021/2/20:房卡的資料與狀態
      dialogRest: state => state.dialog.map.rest, // 2021/2/20:房卡的資料與狀態
      dialogReserve: state => state.dialog.map.reserve, // 2021/2/20:房卡的資料與狀態
      dialogCheckOut: state => state.dialog.map.checkOut, // 2021/2/20:房卡的資料與狀態
      dialogCleaning: state => state.dialog.map.cleaning, // 2021/2/20:房卡的資料與狀態
      dialogChangeRoom: state => state.dialog.map.changeRoom, // 2021/2/20:房卡的資料與狀態
      cRPrice: state => state.changeRoom.price, // 2021/2/20:房卡的資料與狀態
      cRPayment: state => state.changeRoom.payment, // 2021/2/20:房卡的資料與狀態
      cRDifference: state => state.changeRoom.difference, // 2021/2/20:房卡的資料與狀態
      dialogMultiCleanOption: state => state.dialog.map.multiCleanOption, // 2021/2/20:房卡的資料與狀態
      dialogChooseCheckOutRoomToClean: state => state.dialog.map.chooseCheckOutRoomToClean// 2021/2/20:房卡的資料與狀態
    }),
    rwd () {
      return this.$vuetify.breakpoint.name
    },
    /* ------------------------------------ *\
      $DRAG & DROP
    \* ------------------------------------ */
    displayCell () {
      const newData = []
      if (this.roomStatusData.length) {
        this.roomStatusData.forEach((el) => {
          const rowItem = []
          if (this.rwd === 'xs') {
            for (let i = 0; i < 4; i++) {
              const item = {
                roomTypeId: el.roomTypeId,
                roomId: el.roomId,
                roomNumber: el.roomNumber,
                roomAccommodate: +el.roomAccommodate,
                sectionId: this.$date(
                  this.displayDaysData(this.currentDay)[i]
                ).format('YYYYMMDD')
              }
              rowItem.push(item)
            }
          } else {
            for (let i = 0; i < 14; i++) {
              const item = {
                roomTypeId: el.roomTypeId,
                roomId: el.roomId,
                roomNumber: el.roomNumber,
                roomAccommodate: +el.roomAccommodate,
                sectionId: this.$date(
                  this.displayDaysData(this.currentDay)[i]
                ).format('YYYYMMDD')
              }
              rowItem.push(item)
            }
          }
          newData.push(rowItem)
        })
      }
      return newData
    },
    displayBar () {
      if (this.roomStatusData && this.roomStatusData.length) {
        const roomNumbers = this.roomStatusData.map((el) => el.roomNumber)
        const roomNumberIndex = (roomNumber) => roomNumbers.indexOf(roomNumber)
        const daysData = this.displayDaysData(this.currentDay).map((el) =>
          this.$date(el).format('YYYYMMDD')
        )
        const checkInDayIndex = (checkIn) => daysData.indexOf(checkIn)
        const checkOutDayIndex = (checkOut) => daysData.indexOf(checkOut)
        const TOTAL_DAYS_DESKTOP = 14
        const TOTAL_DAYS_MOBILE = 4
        const cellHeight = 60
        const cellWidth = 70
        const baseBarHeight = 40
        const baseBarWidth = cellWidth
        return this.specificData && this.specificData.length
          ? this.specificData.map((el) => {
            const realTop =
                cellHeight * (roomNumberIndex(el.roomNumber) + 1) +
                (cellHeight / 2 - baseBarHeight / 2)
            const checkInIndex = checkInDayIndex(
              this.$date(el.expectedCheckInTime).format('YYYYMMDD')
            )
            const checkOutIndex = checkOutDayIndex(
              this.$date(el.expectedCheckOutTime).format('YYYYMMDD')
            )
            let realLeft = cellWidth * (checkInIndex + 1) + cellWidth / 2
            let realWidth = baseBarWidth * el.stayingDay - 1
            let display = ''
            let borderRadius = ''

            // not overlap
            if (el.roomStatus === '4' || el.stayingDay === '') {
              if (checkInIndex === checkOutIndex) {
                realWidth = baseBarWidth
                realLeft =
                    cellWidth * (checkInIndex + 1) +
                    cellWidth / 2 -
                    baseBarHeight / 2 // set bar start position to `circle`'s position
                realWidth = baseBarHeight // set the circle's width
                el.style = `position:absolute;top:${realTop}px;left:${realLeft}px;width:${realWidth}px;display:${display};z-index:0;`
              } else {
                realWidth = baseBarWidth * 1
                borderRadius = '45px'
                el.style = `position:absolute;top:${realTop}px;left:${realLeft}px;width:${realWidth}px;display:${display};z-index:0;border-radius:${borderRadius};`
              }
            }

            //  only checkOut side
            if (checkInIndex === -1 && checkOutIndex !== -1) {
              realLeft = 1 // clear the border verticle line leave
              realWidth =
                  cellWidth +
                  (checkOutIndex + 1) * cellWidth -
                  cellWidth / 2 -
                  1
            }

            if (this.rwd === 'xs') {
              if (
                checkInIndex === -1 &&
                  checkOutIndex === -1 &&
                  el.stayingDay < `${TOTAL_DAYS_MOBILE + 1}`
              ) {
                display = 'none'
                el.style = `position:absolute;top:${realTop}px;left:${realLeft}px;width:${realWidth}px;display:${display};z-index:0;`
                return el
              }

              if (
                checkInIndex === -1 &&
                  checkOutIndex === -1 &&
                  el.stayingDay > `${TOTAL_DAYS_MOBILE}`
              ) {
                const isLess =
                    this.$date(el.expectedCheckInTime).unix() <
                    this.$date(this.displayDaysData(this.currentDay)[0]).unix()
                const isOver =
                    this.$date(el.expectedCheckOutTime).unix() >
                    this.$date(
                      this.displayDaysData(this.currentDay)[13]
                    ).unix()
                if (isLess && isOver) {
                  display = 'block'
                } else {
                  display = 'none'
                }
                el.style = `position:absolute;top:${realTop}px;left:${realLeft}px;width:${realWidth}px;display:${display};z-index:0;`
                return el
              }
            } else {
              if (
                checkInIndex === -1 &&
                  checkOutIndex === -1 &&
                  el.stayingDay < `${TOTAL_DAYS_DESKTOP + 1}`
              ) {
                display = 'none'
                el.style = `position:absolute;top:${realTop}px;left:${realLeft}px;width:${realWidth}px;display:${display};z-index:0;`
                return el
              }

              if (
                checkInIndex === -1 &&
                  checkOutIndex === -1 &&
                  el.stayingDay > `${TOTAL_DAYS_DESKTOP}`
              ) {
                const isLess =
                    this.$date(el.expectedCheckInTime).unix() <
                    this.$date(this.displayDaysData(this.currentDay)[0]).unix()
                const isOver =
                    this.$date(el.expectedCheckOutTime).unix() >
                    this.$date(
                      this.displayDaysData(this.currentDay)[13]
                    ).unix()
                if (isLess && isOver) {
                  display = 'block'
                } else {
                  display = 'none'
                }
                el.style = `position:absolute;top:${realTop}px;left:${realLeft}px;width:${realWidth}px;display:${display};z-index:0;`
                return el
              }
            }

            el.style = `position:absolute;top:${realTop}px;left:${realLeft}px;width:${realWidth}px;display:${display};z-index:0;border-radius:${borderRadius}`
            return el
          })
          : []
      }
      return []
    },
    displayBarText () {
      return (item) => {
        switch (item.roomStatus) {
          case ROOM_STATUS.UNCHECKIN_KEY:
          case ROOM_STATUS.UNCHECKIN_REST_KEY:
          case ROOM_STATUS.REST_UNCHECKIN_KEY:
            return [`${item.customerName}`, ROOM_STATUS.UNCHECKIN_VALUE]
          case ROOM_STATUS.CHECKIN_KEY:
            return [`${item.customerName}`, ROOM_STATUS.CHECKIN_VALUE]
          case ROOM_STATUS.UNCLEAN_KEY:
            return [ROOM_STATUS.UNCLEAN_VALUE]
          case ROOM_STATUS.CLEANING_KEY:
            return [ROOM_STATUS.CLEANING_VALUE]
          case ROOM_STATUS.REST_KEY:
            return [ROOM_STATUS.REST_VALUE]
          case ROOM_STATUS.RESERVE_KEY:
            return [ROOM_STATUS.RESERVE_VALUE]
          case ROOM_STATUS.REST_RESERVE_KEY:
            return [ROOM_STATUS.REST_VALUE, ROOM_STATUS.RESERVE_VALUE]
          case ROOM_STATUS.CHECKIN_UNCHECKIN_KEY:
            return [
              `${item.customerName}`,
              ROOM_STATUS.CHECKIN_UNCHECKIN_VALUE
            ]
          case ROOM_STATUS.UNCLEAN_UNCHECKIN_KEY:
            return [
              `${item.customerName}`,
              ROOM_STATUS.UNCLEAN_UNCHECKIN_VALUE
            ]
          case ROOM_STATUS.CLEANING_UNCHECKIN_KEY:
            return [
              `${item.customerName}`,
              ROOM_STATUS.CLEANING_UNCHECKIN_VALUE
            ]
        }
      }
    }
  },
  mounted () {
    this.$bus.$on('change', async () => {
      await this.getDragAndDropsHandler()
      this.getUnArrangementHandler()
    })
    this.initScrollDaybarFixed()
  },
  updated () { // updated 2021/2/20:房卡的資料與狀態
    this.$bus.$on('init-temp-cleaning', payload => {
      this.$refs.cardCheckOut.reset()
      this.cleaningCardsItem.cleaningStaffId = ''
    })
    this.$bus.$on('init-temp-multi-clean', payload => {
      this.$refs.multiClean.reset()
      this.tempMultiClean.staffId = null
    })
    this.$bus.$on('clear-temp-changeroom', payload => {
      this.$refs.tempChangeRoom.reset()
    })
  },
  async created () {
    await this.getDragAndDropsHandler()
    this.getUnArrangementHandler()
    this.dialog = createDialog()
  },
  beforeDestroy () { // updated 2021/2/20:房卡的資料與狀態
    window.clearInterval(this.timerOfShowCards)
    this.$bus.$off('init-temp-multi-clean')
    this.$bus.$off('init-temp-cleaning')
  },
  methods: {
    async getBarsHandler () {
      const date = {
        fromDate: this.$date(this.displayDaysData(this.currentDay)[0])
          .format('YYYY-MM-DD'),
        endDate: this.$date(this.displayDaysData(this.currentDay)[13])
          .format('YYYY-MM-DD')
      }
      const basicBar = await _arrangementBar.fetchGetRoomStatusSpecificDate(date)
      if (basicBar.length) {
        const drops = _arrangementBar.getDropBar(basicBar)
        const modifiers = await _arrangementBar.getRoomStatusModiferBar(drops)
        const result = await _arrangementBar.getFilledBar(modifiers)
        this.specificData = result
        return this.specificData
      }
    },
    async getCellsHandler () {
      this.roomStatusData = await _arrangementCell.getCell()
      if (this.roomStatusData.length) {
        return this.roomStatusData
      }
    },
    async getDragAndDropsHandler () {
      await Promise.all([
        await this.getBarsHandler(),
        await this.getCellsHandler()
      ])
    },
    async handleMouseEnterContextMenu (item) {
      try {
        const shouldGetTooltipData = _arrangementTooltip.validTooltip(item)
        if (shouldGetTooltipData) {
          this.isToolTipShow = true
          this.tooltipData = await _arrangementTooltip.getTooltips(item)
          if (this.tooltipData && this.tooltipData.length) {
            this.isToolTipShow = true
          }
          return
        }
        if (!shouldGetTooltipData) {
          this.tooltipData = []
          return
        }
      } catch (err) {
        console.log(err)
      }
    },
    handleMouseLeaveContextMenu () {
      this.isToolTipShow = false
    },
    /* ------------------------------------ *\
      $FIXED NAVBAR
    \* ------------------------------------ */
    // Navbar 碰到頁面最上方時執行
    freeze (el, from) {
      // let traverse = el.firstChild
      // let traverseFrom = from.firstChild

      // if (el.style) {
      //   el.style.width = from.clientWidth + 'px'
      // }

      // while (traverse && traverseFrom) {
      //   this.freeze(traverse, traverseFrom)
      //   traverse = traverse.nextSibling
      //   console.log(traverse)
      //   traverseFrom = traverseFrom.nextSibling
      // }
    },
    // 滾輪事件
    handleScrollTable () {
      // 滾輪滑動距離
      const scrollTop = window.scrollY

      if (!this.scrollTimeout) {
        // offsetTop：DOM A 離 offsetParent 最外層的距離
        // offsetParent：DOM A 的 offsetParent 是離 A 最近的父層 DOM（必須要有定位）
        // offsetHeight：DOM A 元素高度（含內外 border）

        // 表格距離最上方高度，為 76（注意手機版為 ）
        this.tableTop = this.container.offsetTop

        let traverse = this.container.offsetParent
        this.headerHeight = this.header.offsetHeight

        // 從第一個 offsetParent 開始不斷往上找到最上層（body）
        // 但既然找到最上層是 body，為什麼不直接就用 body？
        // 所以就直接改成 this.tableTop = 76
        while (traverse) {
          this.tableTop += traverse.offsetTop
          traverse = traverse.offsetParent
        }
        // this.tableTop = this.container.offsetTop

        // 整個表格 + 表格距離 offsetParent 的高度
        this.tableBottom = this.tableTop + this.container.offsetHeight
      }
      // this.scrollTimeout 這功能我猜有點像是 lodash debounce 吧？
      window.clearTimeout(this.scrollTimeout)
      this.scrollTimeout = window.setTimeout(() => {
        this.scrollTimeout = window.clearTimeout(this.scrollTimeout)
      }, 1000)

      //  滿足以下情況，headerGhost 出現
      if (this.tableTop < scrollTop && scrollTop < this.tableBottom) {
        if (!this.sticky) {
          this.sticky = true
          this.headerGhost.classList.remove('t-table__row--header--hidden')
          this.freeze(this.headerGhost, this.header)
        }
        if (scrollTop > this.tableBottom - this.headerHeight) {
          this.headerGhost.style.transform = `translate(0, ${
            this.tableBottom - scrollTop - this.headerHeight
          }px)`
        } else {
          this.headerGhost.style.transform = 'translate(0, 0)'
        }
      } else {
        if (this.sticky) {
          this.sticky = false
          this.headerGhost.classList.add('t-table__row--header--hidden')
        }
      }
    },
    async initScrollDaybarFixed () {
      try {
        // 確定是否取得 tableContainer, tableHeader DOM
        const success = await new Promise((resolve) =>
          window.setTimeout(() => {
            this.container = window.document.getElementById('tableContainer')
            this.header = window.document.getElementById('tableHeader')

            return this.container && this.header
              ? resolve(true)
              : resolve(false)
          }, 1000)
        )

        if (success) {
          this.sticky = false

          this.headerGhost = window.document.getElementById('tableHeaderGhost')
          this.headerGhost.classList.add('t-table__row--header--sticky')
          this.headerGhost.classList.add('t-table__row--header--hidden')

          // this.container.appendChild(this.headerGhost)

          this.scrollTimeout = null

          window.addEventListener('scroll', this.handleScrollTable)
          window.addEventListener('resize',
            () => this.freeze(this.headerGhost, this.header)
          )
        }
      } catch (err) {
        console.log(err)
      }
    },
    /* ------------------------------------ *\
      $UNARRANGEMENT
    \* ------------------------------------ */
    makeUnArrangementOrder () {
      let unArrangementOrder = []
      const fetchGetRoomType = async () => {
        const res = await eventService.showRoomType()
        if (res.data.success) {
          return res.data.fetch.rooms
        }
      }
      const fetchGetUnArrangementOrder = async () => {
        try {
          const res = await eventService.showUnArrangementOrder()
          if (res.data.fetch.showUnArrangeCards.length) {
            return res.data.fetch.showUnArrangeCards
          } else {
            return []
          }
        } catch (err) {
          console.log(err)
        }
      }
      const getUnArrangementOrderWithImageUrl = async (unArrangementOrder) => {
        if (unArrangementOrder.length) {
          const roomTypes = await fetchGetRoomType()
          return unArrangementOrder.map((order) => {
            roomTypes.forEach((roomType) => {
              if (roomType.roomTypeName === order.roomTypeName) {
                if (!roomType.roomImage) {
                  this.$set(
                    order,
                    'imageUrl',
                    'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1949&q=80'
                  )
                } else {
                  this.$set(
                    order,
                    'imageUrl',
                    `${process.env.VUE_APP_ROOM_TYPE_BASEURL}/${roomType.roomImage}`
                  )
                }
              }
            })
            return order
          })
        } else {
          unArrangementOrder = []
        }
      }
      const setUnArrangementOrder = async () => {
        const fetchData = await fetchGetUnArrangementOrder()
        if (fetchData.length) {
          unArrangementOrder = await getUnArrangementOrderWithImageUrl(
            fetchData
          )
        }
      }
      const getUnArrangementOrder = () => {
        return unArrangementOrder
      }
      return {
        fetchGetRoomType,
        fetchGetUnArrangementOrder,
        setUnArrangementOrder,
        getUnArrangementOrder
      }
    },
    async getUnArrangementHandler () {
      try {
        const handler = this.makeUnArrangementOrder()
        await handler.setUnArrangementOrder()
        this.unArrangeCardsData = handler.getUnArrangementOrder()
      } catch (err) {
        console.log(err)
      }
    },
    async updateArrangeRoomNumber (data) {
      const res = await eventService.updateArrangeRoomNumber(data)
      if (res.data.success) {
        await this.getDragAndDropsHandler()
        await this.dialog.setDialog({
          autoClose: true,
          msg: '房型更新成功',
          type: 'success'
        })

        this.getUnArrangementHandler()
      } else {
        if (res.data.fetch.message === 'error: this room has been arranged') {
          await this.dialog.setDialog({
            autoClose: true,
            msg: '該房型已被安排房間',
            type: 'failed'
          })
          return
        }
        if (res.data.fetch.message === 'error: this room cant be arranged') {
          await this.dialog.setDialog({
            autoClose: true,
            msg: '該房間無法進行此操作',
            type: 'failed'
          })
        }
      }
    },
    async handleClickShowDialogArrange (item) {
      this.arrangeItem = item
      let rooms = await _rooms.fetchGetRoomsNumber()
      rooms = _v.isArrays(rooms)
        ? rooms
          .filter(room => room.roomTypeId === item.roomTypeId)
          .map(room => {
            return {
              text: room.roomNumber,
              value: room.roomId
            }
          })
        : []
      this.arrangeNumberItems = rooms
      this.dialog.setDialog({
        type: 'arrangement',
        show: true
      })
    },
    async handleClickArrangeRoom () {
      const item = Object.assign(
        _utils.pickProps(this.arrangeItem, [
          'roomId',
          'roomTypeId',
          'roomStatus',
          'bookingDetailId',
          'fromDate',
          'endDate'
        ]),
        {
          roomId: this.tempArrangeItem.roomId,
          fromDate: this.arrangeItem.expectedCheckInTime,
          endDate: this.arrangeItem.expectedCheckOutTime
        }
      )
      await this.dialog.setDialog({
        type: 'arrangement',
        show: false
      })
      await this.updateArrangeRoomNumber(item)
      this.tempArrangeItem = { roomId: '' }
    },
    /* ------------------------------------ *\
        $DRAG & DROP
    \* ------------------------------------ */
    // 增加感應到頁面需要往下、往上的面積。關於拖至上方及底部
    scroll (step) {
      this._$win.scrollTo({ top: this._$win.pageYOffset + step, left: 0 })
      if (!this.stop) {
        setTimeout(() => {
          this.scroll(step)
        }, 20)
      }
    },
    dgStart (ev) {
      this.tempCardInfo.bookingDetailId = ev.target.dataset.bookingDetailId
      this.tempCardInfo.checkIn = ev.target.dataset.checkIn
      this.tempCardInfo.checkOut = ev.target.dataset.checkOut
      this.tempCardInfo.customerName = ev.target.dataset.customerName
      this.tempCardInfo.numberOfPeople = ev.target.dataset.numberOfPeople
      this.tempCardInfo.roomTypeId = ev.target.dataset.roomTypeId
      this.tempCardInfo.roomId = ev.target.dataset.roomId
      this.tempCardInfo.roomStatus = ev.target.dataset.roomStatus
    },
    dg (ev) {
      this.stop = true
      if (ev.clientY < 150) {
        this.stop = false
        this.scroll(-1)
      }
      if (ev.clientY > window.document.documentElement.clientHeight - 150) {
        this.stop = false
        this.scroll(1)
      }
    },
    dgEnd (ev) {
      this.stop = true
    },
    dgOver (ev) {
      ev.preventDefault()
      // valid
      const isSameRoomType = ev.target.dataset.roomTypeId === this.tempCardInfo.roomTypeId
      // const isCellAvailable = 0
      if (isSameRoomType) {
        ev.target.classList.add('t-cell--available')
      } else if (
        ev.target.dataset.roomStatus === '2' ||
        ev.target.dataset.roomStatus === '2-0' ||
        ev.target.dataset.roomStatus === '3' ||
        ev.target.dataset.roomStatus === '3-0'
      ) {
        ev.target.classList.add('t-cell--disable')
      } else {
        ev.target.classList.add('t-cell--disable')
      }
    },
    dgOverBar (ev) {
      // console.log('dgOverBar', ev.target)
    },
    dgLeave (ev) {
      ev.target.classList.remove('t-cell--available')
      ev.target.classList.remove('t-cell--disable')
    },
    async dp (ev) {
      ev.preventDefault()
      ev.target.classList.remove('t-cell--available')
      ev.target.classList.remove('t-cell--disable')
      if (ev.target.dataset.roomTypeId === this.tempCardInfo.roomTypeId) {
        // a handler function
        const data = {
          roomId: ev.target.dataset.roomId,
          roomTypeId: ev.target.dataset.roomTypeId,
          roomStatus: this.tempCardInfo.roomStatus,
          bookingDetailId: this.tempCardInfo.bookingDetailId,
          fromDate: this.$date(this.tempCardInfo.checkIn).format('YYYY-MM-DD'),
          endDate: this.$date(this.tempCardInfo.checkOut).format('YYYY-MM-DD')
        }
        this.updateArrangeRoomNumber(data)
      }
    },
    showToolTipHandler () {
      this.isToolTipShow = true
    },
    hideToolTipHandler () {
      this.isToolTipShow = false
    }
  }
}
</script>
<template>
  <div
    ref="windowTop"
    class="t-views__theRoomArrangement"
  >
    <template v-if="rwd === 'xs'">
      <section
        v-if="unArrangeCardsData && unArrangeCardsData.length"
        class="t-unArrangement d-flex"
      >
        <CardUnArrangement
          v-for="item in unArrangeCardsData"
          :key="item.bookingDetailId"
          :item="item"
          @dg="dg"
          @dg-end="dgEnd"
          @dg-start="dgStart"
          @dialog="handleClickShowDialogArrange"
        />
      </section>

      <div v-if="displayCell && displayCell.length">
        <div class="t-table--mobile d-flex justify-center">
          <div
            id="tableContainer"
            class="t-table__item mt-3 mb-5 elevation-8"
          >
            <div
              id="tableHeader"
              class="t-table__row--header t-table__row"
            >
              <div
                class="t-cell"
                style="color:#8a8f9c;font-size:12px;"
              >
                <div>All Rooms</div>
              </div>
              <div
                v-for="day in displayDaysData(currentDay)"
                :key="day"
                class="t-cell t-cell--datePicker"
                :class="day === $date(currentDay).format('YYYY/MM/DD')
                  ? 't-cell--current'
                  :'t-cell--nonCurrent'"
                @click="getSpecificDay(day)"
              >
                {{ $date(day).format('ddd MM/DD') }}
              </div>
            </div>
            <div
              v-show="sticky"
              id="tableHeaderGhost"
              class="t-table__row--header t-table__row"
            >
              <div
                class="t-cell"
                style="color:#8a8f9c;font-size:12px;"
              >
                <div>All Rooms</div>
              </div>
              <div
                v-for="day in displayDaysData(currentDay)"
                :key="day"
                class="t-cell t-cell--datePicker"
                :class="day === $date(currentDay).format('YYYY/MM/DD')
                  ? 't-cell--current'
                  :'t-cell--nonCurrent'"
                @click="getSpecificDay(day)"
              >
                {{ $date(day).format('ddd MM/DD') }}
              </div>
            </div>
            <div
              v-for="(rowItem,rowIndex) in displayCell"
              :key="rowIndex"
              class="t-table__row"
            >
              <div
                class="text-center t-cell"
                style="color:#8A8F9C;font-size:12px;z-index:1"
              >
                Room {{ rowItem[0].roomNumber }}
              </div>
              <template v-if="rowItem.length">
                <div
                  v-for="(section,sectionIndex) in rowItem"
                  :id="section.sectionId"
                  :key="sectionIndex"
                  :ref="`touchDropZone_${section.sectionId}`"
                  class="t-cell"
                  :data-accommodate="section.roomAccommodate"
                  :data-id="section.sectionId"
                  :data-room-id="section.roomId"
                  :data-room-status="section.roomStatus"
                  :data-room-type-id="section.roomTypeId"
                  @dragleave="dgLeave($event)"
                  @dragover="dgOver($event)"
                  @drop="dp($event)"
                />
              </template>
            </div>

            <div
              v-for="item in displayBar"
              :key="item.bookingDetailId"
              class="t-bar"
              :class="`bg__${item.roomStatus}`"
              :data-booking-detail-id="item.bookingDetailId"
              :data-check-in="item.expectedCheckInTime"
              :data-check-out="item.expectedCheckOutTime"
              :data-number-of-people="item.numberOfPeople"
              :data-room-id="item.roomId"
              :data-room-status="item.roomStatus"
              :data-room-type-id="item.roomTypeId"
              :data-staying-day="item.stayingDay"
              draggable="true"
              :style="item.style"
              @click="handleClickGetCardDetail(item)"
              @drag="dg($event)"
              @dragend="dgEnd($event)"
              @dragstart="dgStart($event)"
            >
              <div
                class="t-bar__item text-center"
                @mouseenter="handleMouseEnterContextMenu(item)"
                @mouseleave="handleMouseLeaveContextMenu"
              >
                <template v-if="displayBarText(item) && displayBarText(item).length">
                  <t-drag-and-drop-bar
                    :display-bar-text="displayBarText(item)"
                    :item="item"
                    :t-tooltip-show="isToolTipShow"
                  >
                    <template slot="popover">
                      <t-card-drag-and-drop-bar :t-room-card="tooltipData" />
                    </template>
                  </t-drag-and-drop-bar>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- drag and drop-->
    <template v-else>
      <v-main
        v-if="displayCell.length"
        class="pa-0"
      >
        <div class="d-flex justify-center">
          <div class="t-table">
            <div
              id="tableContainer"
              class="t-table__item mt-3 mb-5 elevation-8"
            >
              <div
                id="tableHeader"
                class="t-table__row t-table__row--header"
              >
                <div
                  class="t-cell"
                  style="color:#8a8f9c;font-size:12px;"
                >
                  <div>All Rooms</div>
                </div>
                <div
                  v-for="day in displayDaysData(currentDay)"
                  :key="day"
                  class="t-cell t-cell--datePicker"
                  :class="day === $date(currentDay).format('YYYY/MM/DD') ? 't-cell--current' :'t-cell--nonCurrent'"
                  @click="getSpecificDay(day)"
                >
                  {{ $date(day).format('ddd MM/DD') }}
                </div>
              </div>
              <div
                v-show="sticky"
                id="tableHeaderGhost"
                class="t-table__row t-table__row--header"
              >
                <div
                  class="t-cell"
                  style="color:#8a8f9c;font-size:12px;"
                >
                  <div>All Rooms</div>
                </div>
                <div
                  v-for="day in displayDaysData(currentDay)"
                  :key="day"
                  class="t-cell t-cell--datePicker"
                  :class="day === $date(currentDay).format('YYYY/MM/DD') ? 't-cell--current' :'t-cell--nonCurrent'"
                  @click="getSpecificDay(day)"
                >
                  {{ $date(day).format('ddd MM/DD') }}
                </div>
              </div>
              <div
                v-for="(rowItem,rowIndex) in displayCell"
                :key="rowIndex"
                class="t-table__row"
              >
                <div
                  class="text-center t-cell"
                  style="color:#8A8F9C;font-size:12px;z-index:1"
                >
                  Room {{ rowItem[0].roomNumber }}
                </div>
                <template v-if="rowItem.length">
                  <div
                    v-for="(section,sectionIndex) in rowItem"
                    :id="section.sectionId"
                    :key="sectionIndex"
                    class="t-cell"
                    :data-accommodate="section.roomAccommodate"
                    :data-id="section.sectionId"
                    :data-room-id="section.roomId"
                    :data-room-status="section.roomStatus"
                    :data-room-type-id="section.roomTypeId"
                    @dragleave="dgLeave($event)"
                    @dragover="dgOver($event)"
                    @drop="dp($event)"
                  />
                </template>
              </div>

              <div
                v-for="item in displayBar"
                :key="item.bookingDetailId"
                class="t-bar"
                :class="`bg__${item.roomStatus}`"
                :data-booking-detail-id="item.bookingDetailId"
                :data-check-in="item.expectedCheckInTime"
                :data-check-out="item.expectedCheckOutTime"
                :data-number-of-people="item.numberOfPeople"
                :data-room-id="item.roomId"
                :data-room-status="item.roomStatus"
                :data-room-type-id="item.roomTypeId"
                :data-staying-day="item.stayingDay"
                draggable="true"
                :style="item.style"
                @click="handleClickGetCardDetail(item)"
                @drag="dg($event)"
                @dragend="dgEnd($event)"
                @dragstart="dgStart($event)"
              >
                <div
                  class="t-bar__item text-center"
                  @mouseenter="handleMouseEnterContextMenu(item)"
                  @mouseleave="handleMouseLeaveContextMenu"
                >
                  <template v-if="displayBarText(item) && displayBarText(item).length">
                    <t-drag-and-drop-bar
                      :display-bar-text="displayBarText(item)"
                      :item="item"
                      :t-tooltip-show="isToolTipShow"
                    >
                      <template slot="popover">
                        <t-card-drag-and-drop-bar :t-room-card="tooltipData" />
                      </template>
                    </t-drag-and-drop-bar>
                  </template>
                </div>
              </div>
            </div>
          </div>
          <!-- un check in -->
          <div
            v-if="unArrangeCardsData && unArrangeCardsData.length"
            class="ml-3"
            style="width:300px"
          >
            <div class="t-card--unArrangement d-flex align-center justify-center">
              <div class="white--text">
                Unarrange Order
              </div>
            </div>
            <div class="t-unArrangement">
              <CardUnArrangement
                v-for="item in unArrangeCardsData"
                :key="item.bookingDetailId"
                :item="item"
                @dg="dg"
                @dg-end="dgEnd"
                @dg-start="dgStart"
                @dialog="handleClickShowDialogArrange"
              />
            </div>
          </div>
        </div>
      </v-main>
    </template>
    <v-dialog
      v-model="dialogArrangement"
      max-width="290"
      @click:outside="dialog.setDialog({
        type:'arrangement',
        show: false
      })"
    >
      <v-card>
        <v-card-title>
          房號安排：
        </v-card-title>
        <v-card-text>
          <v-row no-gutters>
            <v-col cols="12">
              <v-card-text class="d-flex justify-space-between px-0 py-1">
                <div>入住時間：</div>
                <div>{{ $date(arrangeItem.expectedCheckInTime).format('MM/DD') }}-{{ $date(arrangeItem.expectedCheckOutTime).format('MM/DD') }}</div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex justify-space-between px-0 py-1">
                <div>入住人數：</div>
                <div>{{ arrangeItem.numberOfPeople }}</div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex justify-space-between px-0 py-1">
                <div>房型：</div>
                <div>{{ arrangeItem.roomTypeName }}</div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-1">
                <v-select
                  v-model="tempArrangeItem.roomId"
                  :items="arrangeNumberItems"
                  placeholder="選擇房號"
                />
              </v-card-text>
            </v-col>
          </v-row>
          <div class="d-flex justify-space-between mt-5 pt-2">
            <v-spacer />
            <v-btn
              class="mr-2"
              color="warning"
              dark
              depressed
              small
              @click="dialog.setDialog({
                type:'arrangement',
                show:false
              })"
            >
              取消
            </v-btn>
            <v-btn
              color="success"
              depressed
              small
              @click="handleClickArrangeRoom"
            >
              確定
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- 2021/2/20:房卡的資料與狀態 -->
    <!-- 點選`訂` -->
    <t-dialog-room-status-detail
      :t-dialog="dialogUnCheckIn"
      :t-payment-item="priceItem"
      :t-room-card-item="cardItem"
      @check-in="handleClickCheckIn"
      @close-dialog="handleClickCloseCardDetail('unCheckIn')"
      @dialog="emitDialog"
      @dialog-change-room-handler="handleClickShowDialogChangeRoom"
    />

    <!-- 點選`住` -->
    <t-dialog-room-status-detail
      :t-dialog="dialogCheckIn"
      :t-payment-item="priceItem"
      :t-room-card-item="cardItem"
      @cancel-check-in="handleCancelCheckIn"
      @check-out="handleClickCheckOut"
      @close-dialog="handleClickCloseCardDetail('checkIn')"
      @dialog="emitDialog"
      @dialog-change-room-handler="handleClickShowDialogChangeRoom"
    />

    <!-- 點選`休` -->
    <t-dialog-room-status-detail
      :t-dialog="dialogRest"
      :t-payment-item="priceItem"
      :t-room-card-item="cardItem"
      @check-out="handleClickCheckOut"
      @close-dialog="handleClickCloseCardDetail('rest')"
      @dialog="emitDialog"
      @dialog-change-room-handler="handleClickShowDialogChangeRoom"
    />

    <!-- 點選`保` -->
    <t-dialog-room-status-detail
      :t-dialog="dialogReserve"
      :t-payment-item="priceItem"
      :t-room-card-item="cardItem"
      @cancel-booking="handleClickCancelBooking"
      @close-dialog="handleClickCloseCardDetail('reserve')"
      @dialog="emitDialog"
      @dialog-change-room-handler="handleClickShowDialogChangeRoom"
    />

    <!-- 點選`待` -->
    <v-dialog
      v-model="dialogCheckOut"
      max-width="290"
      @click:outside="dialog.beforeSetDialog({initAction:'temp-cleaning'},{type:'checkOut',show:false})"
    >
      <v-card>
        <validation-observer ref="cardCheckOut">
          <form>
            <v-card-title>下一筆訂單資訊</v-card-title>
            <v-card-text>
              <v-row no-gutters>
                <v-col cols="12">
                  <v-card-text class="d-flex px-0 py-2">
                    <div>宿期：</div>
                    <div>{{ cleaningCardsItem.nextBookingSection }}</div>
                  </v-card-text>
                  <v-card-text class="d-flex px-0 py-2">
                    <div>訂單備註：</div>
                    <div>{{ cleaningCardsItem.bookingNote }}</div>
                  </v-card-text>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="清潔人員"
                    rules="required"
                  >
                    <v-select
                      v-model="cleaningCardsItem.cleaningStaffId"
                      class="my-2"
                      dense
                      :error-messages="errors"
                      :items="cleaningStaffItems"
                      label="選擇清潔人員"
                      required
                    />
                  </ValidationProvider>
                </v-col>
              </v-row>

              <div class="d-flex justify-space-between mt-5 pt-2">
                <v-spacer />
                <v-btn
                  class="mr-2"
                  color="warning"
                  dark
                  depressed
                  small
                  @click="dialog.beforeSetDialog({initAction:'temp-cleaning'},{type:'checkOut',show:false})"
                >
                  取消
                </v-btn>
                <v-btn
                  color="success"
                  depressed
                  small
                  @click="handleClickCleaning(cleaningCardsItem)"
                >
                  清潔
                </v-btn>
              </div>
            </v-card-text>
          </form>
        </validation-observer>
      </v-card>
    </v-dialog>

    <!-- 點選`清` -->
    <v-dialog
      v-model="dialogCleaning"
      max-width="290"
      @click:outside="dialog.setDialog({
        type:'cleaning',
        show:false
      })"
    >
      <v-card>
        <v-card-title>下一筆訂單資訊</v-card-title>
        <v-card-text>
          <v-row no-gutters>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-2">
                <div>宿期：</div>
                <div>{{ cleaningCardsItem.nextBookingSection }}</div>
              </v-card-text>
            </v-col>
            <v-col cols="12">
              <v-card-text class="d-flex px-0 py-2">
                <div>訂單備註：</div>
                <div>{{ cleaningCardsItem.bookingNote }}</div>
              </v-card-text>
            </v-col>
          </v-row>
          <div class="d-flex justify-space-between mt-5 pt-2">
            <v-spacer />
            <v-btn
              class="mr-2"
              color="warning"
              dark
              depressed
              small
              @click="dialog.setDialog({
                type:'cleaning',
                show:false
              })"
            >
              取消
            </v-btn>
            <v-btn
              color="success"
              depressed
              small
              @click="handleClickCleaned(cleaningCardsItem)"
            >
              清潔完成
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 點選`換房` -->
    <v-dialog
      v-model="dialogChangeRoom"
      :max-width="changeRoomItem.roomStatus === '4' ? '700' : '600'"
      persistent
    >
      <template v-if="rwd === 'xs'">
        <validation-observer ref="tempChangeRoom">
          <v-card class="rounded-lg">
            <ValidationObserver ref="formChangeRoom">
              <form>
                <v-card-title>
                  換房作業：
                  <v-spacer />
                  <v-btn
                    icon
                    @click="dialog.setDialog({
                      type:'changeRoom',
                      show: false
                    })"
                  >
                    <v-icon>mdi-close-box</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text class="d-flex align-center justify-space-between px-4 py-1">
                  <span>入住時間</span>
                  <span>{{ $date(changeRoomItem.expectedCheckInTime).format('MM/DD') }} - {{ $date(changeRoomItem.expectedCheckOutTime).format('MM/DD') }}</span>
                </v-card-text>
                <v-card-text class="d-flex align-center justify-space-between px-4 py-1">
                  <span>入住人數</span>
                  <span>{{ changeRoomItem.numberOfPeople }}</span>
                </v-card-text>
                <v-card-text class="d-flex align-center justify-space-between px-4 py-1">
                  <span>原房型 / 號：</span>
                  <span>{{ changeRoomItem.roomTypeName }} / {{ changeRoomItem.roomNumber }}</span>
                </v-card-text>
                <v-card-text class="d-flex align-center justify-space-between px-4 py-1">
                  <span>新房型 / 號：</span>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="房型"
                    rules="required"
                  >
                    <v-select
                      v-model="tempChangeRoom.newRoomTypeId"
                      class="py-0 px-1"
                      dense
                      :error-messages="errors"
                      :items="roomTypeRestItems"
                      label="選擇房型"
                      outline
                      style="max-width:100px;"
                      @input="getNumberAndDiscoutByRoomType"
                    />
                  </ValidationProvider>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="房號"
                    rules="required"
                  >
                    <v-select
                      v-model="tempChangeRoom.newRoomNumberId"
                      class="py-0 px-1"
                      dense
                      :error-messages="errors"
                      :items="changeRoomNumberItems"
                      label="選擇房號"
                      no-data-text="請先選擇房型"
                      outline
                      style="max-width:100px;"
                      @input="clearDisccountError"
                    />
                  </ValidationProvider>
                </v-card-text>
                <v-card-text class="d-flex justify-space-between px-4 py-1">
                  <span>保留原始房價</span>
                  <ValidationProvider
                    v-slot="{ errors }"
                    name="保留原始房價"
                    rules="required"
                  >
                    <v-radio-group
                      class="mt-0 pt-0"
                      dense
                      :error-messages="errors"
                      hide-details
                      row
                      :value="keepPrice"
                    >
                      <v-radio
                        label="是"
                        value="1"
                        @click="setkeepPrice('1')"
                      />
                      <v-radio
                        label="否"
                        value="0"
                        @click="setkeepPrice('0')"
                      />
                    </v-radio-group>
                  </ValidationProvider>
                </v-card-text>
                <v-card-text class="d-flex align-center justify-space-between px-4 py-1">
                  <span>應收 {{ cRPrice }}</span>
                  <span>已收 {{ cRPayment }}</span>
                  <span>待收 {{ cRDifference }}</span>
                </v-card-text>
                <v-card-actions class="px-4 pb-3">
                  <v-spacer />
                  <v-btn
                    class="mr-2"
                    color="warning"
                    dark
                    depressed
                    small
                    @click="dialog.setDialog({
                      type:'changeRoom',
                      show:false
                    })"
                  >
                    取消
                  </v-btn>

                  <v-btn
                    color="success"
                    depressed
                    small
                    @click="handleClickChangeRoom"
                  >
                    確定
                  </v-btn>
                </v-card-actions>
              </form>
            </ValidationObserver>
          </v-card>
        </validation-observer>
      </template>
      <template v-else>
        <validation-observer ref="tempChangeRoom">
          <v-card>
            <ValidationObserver ref="formChangeRoom">
              <form>
                <v-card-title>
                  換房作業
                  <v-spacer />
                  <v-btn
                    icon
                    @click="dialog.afterSetDialog({type:'changeRoom',show:false},{afterAction:'clear-temp-changeroom'})"
                  >
                    <v-icon v-text="'mdi-close-box'" />
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>訂房日期：</div>
                        <div
                          v-if="changeRoomItem.roomStatus === '4'"
                        >
                          {{ $date(changeRoomItem.bookingDate).format('YYYY/MM/DD HH:mm:ss') }}
                        </div>
                        <div v-else>
                          {{ $date(changeRoomItem.bookingDate).format('YYYY/MM/DD') }}
                        </div>
                      </v-card-text>
                    </v-col>
                    <v-col cols="8">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>原房型/房間：</div>
                        <div>{{ changeRoomItem.roomTypeName }}</div>
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-row
                    class="d-flex align-center"
                    no-gutters
                  >
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>入住日期：</div>
                        <div
                          v-if="changeRoomItem.roomStatus === '4'"
                        >
                          {{ $date(changeRoomItem.expectedCheckInTime).format('YYYY/MM/DD HH:mm:ss') }}
                        </div>
                        <div
                          v-else
                        >
                          {{ $date(changeRoomItem.expectedCheckInTime).format('YYYY/MM/DD') }}
                        </div>
                      </v-card-text>
                    </v-col>
                    <v-col cols="8">
                      <v-row
                        class="d-flex align-center"
                        no-gutters
                      >
                        <v-col cols="3">
                          <v-card-text class="d-flex px-0 py-1">
                            更換為
                          </v-card-text>
                        </v-col>
                        <v-col cols="9">
                          <v-card-text class="d-flex px-0 py-1">
                            <ValidationProvider
                              v-slot="{ errors }"
                              name="房型"
                              rules="required"
                            >
                              <v-select
                                v-model="tempChangeRoom.newRoomTypeId"
                                class="py-0 px-2"
                                dense
                                :error-messages="errors"
                                :items="roomTypeRestItems"
                                label="選擇房型"
                                outline
                                style="max-width:150px;"
                                @input="getNumberAndDiscoutByRoomType"
                              />
                            </ValidationProvider>
                            <ValidationProvider
                              v-slot="{ errors }"
                              name="房號"
                              rules="required"
                            >
                              <v-select
                                v-model="tempChangeRoom.newRoomNumberId"
                                class="py-0 px-2"
                                dense
                                :error-messages="errors"
                                :items="changeRoomNumberItems"
                                label="選擇房號"
                                no-data-text="請先選擇房型"
                                outline
                                style="max-width:150px;"
                                @input="clearDisccountError"
                              />
                            </ValidationProvider>
                          </v-card-text>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>退房日期：</div>
                        <div
                          v-if="changeRoomItem.roomStatus === '4'"
                        >
                          {{ $date(changeRoomItem.expectedCheckOutTime).format('YYYY/MM/DD HH:mm:ss') }}
                        </div>
                        <div
                          v-else
                        >
                          {{ $date(changeRoomItem.expectedCheckOutTime).format('YYYY/MM/DD') }}
                        </div>
                      </v-card-text>
                    </v-col>
                    <v-col cols="8">
                      <v-row
                        class="d-flex align-center"
                        no-gutters
                      >
                        <v-col cols="3">
                          <v-card-text class="d-flex px-0 py-1">
                            <div>入住人數：</div>
                            <div>{{ changeRoomItem.roomAccommodate }}</div>
                          </v-card-text>
                        </v-col>
                        <v-col cols="9">
                          <v-card-text class="d-flex align-center px-0 py-1">
                            <div class="mx-2">
                              保留原始房價
                            </div>
                            <ValidationProvider
                              v-slot="{ errors }"
                              name="保留原始房價"
                              rules="required"
                            >
                              <v-radio-group
                                class="mt-0 pt-0"
                                dense
                                :error-messages="errors"
                                hide-details
                                row
                                :value="keepPrice"
                              >
                                <v-radio
                                  label="是"
                                  value="1"
                                  @click="setkeepPrice('1')"
                                />
                                <v-radio
                                  label="否"
                                  value="0"
                                  @click="setkeepPrice('0')"
                                />
                              </v-radio-group>
                            </ValidationProvider>
                          </v-card-text>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>應收：</div>
                        <div
                          v-math:round="cRPrice"
                          v-price="cRPrice"
                        />
                      </v-card-text>
                    </v-col>
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>已收：</div>
                        <div
                          v-math:round="cRPayment"
                          v-price="cRPayment"
                        />
                      </v-card-text>
                    </v-col>
                    <v-col cols="4">
                      <v-card-text class="d-flex px-0 py-1">
                        <div>待收：</div>
                        <div
                          v-math:round="cRDifference"
                          v-price="cRDifference"
                        />
                      </v-card-text>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <div
                      v-show="showDiscountError"
                      class="danger--text"
                    >
                      請先選擇房型及房號！
                    </div>
                  </v-row>
                  <div class="d-flex justify-space-between mt-5 pt-2">
                    <v-spacer />
                    <v-btn
                      class="mr-2"
                      color="warning"
                      dark
                      depressed
                      small
                      @click="dialog.setDialog({type:'changeRoom',show:false})"
                    >
                      取消
                    </v-btn>
                    <v-btn
                      color="success"
                      depressed
                      small
                      @click="handleClickChangeRoom"
                    >
                      確定
                    </v-btn>
                  </div>
                </v-card-text>
              </form>
            </ValidationObserver>
          </v-card>
        </validation-observer>
      </template>
    </v-dialog>

    <!-- 新增批量清潔 `insert-muti-clean` -->
    <v-dialog
      v-model="dialogMultiCleanOption"
      max-width="290"
      @click:outside="dialog.setDialog({
        type:'multiCleanOption',
        show:false
      })"
    >
      <v-card>
        <v-card-title class="d-flex justify-center">
          <v-img
            max-height="40"
            max-width="40"
            src="~@/assets/img/multiclean.jpg"
          />
        </v-card-title>
        <v-card-text class="d-flex justify-center">
          <p class="title">
            選擇清潔狀態
          </p>
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn
            color="warning"
            depressed

            small
            @click="handleClickShowDialogChooseCheckOutRoom"
          >
            待清潔
          </v-btn>
          <v-btn
            color="blue"
            dark
            depressed

            small
            @click="handleClickSetStatusMultiClean({
              type:'3',
              status:'CHOOSE_ROOM'
            })"
          >
            清潔中
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 批量清潔：選擇房間（狀態2）-->
    <v-dialog
      v-model="dialogChooseCheckOutRoomToClean"
      max-width="200"
      @click:outside="dialog.beforeSetDialog(
        {initAction:'temp-multi-clean'},
        {type:'chooseCheckOutRoomToClean',show:false}
      )"
    >
      <v-card>
        <validation-observer ref="multiClean">
          <form>
            <v-card-text>
              <ValidationProvider
                v-slot="{ errors }"
                name="清潔人員"
                rules="required"
              >
                <v-select
                  v-model="tempMultiClean.staffId"
                  class="my-2"
                  dense
                  :error-messages="errors"
                  :items="cleaningStaffItems"
                  label="選擇清潔人員"
                  required
                  @input="setStaffMultiClean({staffId:$event})"
                />
              </ValidationProvider>
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
              <v-btn
                color="success"
                depressed
                small
                @click="handleClickSetStatusMultiClean({
                  type:'2',
                  status:'CHOOSE_ROOM'
                })"
              >
                選擇房間
              </v-btn>
            </v-card-actions>
          </form>
        </validation-observer>
      </v-card>
    </v-dialog>
    <!-- 2021/2/20:房卡的資料與狀態 -->
  </div>
</template>
<style lang="scss" scoped>
@media (max-width: 600px) {
  .t-unArrangement {
    overflow-x: auto;

    height: 100%;
    padding: 10px 0;
  }
}
@media (min-width: 600px) {
  .t-unArrangement {
    overflow-y: hidden;

    height: 100%;
  }
}
@media (max-width: 600px) and (max-width: 960px) {
}
@media (min-width: 960px) and (max-width: 1264px) {
}
@media (min-width: 1264px) and (max-width: 1904px) {
}
@media (min-width: 1904px) {
}
// .views__theDailySchedule{
//   height:100%;
//   @media (max-width: 600px){
//     .t-card__row{
//       overflow-x:auto;
//       overflow-y:hidden;
//       width:100%;
//       //height: $card-xs-height * 1.25;
//       cursor:pointer;
//       background-color:transparent !important;
//       //background: lightpink;
//     }
//     .t-card__row--borderTop{
//       border-top:1px solid lightgray;
//     }
//   }
//   @media (min-width: 600px){
//     .t-card__row{
//       width:260px;
//       height:122px;
//       margin-top:10px;
//       padding:5px;
//       cursor:pointer;
//       background-color:transparent !important;
//     }
//   }
//   @media (max-width: 600px) and (max-width: 960px){
//   }
//   @media (min-width: 960px) and (max-width: 1264px){
//   }
//   @media (min-width: 1264px) and (max-width: 1904px){
//   }
//   @media (min-width: 1904px){
//   }
//   .main{
//     overflow:hidden;
//     height:auto;
//   }
// }
</style>
