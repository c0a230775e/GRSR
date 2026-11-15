# 「ベイ太くん乗車予約（gurisuro-reservation）」完全版技術仕様書

---

## 1. システム概要・基本情報

| 項目 | 内容 |
| :--- | :--- |
| **プロジェクト名** | `gurisuro-reservation`（画面表示名：**ベイ太くん乗車予約** / `productName`: `common`） |
| **バージョン** | `0.0.1` |
| **本番公開URL** | `https://grsr.vercel.app/#/`（Vercel自動デプロイ） |
| **システム目的** | 千葉県千葉市美浜区（幕張ベイパーク・幕張ベイタウン／打瀬エリア）周辺を運行するグリーンスローモビリティ（「ベイ太くん」）の乗降予約および相乗り調整・運行管理を行うWebアプリケーション（PWA対応）。 |
| **対象ユーザー** | **一般利用者**：会員登録・ログイン不要。ブラウザ固有UUIDにより予約登録・履歴照会・相乗り申請・キャンセルを実施。<br>**運行管理者**：管理者認証（Supabase Auth または管理画面ログイン）により、全予約一覧の確認・乗降ルート地図確認・予約削除を実施。 |
| **車両・運行制約** | ・1車両あたりの最大定員：**5名**<br>・運行枠構成：1時間を**前半（00〜29分台の3枠）**と**後半（30〜59分台の2枠）**に分割<br>・乗降スポット：親拠点 **67箇所** ＋ 詳細サブ地点（`subLocations`） |
| **リポジトリパス** | `/home/c0a230775e/code/quasar/gurisuro-reservation/` |

---

## 2. 技術スタック・開発環境

* **フロントエンドフレームワーク**: Quasar Framework `^2.26.0` (`@quasar/app-vite` `^3.8.0`)
* **UI / 言語**: Vue `^3.5.22`（Composition API `<script setup>`）, JavaScript (ESM), SCSS
* **ルーティング**: Vue Router `^5.0.6`（`hash` モード採用）
* **PWA対応**: Workbox `GenerateSW`（`skipWaiting: true`, `clientsClaim: true` により更新時即時反映）
* **地図エンジン**: Leaflet `^1.9.4` ＋ `leaflet-rotate` `^0.2.8`（道路網の向きに合わせ `-40度` 回転表示に対応）
* **バックエンド / DB / 認証**: Supabase（`@supabase/supabase-js` `^2.117.2` / PostgreSQL / Supabase Auth）
* **ホスティング / CI/CD**: Vercel（GitHub `main` ブランチへの push による自動デプロイ）
* **運行カレンダー生成バッチ**: Python 3（仮想環境 `python-env`）+ `openpyxl`（Excel形式の運行予定表からJSONデータを自動抽出）
* **コード品質・実行環境**: ESLint `^10.8.0` (Flat Config), Prettier `^3.8.1`, `vite-plugin-checker` `^0.14.5`, Node.js `>= 26 || ^24 || ^22.12`

---

## 3. システムアーキテクチャ・ディレクトリ構成

```text
gurisuro-reservation/
├── README.md                     # セットアップ・バッチ実行・PWAビルド・Vercelデプロイ手順書
├── package.json                  # パッケージ・スクリプト・Node要件定義
├── quasar.config.js              # Quasar/Viteビルド・ブート・PWA設定
├── dist/
│   └── pwa/                      # `quasar build -m pwa` により生成されるPWA配布用ビルド出力先
├── python-env/                   # Pythonバッチ実行用仮想環境（venv）
├── python/
│   ├── calendar.xlsx             # 月間フリー運行日・時間帯の原データ（Excel）
│   └── extract_calendar.py       # Excelから timeSlots.json を生成するバッチスクリプト
├── public/
│   └── assets/
│       ├── pins.json             # 全67拠点＋サブ地点の座標・名称・画像パス定義
│       ├── timeSlots.json        # 日付別の運行時間枠マスタ（バッチ出力先）
│       └── photo/                # 各乗降スポットの現地外観写真群
└── src/
    ├── App.vue                   # ルートコンポーネント（起動時に userId 初期化）
    ├── supabase.js               # Supabase クライアント初期化
    ├── boot/
    │   ├── user.js               # localStorage + crypto.randomUUID() による匿名ID発行
    │   ├── leaflet.js            # Leaflet 本体・CSSのグローバル読込
    │   └── leaflet-rotate.js     # 地図回転プラグインローダー
    ├── css/
    │   ├── CommonPage.scss       # メイン予約画面・各種セレクタ・モーダル用スタイル
    │   └── AdminPage.scss        # 管理者画面・完了画面・予約履歴・相乗り確認用スタイル
    ├── router/
    │   ├── index.js              # Vue Router インスタンス生成設定
    │   └── routes.js             # アプリケーション全ルート定義
    ├── layouts/
    │   └── MainLayout.vue        # 共通ヘッダー・ドロワーナビ・隠し管理者導線
    ├── pages/
    │   ├── CommonPage.vue        # [一般] メイン予約画面（/）
    │   ├── CompletePage.vue      # [一般] 予約・相乗り申請完了画面（/complete）
    │   ├── ReservedPage.vue      # [一般] 予約確認・キャンセル画面（/reserved）
    │   ├── AdminPage.vue         # [管理] 管理者向け予約管理・ルート地図画面（/admin）
    │   └── AuthPage.vue          # [管理] 独立管理者ログイン画面（/auth）
    └── components/               # CommonPage.vue 等から利用されるUIコンポーネント群（全12種）
        ├── NicknameInput.vue
        ├── RidePeopleSelector.vue
        ├── MonthSelector.vue
        ├── DaySelector.vue
        ├── TimeSelector.vue
        ├── ShareRideButtons.vue
        ├── PointSelector.vue
        ├── PhotoSelector.vue
        ├── SelectedPlaceView.vue
        ├── PreviewPanel.vue
        ├── SubmitButton.vue
        └── MemoPage.vue
```

---

## 4. データベース設計（Supabase PostgreSQL）

フロントエンドのクエリ（`select`, `insert`, `delete`）および管理・履歴画面の参照項目から導出される主要テーブル仕様は以下の通りです。

### 4.1 `reservations` テーブル（予約データ管理）
通常予約（親予約）および相乗り予約（子予約）を単一テーブルで管理します。

| カラム名 | データ型 (推定) | 制約・初期値 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` / `int8` | PK | 予約レコード一意ID |
| `user_id` | `text` / `uuid` | NOT NULL | ブラウザの `localStorage('userId')` に保存された匿名ユーザーUUID |
| `nickname` | `text` | NOT NULL | 乗車時の本人確認用ニックネーム（最大20文字） |
| `people` | `int4` | NOT NULL | 乗車人数（`1`〜`5`） |
| `ride_date` | `date` / `text` | NOT NULL | 乗車予定日（`YYYY-MM-DD` 形式） |
| `time_slot` | `text` | NOT NULL | 予約時間帯ラベル（例: `'10:00'`）。相乗り時は親予約の時間帯を継承 |
| `from_place` | `text` | NOT NULL | 乗車場所スポット名 |
| `to_place` | `text` | NOT NULL | 降車場所スポット名 |
| `from_id` | `text` / `int4` | NULLABLE | 乗車場所のスポットID |
| `to_id` | `text` / `int4` | NULLABLE | 降車場所のスポットID |
| `is_share` | `boolean` | `false` | `false`: 通常予約（新規運行枠の確保） / `true`: 相乗り予約 |
| `parent_id` | `uuid` / `int8` | NULLABLE (FK) | 相乗り予約（`is_share = true`）の場合に紐づく親予約の `id` |
| `name` | `text` | NULLABLE | 任意入力の氏名（`MemoPage.vue` 経由） |
| `phone` | `text` | NULLABLE | 任意入力の電話番号（`MemoPage.vue` 経由） |
| `created_at` | `timestamptz` | `now()` | 予約登録日時 |

---

## 5. コアビジネスロジック仕様

### 5.1 匿名ユーザー識別 (`src/boot/user.js`)
1. アプリ起動時（`App.vue` の `onMounted`）に `initializeUserId()` を実行。
2. `localStorage.getItem('userId')` が未設定の場合、`crypto.randomUUID()` でUUID v4を生成し `localStorage` に永続化。
3. 予約登録時に `user_id` としてDBへ保存し、`ReservedPage.vue` ではこの `user_id` に一致する予約のみを抽出して表示・削除許可を行う。

### 5.2 時間帯ブロック分割と「相乗り」変換ロジック (`CommonPage.vue` / `TimeSelector.vue`)
本システム最大の独自仕様として、1時間単位（5枠）の運行時間を**前半**と**後半**の2ブロックに分けて排他および相乗り制御を行います。

* **スロット構造**:
  * **前半ブロック**: 配列インデックス `0〜2`（例: `10:00`, `10:10`, `10:20` の3枠）
  * **後半ブロック**: 配列インデックス `3〜4`（例: `10:30`, `10:40` の2枠）
* **予約状態に応じたUI動的変化**:
  1. **未予約状態**: 前半3枠・後半2枠が通常の時間選択ボタンとして表示される。
  2. **通常予約発生時**: 当該ブロック（前半または後半）に `is_share = false` の予約が1件登録されると、**そのブロック内の個別時間ボタン（3枠または2枠）はすべて非表示になり、ブロック全幅を占める「相乗り」ボタン1つに自動変換**される。
  3. **残席計算と満員制御**:
     * 該当ブロックの合計乗車人数 ＝ `親予約の people` ＋ `紐づく相乗り予約（is_share = true）の people 合計`
     * 残り乗車可能人数 ＝ `5 - 合計乗車人数`
     * 残席が `0` の場合、相乗りボタンは「満員」表示となり非活性化（`.share-btn-full`）。また、相乗り申請時に「選択中の乗車人数 ＞ 残席数」の場合はエラーを表示してブロックする。

### 5.3 乗降スポット検索・回転地図・サブ地点選択 (`PointSelector.vue`)
* **地図回転表示**: 幕張ベイパーク・ベイタウンの街区グリッドが画面に対して水平・垂直になるよう、Leaflet マップを **`-40度` 回転**（`map.setBearing(-40)`）させて初期描画（中心: `[35.6417633, 140.0473219]`, `zoom: 15`, `minZoom: 15`）。エリア外へのスクロールを `maxBounds` で制限。
* **3系統の検索・選択手段**:
  1. **あいまいキーワード検索**: 入力文字列に対し `NFKC` 正規化・小文字化・カタカナ→ひらがな変換・空白除去を行い、全67親拠点および全サブ地点をインクリメンタル検索。
  2. **メイン地点一覧セレクト**: 日本語自然順ソート済みの67拠点リストに加え、先頭に「**📍現在地から選択**」を配置。
  3. **GPS現在地最寄り検索**: `navigator.geolocation` で取得した現在地から全拠点への直線距離をヒュベニ／ハーサイン公式で算出し、最短距離の拠点を自動選択。
* **2段階ピン展開**: サブ地点（`subLocations`）を持つ親ピン選択時は Zoom 18 に拡大してサブピンを展開。選択時はミニマップ（`#submap`）と現地外観写真を含むオーバーレイを表示し、「乗車場所に設定」または「降車場所に設定」を確定する。

---

## 6. 画面遷移・ページ別詳細仕様

### 6.1 画面遷移フロー
```text
[MainLayout.vue (共通ヘッダー)]
  ├─ メニュー「予約する」 ──────► [CommonPage.vue (/)]
  │                                  ├─ 通常予約確定 ──► [CompletePage.vue (/complete)]
  │                                  └─ 相乗り申請確定 ─► [CompletePage.vue (/complete)]
  ├─ メニュー「予約確認」 ──────► [ReservedPage.vue (/reserved)] (自分の予約一覧・取消)
  └─ ヘッダータイトル3回連続タップ ─► [AdminPage.vue (/admin)] ◄── [AuthPage.vue (/auth)]
```

### 6.2 各画面仕様一覧

#### ① `src/layouts/MainLayout.vue`（共通レイアウト）
* ヘッダー左にドロワー開閉ボタン、中央にタイトル「**ベイ太くん乗車予約**」、右側にメニュー導線を配置。
* **隠し管理者導線**: ヘッダータイトルを短時間に **3回連続タップ** することで `/admin` へ遷移する仕組みを実装。

#### ② `src/pages/CommonPage.vue`（メイン予約画面：`path: '/'`）
* **構成コンポーネント**:
  * `NicknameInput.vue`: ニックネーム入力（必須・最大20文字）。
  * `RidePeopleSelector.vue`: 乗車人数選択（`1`〜`5`人、3列グリッド）。
  * `MonthSelector.vue` / `DaySelector.vue`: 当月・翌月の2ヶ月切り替えと、運行日の3列グリッド選択。
  * `TimeSelector.vue` / `ShareRideButtons.vue`: 時間帯選択、既存予約時の相乗りボタン変換、および相乗り確認モーダル（先約の人数・時刻・残席・発着地写真・ミニマップ表示）。
  * `PointSelector.vue`（および `PhotoSelector.vue`）: 地図・検索・写真からの乗降スポット選択。
  * `SelectedPlaceView.vue`: 選択済みの乗車場所・降車場所の現地写真と名称の並列プレビュー。
  * `MemoPage.vue`: 任意入力アコーディオン（お名前・電話番号）。
  * `PreviewPanel.vue` / `SubmitButton.vue`: 画面下部固定フッター（選択内容リアルタイムサマリー＋全必須項目入力完了時に出現する緑色の「予約送信」ボタン）。
* **予約完了後の遷移**: DBへ `insert` 成功後、登録データや発着画像パスをクエリ／ステート等で引き継ぎ `/complete` へ遷移。

#### ③ `src/pages/CompletePage.vue`（予約完了画面：`path: '/complete'`）
* 通常予約または相乗り申請の完了メッセージ、予約内容詳細（日時・人数・乗車場所・降車場所・現地外観写真・確認用ミニマップ）、および利用者向けアンケートリンク枠を表示。

#### ④ `src/pages/ReservedPage.vue`（予約確認・キャンセル画面：`path: '/reserved'`）
* `localStorage` の `userId` をキーに Supabase `reservations` テーブルから該当ユーザーの予約一覧を取得してカード表示。
* 各予約カードには乗降スポットの写真・ミニマップを表示し、ユーザー自身による**予約キャンセル（削除）**操作が可能。

#### ⑤ `src/pages/AdminPage.vue`（管理者向け運行管理画面：`path: '/admin'`）
* **認証保護**: 未認証時はログインダイアログを表示し、Supabase Auth による管理者認証を要求。
* **管理機能**:
  * 指定日付の全予約一覧（親予約と紐づく相乗り子予約をグループ化／時系列整理）を表示。
  * 各予約の乗車場所・降車場所を結ぶ運行ルート地図（Leaflet）および現地写真、利用者のニックネーム・人数・連絡先メモ（名前・電話番号）を確認可能。
  * 管理者権限による予約レコードの削除機能。

#### ⑥ `src/pages/AuthPage.vue`（独立管理者ログイン画面：`path: '/auth'`）
* メールアドレス・パスワードによる Supabase Auth ログインフォームを提供し、認証成功後に `/admin` へ遷移。

---

## 7. 静的マスタ・バッチ処理・運用手順（`README.md` 準拠）

### 7.1 開発環境セットアップ・基本コマンド
* **依存パッケージインストール**（推奨パッケージマネージャ: `pnpm`）:
  ```bash
  pnpm install
  # または yarn / npm / bun install
  ```
* **開発サーバー起動（HMR・エラーレポート有効）**:
  ```bash
  quasar dev
  ```
* **コードフォーマット・Lint 実行**:
  ```bash
  pnpm run lint        # Prettier整形 + ESLint自動修正
  pnpm run lint:check  # 整形・構文チェックのみ
  ```
* **通常本番ビルド**:
  ```bash
  quasar build
  ```

### 7.2 運行カレンダー更新バッチ実行手順（`python/extract_calendar.py`）
運行管理者が Excel カレンダー（`python/calendar.xlsx`）を更新した際、フロントエンド参照用の `public/assets/timeSlots.json` を再生成する手順は以下の通りです。

1. **Python 仮想環境の有効化**:
   ```bash
   source python-env/bin/activate
   ```
2. **抽出スクリプトの実行**:
   ```bash
   python python/extract_calendar.py
   ```
3. **完了確認**: コンソールに `JSON_CREATED` が出力されれば正常終了。

* **出力データ構造 (`public/assets/timeSlots.json`)**: 日付文字列（`"YYYY-MM-DD"`）をキーとし、その日に運行する時間帯スロットオブジェクト配列（`{ label, value, disabled }`）を保持。

### 7.3 乗降スポットマスタ (`public/assets/pins.json` & `public/assets/photo/`)
* **役割**: 幕張ベイパーク・幕張ベイタウン内の全67箇所の乗降拠点マスタ。
* **データ構造**:
  ```json
  {
    "id": 1,
    "name": "拠点名",
    "lat": 35.64xxxx,
    "lng": 140.04xxxx,
    "image": "/assets/photo/xxx.jpg",
    "keywords": ["検索用別名"],
    "subLocations": [
      { "id": "1-1", "name": "詳細乗り場名", "lat": 35.64xxxx, "lng": 140.04xxxx, "image": "/assets/photo/xxx_1.jpg" }
    ]
  }
  ```

### 7.4 PWAビルド・実機検証・本番デプロイ手順
本システムは PWA（Progressive Web App）として構築されており、スマートフォンのブラウザから「ホーム画面に追加」することでネイティブアプリのように利用可能です。

1. **PWA用ビルドの生成（コード変更後は必ず実行）**:
   プロジェクトルートで以下を実行すると、配布用アセットが `dist/pwa/` に出力される。
   ```bash
   quasar build -m pwa
   ```
2. **ローカルネットワーク経由での実機動作確認**:
   PWAビルド完了後、ローカル配信サーバーを起動する（※コード変更を反映するには必ず先に `quasar build -m pwa` を実行すること）。
   ```bash
   quasar serve dist/pwa
   ```
   コンソールに表示されたローカルIPアドレス（例: `http://10.203.36.66:4000/#/`）へスマートフォンからアクセスし、初回アクセス後にブラウザメニューから「ホーム画面に追加」を実行してPWAインストール動作を確認する。
3. **本番公開（Vercel 自動デプロイ）**:
   GitHub の `main` ブランチへプッシュすることで Vercel による自動ビルド・本番デプロイが実行される。
   ```bash
   git add .
   git commit -m "update"
   git push origin main
   ```
   * **本番公開URL**: `https://grsr.vercel.app/#/`

---

## 8. 保守・運用上の技術的留意点（コード解析による検出事項）

今後の改修や保守に際して留意すべき実装上のポイントは以下の通りです。

1. **地点IDプロパティ名の差異 (`CommonPage.vue` vs `PointSelector.vue` / `PhotoSelector.vue`)**:
   * `PointSelector.vue` および `PhotoSelector.vue` が `update:from` / `update:to` で emit するオブジェクトの識別子キーは `{ mainId, subCode }` ですが、`CommonPage.vue` の送信処理内では `from.value.id` / `to.value.id` が参照されています。DBの `from_id` / `to_id` にサブ地点コードを正確に記録したい場合は、`subCode ?? mainId` へ統一することが推奨されます。
2. **HTML閉じタグの整合性 (`PointSelector.vue`)**:
   * テンプレート内の `<div class="search-area">` の直後に余分な閉じタグ `</div>` が1つ存在し、親コンテナ `.point-selector` が地図要素（`#map`）より前で閉じられています。レイアウト崩れ防止のため、余分な `</div>` の整理が推奨されます。
3. **管理者ルートのアクセス制御 (`src/router/index.js`)**:
   * グローバルナビゲーションガード（`Router.beforeEach`）は現在コメントアウトされており、`AdminPage.vue` 側のモーダル表示で認証を行っています。ダイレクトURLアクセス時のデータフェッチを完全に遮断したい場合は、ルーターガード側でもセッション検証を有効化するのが安全です。
4. **Supabase 接続情報の管理 (`src/supabase.js`)**:
   * 接続URLおよび公開キー（anon key）は `src/supabase.js` 内に直接記述されています。環境切り替え（検証環境／本番環境）を行う場合は `.env` ファイル（`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`）への外出しを検討してください。