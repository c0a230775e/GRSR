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

###PWAでアプリを使う（本番環境にアップするときに実行）
・quasar serve dist/pwa
→コードの変更を適用する場合やスマホなどに初回インストールする場合に必要

・quasar build -m pwa
→本番環境で動作させるファイルを生成するとき
/gurisuro-reservation/dist/pwa$ quasar serve dist/pwaで実行
本番環境のURL：https://grsr.vercel.app/#/
テスト環境のURL（スマホ）:http://10.203.36.66:4000/#/

###Map関連（アプリ利用中実行）
１，NominatimにアクセスするAPI作成
２，npm init -y
３，npm install express node-fetch cors
４，node server.js（APIサーバー起動コマンド）

・Nominatim（ノミナティム）とは、OpenStreetMap が提供している “無料の住所検索（ジオコーディング）サービス” 
