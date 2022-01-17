# roomAction, unCheckIn 共用儲存位置

> 因為 checkIn, unCheckIn, checkOut，這些操作可能都會涉及到 payment，然而在 payment 之後往往又要調用前三者之一。若是前三者所使用的資料來源不統一，非常麻煩。因此想辦法這三者寫進同一個地方

- unCheckIn 這個 mixin 之中，資料是以 checkbox 被存在 this.selected
- 這筆資料有可能會同時存在多個房間，因此不適合與顯示單個房間的資料混合，應該另外設置
- 所有訂單
- 當日房況，在 cardItem

