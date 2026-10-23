# common (gurisuro-reservation)

## Install the dependencies

```bash
pnpm install
# or: yarn/npm/bun install
```

### Start the app in development mode (HMR, error reporting, etc.)

```bash
quasar dev
```

### Format & Lint the files

```bash
pnpm run lint
# or: yarn/npm/bun run lint
```

...or just check formatting & linting:

```bash
pnpm run lint:check
# or: yarn/npm/bun run lint:check
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-file).

ーーーーーーーーーーーーーーーーーーーーーーーーー

###pythonファイル実行（カレンダー情報取得時実行）
１，source python-env/bin/activate（pythonファイル実行可能状態にする）
２，(python-env) c0a230775e@MSI:~/code/quasar/gurisuro-reservation$ python python/extract_calendar.py（pythonファイル実行）
３，JSON_CREATED（pythonファイル実行成功）

### PWAでアプリを使用する

### 1. PWA用ファイルを生成
プロジェクトルートへ移動

コードを変更した後は必ず実行

```bash
quasar build -m pwa
```

実行後、配布用ファイルが生成される

```text
dist/pwa/
```

---

### 2. スマホや実機で動作確認
プロジェクトルートへ移動

PWAビルド後に実行

```bash
quasar serve dist/pwa
```

表示されたURLへアクセスする

例：

```text
http://10.203.36.66:4000/#/
```

スマホで初回アクセス後、

「ホーム画面に追加」

を実行するとPWAとしてインストールできる。

---

### 3. 本番公開

GitHubへpushする

```bash
git add .
git commit -m "update"
git push origin main
```

Vercelが自動でデプロイする。

本番URL：

https://grsr.vercel.app/#/

---

※注意

```bash
quasar serve dist/pwa
```

は動作確認用のローカルサーバー起動コマンド。

コード変更を反映するには先に

```bash
quasar build -m pwa
```

が必要。

###Map関連（アプリ利用中実行）
１，NominatimにアクセスするAPI作成
２，npm init -y
３，npm install express node-fetch cors
４，node server.js（APIサーバー起動コマンド）

・Nominatim（ノミナティム）とは、OpenStreetMap が提供している “無料の住所検索（ジオコーディング）サービス” 
