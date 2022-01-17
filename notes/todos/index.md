# ToDo

## 急
- [ ] 響應式， function 

## 可以優化的地方 
- [ ] 寫註解。utils 裏資料夾的每隻 function 參數部分需要帶入的東西
- [ ] data 屬性切個不夠乾淨
- [ ] mixinUtils 的一些方法搬到 createUtils.js
- [ ] 房號安排的 tooltip
- [ ] fetch 開頭的 function 回傳的 type，看需不需要固定為 object。固定會有 success, message 這兩個 propperties，然後其他 payload（目前沒有全部都改完）
- [ ] 所有 call api 的 function，也就是上述 fetch 開頭 function 移至 utils / create 

## 需要評估要不要重構的地方
> 雖說不影響功能，但可能造成日後維護上需多花時間

- [ ] 新增訂單的幾個元件：
  - view -> layout -> layoutdefault 只適用於當日房況及房號安排頁面，但是所有訂單頁面也會需要用到新增訂單所需要的幾個元件（你可以在 layoutdefault 找到這幾個元件），這違反了 DRY(don't repeat yourself)原則，目前想到方式就是將這季個元件抽離出來，透過 vuex 進行溝通。
  