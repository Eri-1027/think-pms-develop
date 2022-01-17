如果還不熟悉整個專案的架構，建議從這份文件開始讀起

# src
## assets
- 存放靜態資源的地方，像是圖檔、GIF
- scss 

## components
- Page-：一個統一管理多個相似元件的頁面，只會放在 `TheHome.vue` 頁面。比方說 `PageDialog` 會放所有彈窗，透過 vuex 統一調用
- TCard-：卡片元件
- TDialog-：彈窗元件
- TMobile-：行動裝置（響應式）
- TPrint-：列印相關
- TTable：表格相關

## constants
- 部分的檔案（.vue, .js）會 import 常數使用

## directives
- 目前只有兩個，價格顯示會用到（四捨五入跟小數點三位一撇）

## mixins
- 假如一個 function 內部不會用到 Vue 的 this，僅接收參數，我會把該 function 搬到同主題、或功能的 utils/create/create<CustomName>.js，比方：
```javascript
// mixinPayment.js
methods: {
  getInitTempPayment() {
    return Object.assign(, {
      staffId: '',
      paymentType: '',
      paymentMethod: [],
      paymentAmount: [],
      paymentNote: [],
      taxNumber: '',
      bookingId: ''
    })
  } 
}
```
搬移至：
```javascript
// createPayment.js
const getInitTempPayment = () => {
    return Object.assign({} , {
      staffId: '',
      paymentType: '',
      paymentMethod: [],
      paymentAmount: [],
      paymentNote: [],
      taxNumber: '',
      bookingId: ''
    })
}
```
- 當元件的方法可共用時，如果是 DOM 事件，會寫在 mixin，並以 `功能` 命名。
- 例如：
  - 當某個 View 需要使用到某個功能，比方收款功能。則會引入 mixinPayment
  - 涉及房間操作（入住、退房、換房、清掃、清掃完成、查看空房⋯⋯），則引入 mixinRoomAction

## plugins
- 使用到的插件及需要做客製化設定都在這裡

## router

## store
- 有使用 module 及 namespace
- 複雜元件不會用 emit 跟 props 傳遞資料，而是透過 vuex
- 全局需要用到的資料，比方說一開始登入所需要用到的 staff, level, hotelId

## utils
### create
- 與 mixin 差異為，mixin 與 View 的 function 皆以 DOM 事件為主，create 的 function 負責邏輯部分
- 以功能、主題劃分

#### 功能
- 收款功能（createPayment）
- 取得價格功能（createPrice）

#### 主題
- 與房間有關操作（createRoom）
- 與未入住訂單有關操作（createUnCheckIn）


### helpers
- 非主題為主的方法
- dialog
- validate
- error
- format
- utils

### [重要] eventService.js
- 這是主要封裝 axios 的地方
- 針對 api 回傳的資料重新組成想要的格式
比方說，以下這個透過 postman 取得的 api 回傳

```json
// ../api/getRoomNumber.php
{
    "JWT": {
        "message": "Access granted:"
    },
    "success": true,
    "code": "10001",
    "number": "0,",
    "error": [
        "roomTypeId is null",
        "roomTypeName is null",
        "fromDate is null",
        "endDate is null"
    ]
}
```
經過整理後會是：
```json
{
  "JWT": {
      "message": "Access granted:"
  },
  "code": "10001",
  "errors": [
      "roomTypeId is null",
      "roomTypeName is null",
      "fromDate is null",
      "endDate is null"
  ],
  "fetch": {
      "number": "0,"
  },
  "success": true,
}
```

注意到 `fetch`，他變成一個物件。這麼做原因是有時候回傳的 payload 不只有一個，像是這隻 api 會有 `bill`, `discounts` 這兩個 payload 屬性：

```json
// .../api/showBill.php
{
    "JWT": {
        "message": "Access granted:"
    },
    "bill": [
        {
            "paymentId": "1444",
            "bookingId": "1696",
            "paymentType": "7",
            "paymentMethod": "0",
            "paymentAmount": "",
            "paymentNote": "",
            "staffId": "0",
            "paymentDatetime": "2020-11-03 16:55:50",
            "taxNumber": "",
            "invoiceId": "0",
            "hotelId": "39"
        },
        //... 省略
    ],
    "discounts": "",
    "success": true,
    "error": []
}
```

統一包起來可以跟其它像是（success, error...）這些屬性做區隔

```javascript
{
    "JWT": {
        "message": "Access granted:"
    },
    "fetch": {
      "bill": [
        {
            "paymentId": "1444",
            //...省略
        },
        //... 省略
      ],
      "discounts": "",
    }
    "success": true,
    "error": []
}
```

### dataTypeConvert

```
注意：
這是早期處理 api 回傳的格式使用。（建議可以將它廢除，以新的 format 方式替換）
目前新的 function 寫在 src/utils/helpers/createUtils 的 createConvertFunction()，且僅支援字串 "1","0" 轉為 boolean 格式。
後續若要增加新的規則，可以在這隻 function 裏進行擴充
```
> 將字串 "1","0" 轉換為 boolean

```json
{
  "data":{
    "fetch":{
      "rooms":[
        {
          "roomId":"123",
          "roomNumber":"456",
          "roomAddable":"0",
        },
        {
          "roomId":"124",
          "roomNumber":"457",
          "roomAddable":"1",
        }
      ]
    }
  }
}
```

透過

```javascript
let result = this._$dataTypeConvert.transAfterRes(res.data.fetch.rooms,['roomAddable'])
```

轉換為：

```javascript
// result
{
  data:{
    fetch:{
      rooms:[
        {
          roomId:"123",
          roomNumber:"456",
          roomAddable: false,
        },
        {
          roomId:"124",
          roomNumber:"457",
          roomAddable: true,
        }
      ]
    }
  }
}
```


## views
- booking 對應「當日房況、房號安排以及旅客資訊」
- management 對應「所有訂單、結帳作業以及住房日報」
- support 對應「房型編輯、房價與專案、人員管理以及購物中心」
- layout 是為了共用「當日房況、房號安排」 的 toolbar 功能，裡面含「新增訂單、訂單入住，今日有關的事件 function」

### DOM 事件
- View 層的 function 只能是事件 function，也就是所有 DOM 元素觸發的事件，稱之為 DOM 事件。
- DOM 事件以 `handle<事件名>-` 前綴方式命名
- 假如有一個打開彈窗的事件，命名為 `handleClickShowDialog`
- 假如有一個拖拉的事件，命名為 `handleDragRoomBar`
- 假如有不同種類的彈窗事件，命名為 `handleClickShowDialogCustomName`
- 其結構可以簡單歸納為：<handle><EventName><Action>
- 事件通常搭配 lodash debounce 防抖功能，以防止大量 call api 造成的問題，如下：

```javascript
methods: {
  handleClickShowDetailCard: _.debounce(function(item) {
    // do sth here...
  },500)
}
```

```
注意：
此 function 命名風格是後期引入的寫法，所以沒有全面改寫完成。
```

# tests（看自己要不要寫吧！）
- 單元測試目前是用 Jest
- 目前只測試部分的 utils

# csscomb 
這個東西是讓你可以 format 你的 scss, css，透過 `command + P + >`，選擇 csscomb format style，你可以按照你希望的 css 屬性順序排列



