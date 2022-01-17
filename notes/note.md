# Dialog 
## Payment
- dialogKeepPricePayment => 換房確認付款資訊 => PAYMENT.PAYMENT_CHANGE_ROOM
- dialogPaymentAfterInsertBooking => 新增訂單 => PAYMENT.PAYMENT_INSERT_BOOKING
- dialogPaymentAfterInsertRestBooking => 新增休息訂單 => PAYMENT.PAYMENT_INSERT_REST_BOOKING
- dialogPaymentUnCheckIn => 訂單入住 => PAYMENT.PAYMENT_UNCHECKIN
- dialog.addPayment => 新增收款 => PAYMENT.PAYMENT_EXTRA_PAYMENT
- dialogPaymentAfterCheckout => 退房 => PAYMENT.PAYMENT_CHECKOU

# Toolbar 
## 當日房況
- 特定時間 => showSpecificCards.php
- 今日 => showSpecificCards.php

## 房號安排
- 特定時間 => showRoomsStatusSpecificDate.php
- 今日 => showSpecificCards.php

## 旅客資訊
- keyword(@input) => showSearchCustomer.php => 能不能在加上「排序依照」及「顯示排序」
- 排序依照(@input) => 只要設定 0, 1 
- 顯示排序(@input) => showSearchDateCustomer.php / showSearchDateCustomerAsc.php
- start(@input) => 看有無排序依照設定，沒有打預設
- end(@input) => 看有無排序依照設定，沒有打預設
- 重設

## 所有訂單
- keyword(@input) => showOrdersSearching.php
- 日期類型(@input)（訂單日、入住日、退房日) => showOrdersSearchingBoth.php
- start(@input) => showOrdersSearchingDate.php / showOrdersSearchingBoth.php
- end(@input) => showOrdersSearchingDate.php / showOrdersSearchingBoth.php
- 重設(@input) => 

## 住房日報
- start(@input) => showDailyReportBothDate / showDailyReportBothDateAll
- end(@input) => showDailyReportBothDate / showDailyReportBothDateAll
- 每頁五天 => showDailyReport / showParticularDailyReport
- 重設
- [可能丟棄] showParticularDailyReport，專門打特定某天


## roomAction API
- 操作完成：重取資料、清空 checkbox
