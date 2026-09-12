# 企業報價與進銷協同管理系統 (Quotation Management System)

本專案為一套純前端架構的響應式網頁應用（RWD），具備完整客戶管理、廠商管理、產品管理、動態報價單開立、數據統計儀表板與 A4 專業報價單列印／PDF 匯出功能。

---

## 🚀 本地端 (單機) 快速安裝與啟動

### 1. 環境需求
- **Node.js**：建議版本 `v18.0.0` 或以上（推薦 `v20.x` LTS）
- **npm**、**pnpm** 或 **yarn**

### 2. 取得專案程式碼
若您是從 Google AI Studio 介面取得：
- 點選右上角選單中的 **「Download ZIP」** 或 **「Export to GitHub」** 將專案原始碼下載至本機電腦並解壓縮。

### 3. 安裝依賴套件
在專案根目錄開啟終端機（Terminal 或 PowerShell / CMD），執行：

```bash
npm install
```

### 4. 啟動本機開發伺服器 (Vite)

您可以使用下列任一指令啟動單機測試：

```bash
# 方式 A：標準啟動（監聽 Port 3000）
npm run dev

# 方式 B：本機快捷啟動（自動開啟瀏覽器）
npm run dev:local
```

啟動後終端機會顯示本地訪問網址：
```
  VITE v6.2.3  ready in 250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```
開啟瀏覽器前往 `http://localhost:3000` 即可在單機離線環境下完整操作所有系統功能！

---

## 🛠 其他常用指令

| 指令 | 說明 |
| :--- | :--- |
| `npm run dev` | 啟動本機開發伺服器（預設 Port 3000） |
| `npm run dev:local` | 啟動開發伺服器並自動開啟預設瀏覽器 |
| `npm run build` | 編譯產出純靜態檔案至 `dist/` 目錄（可直接部署至任何靜態託管空間） |
| `npm run preview` | 本機預覽編譯後的生產版本 |
| `npm run lint` | 執行 TypeScript 型別檢查 (`tsc --noEmit`) |

---

## 💡 單機資料保存機制說明
- 本系統採用 **瀏覽器 LocalStorage** 進行離線資料持久化，所有新增/修改的客戶、廠商、產品及報價單均會安全存放在您本地瀏覽器中。
- 若需恢復初始展示資料，可隨時點擊頁面右上角的 **「重設範例」** 按鈕。
- 支援標準 **A4 尺寸列印** 與瀏覽器原生 **「另存為 PDF」** 功能，無須後端服務支援。

---

## ☁️ 部署到 Vercel (免費線上託管)

本系統為標準 Vite + React 純前端專案，可極速免費部署至 Vercel：

### 方法 A：透過 GitHub 連動（推薦，日後每次 commit 自動部署）
1. 將程式碼推送到您的 GitHub Repository。
2. 前往 [Vercel 官網 (vercel.com)](https://vercel.com/) 登入。
3. 點選 **「Add New...」** -> **「Project」**。
4. 選擇您的 GitHub 儲存庫並點擊 **「Import」**。
5. Vercel 會自動偵測框架為 **Vite**：
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. 直接點選 **「Deploy」**，約 30 秒即可取得專屬公開網址（例如 `https://your-project.vercel.app`）！

### 方法 B：使用 Vercel CLI 本機指令直接部署
1. 在電腦終端機安裝 Vercel CLI：
   ```bash
   npm i -g vercel
   ```
2. 在專案資料夾目錄下執行：
   ```bash
   vercel
   ```
3. 依終端機提示登入並按 Enter 確認預設設定，即可完成部署並產生線上網址！

---

## 🐘 串接 Neon PostgreSQL 雲端資料庫教學

系統已具備 **Neon 雲端資料庫雙向同步與本機快取離線備援** 機制：

### 步驟 1：取得 Neon Connection String
1. 前往 [Neon 控制台 (console.neon.tech)](https://console.neon.tech/)。
2. 進入 Project，複製 `Connection String`（長相如 `postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`）。

### 步驟 2：在 Neon 建立資料表結構 (可選，系統亦支援自動建表)
- 進入 Neon 左側選單的 **SQL Editor**。
- 將本專案根目錄下的 `neon_schema.sql` 內容貼入並執行（Run），即可預先建立客戶、廠商、產品、報價單資料表與查詢索引。

### 步驟 3：在 Vercel 設定環境變數
1. 進入 Vercel 控制台 ➔ 點入本專案。
2. 點選 **Settings** ➔ **Environment Variables**。
3. 新增環境變數：
   - **Key**: `DATABASE_URL`
   - **Value**: 貼上剛才從 Neon 複製的連線字串。
4. 點選 **Save**，接著至 **Deployments** 點選最近一次部署的 **Redeploy**。

### 步驟 4：驗證連線
重新打開您的 Vercel 網站網址，頂端導覽列右上角將會點亮 **「Neon 已連線」** 綠燈，點擊即可即時查看資料庫名稱、上次同步時間，或手動執行拉取/推送操作！
