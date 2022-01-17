提供一些 debug 思路

```
[Vue warn]: Computed property "dialogCleaned" was assigned to but it has no setter.
```
- 可能是因為使用 `this.dialogCleaned = false` 的方式去關閉彈窗，正確應該使用以下 createDialog.js 的方法：

```javascript
this.dialog.setDialog({
  type:'cleaned',
  show: false
})
// or
_dialog.setDialog({
  type:'cleaned',
  show: false
})
```
這是因為在 createDialog.js 還沒寫出來之前，都是在每個事件 function 裡面直接去更改設置在 vue instance data 裡面 dialog 的值。但現在操作彈窗都統一由 createDialog.js 去調用 Vuex 更改彈窗狀態


