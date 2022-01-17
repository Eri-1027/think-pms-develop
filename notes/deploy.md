# 啟用本地 server 開發

直接 run package.json 的指令，如：

```bash
npm run serve:testing
```
- serve:pms：api call pms api
- serve:dist：直接 local serve 打包後的 dist

# 打包
```bash
npm run build:pms
```
- build:testing：打包 testing api 版本
- build:pms：打包 pms api 版本
- build:pwa：打包 pwa 版本

> 注意：主要影響功能差異就是 pms 跟 testing 這兩個 api 版本。其它版本只是為了方便測試

