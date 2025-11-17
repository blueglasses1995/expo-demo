# Step 0: 開発環境のセットアップ

## 🎯 このステップのゴール

Expo開発に必要なツールをインストールし、最初のアプリを動かせる状態にします。

所要時間: 30分〜1時間

---

## 📋 必要なもの

### ハードウェア
- **PC**: Mac / Windows / Linux（どれでもOK）
- **スマホ**: iOS または Android（実機推奨、なくてもOK）

### ソフトウェア（これからインストールします）
- Node.js (v18以上)
- npm または yarn
- Git
- VSCode（推奨エディタ）
- Expo Go アプリ（スマホ）

---

## 🛠 インストール手順

### 1. Node.js のインストール

#### すでにインストール済みか確認

ターミナル（コマンドプロンプト）を開いて：

```bash
node --version
```

`v18.0.0` 以上が表示されればOK。次へ進んでください。

#### 新規インストール

**推奨: nvm (Node Version Manager) を使う**

- **Mac/Linux:**
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  # ターミナルを再起動
  nvm install 20
  nvm use 20
  ```

- **Windows:**
  1. [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) からインストーラーをダウンロード
  2. インストール後、コマンドプロンプトで：
     ```bash
     nvm install 20
     nvm use 20
     ```

**または公式サイトから:**
- https://nodejs.org/ → LTS版をダウンロード

#### 確認

```bash
node --version  # v20.x.x
npm --version   # 10.x.x
```

---

### 2. Git のインストール

#### すでにインストール済みか確認

```bash
git --version
```

バージョンが表示されればOK。

#### 新規インストール

- **Mac**: `brew install git` または Xcode Command Line Tools
- **Windows**: https://git-scm.com/download/win
- **Linux**: `sudo apt install git` (Ubuntu/Debian)

---

### 3. VSCode のインストール

**公式サイト:**
https://code.visualstudio.com/

#### 推奨する拡張機能

VSCodeを開いて、左のExtensionsアイコンをクリックし、以下を検索してインストール：

1. **ES7+ React/Redux/React-Native snippets**
   - React/React Native のスニペット集

2. **Prettier - Code formatter**
   - コード自動整形

3. **ESLint**
   - JavaScriptの文法チェック

4. **React Native Tools**
   - React Native デバッグサポート

5. **vscode-icons** (オプション)
   - ファイルアイコン表示

#### VSCode設定

`Cmd/Ctrl + ,` で設定を開き、以下を追加：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

---

### 4. Expo CLI のインストール

**グローバルインストールは不要になりました！**（2023年以降）

代わりに `npx` を使います：

```bash
npx expo --version
```

これで最新のExpo CLIが使えます。

---

### 5. スマホに Expo Go アプリをインストール

実機でアプリを動かすために、スマホに専用アプリをインストールします。

#### iOS (iPhone/iPad)

App Storeで **"Expo Go"** を検索してインストール

または: https://apps.apple.com/app/expo-go/id982107779

#### Android

Google Playで **"Expo Go"** を検索してインストール

または: https://play.google.com/store/apps/details?id=host.exp.exponent

---

## 🚀 最初のプロジェクトを作成

### プロジェクト作成

ターミナルで作業したいディレクトリに移動し：

```bash
npx create-expo-app wellness-tracker
```

テンプレートを選択する画面が出たら：
- `blank` を選択（シンプルなテンプレート）

#### 処理の内訳

この1コマンドで何が起きているか：

```
1. create-expo-app がダウンロードされる
2. wellness-tracker フォルダが作成される
3. package.json が作成される（依存関係の定義）
4. 必要なライブラリがインストールされる
   - react, react-native
   - expo (50個以上のモジュール)
5. 基本的なフォルダ構成が作成される
```

### プロジェクトに移動

```bash
cd wellness-tracker
```

### ディレクトリ構造を確認

```bash
tree -L 2 -I node_modules
```

以下のような構造になっているはずです：

```
wellness-tracker/
├── App.js              # メインのアプリコンポーネント
├── app.json            # Expo の設定ファイル
├── package.json        # npm の依存関係
├── babel.config.js     # Babel の設定
├── assets/             # 画像・フォントなど
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
└── node_modules/       # インストールされたライブラリ
```

---

## 📱 アプリを起動する

### 開発サーバーの起動

```bash
npx expo start
```

ターミナルに以下のような表示が出ます：

```
› Metro waiting on exp://192.168.1.10:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

### 🎉 実機で動かす（推奨）

#### iOS の場合:
1. iPhoneの標準カメラアプリを起動
2. ターミナルに表示されているQRコードをスキャン
3. 「Expo Goで開く」をタップ
4. アプリが起動！

#### Android の場合:
1. Expo Go アプリを起動
2. "Scan QR Code" をタップ
3. ターミナルに表示されているQRコードをスキャン
4. アプリが起動！

### エミュレーターで動かす

#### iOS Simulator（Macのみ）

**事前準備:**
1. Xcodeをインストール（App Storeから）
2. Xcode を一度起動して利用規約に同意
3. ターミナルで：
   ```bash
   xcode-select --install
   ```

**起動:**
```bash
npx expo start
# → i キーを押す
```

iOS Simulatorが自動的に起動します。

#### Android Emulator

**事前準備:**
1. Android Studio をインストール
   - https://developer.android.com/studio
2. Android Studio を起動
3. "More Actions" → "Virtual Device Manager"
4. "Create Device" でエミュレーターを作成
   - 推奨: Pixel 5, API 33

**起動:**
```bash
npx expo start
# → a キーを押す
```

Androidエミュレーターが自動的に起動します。

### Webブラウザで動かす

```bash
npx expo start
# → w キーを押す
```

ブラウザで http://localhost:8081 が開きます。

**注意:** Webではネイティブ機能（カメラ、位置情報など）の一部が動きません。

---

## 🔍 動作確認の仕組み

### ここで何が起きているか？

```
┌──────────────────────────────────────────┐
│  1. Metro Bundler が起動                   │
│     - JavaScriptコードをバンドル            │
│     - ファイル変更を監視                     │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│  2. 開発サーバーが起動 (ポート8081)          │
│     - バンドルされたJSを配信                │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│  3. Expo Go アプリが接続                   │
│     - 同じWi-Fi上でPCを検出               │
│     - JSバンドルをダウンロード              │
└──────────────────────────────────────────┘
              ↓
┌──────────────────────────────────────────┐
│  4. React Native が実行                   │
│     - JSコードをネイティブUIに変換          │
│     - アプリが表示される                    │
└──────────────────────────────────────────┘
```

### なぜネットワーク経由？

開発時は、アプリのコード自体はスマホに入っていません。
**PCから無線で配信**されています。

これにより：
- ✅ ビルド不要で即座に変更を反映
- ✅ 複数デバイスで同時テスト可能
- ✅ Fast Refresh でコード変更が即座に反映

---

## 🐛 トラブルシューティング

### QRコードをスキャンしても接続できない

**原因:** PC とスマホが別のネットワークにいる

**解決策:**
1. 同じWi-Fiに接続する
2. または、Tunnelモードを使う：
   ```bash
   npx expo start --tunnel
   ```
   → ngrokを使ってインターネット経由で接続

### "Metro Bundler error" が出る

**解決策:**
```bash
# キャッシュをクリア
npx expo start -c

# または
rm -rf node_modules
npm install
npx expo start
```

### "Unable to resolve module" エラー

**解決策:**
```bash
# 依存関係を再インストール
npm install

# Watchmanをリセット (Mac/Linux)
watchman watch-del-all
```

### iOS Simulator が起動しない

**解決策:**
```bash
# Xcodeのパスを確認
xcode-select -p

# パスが正しくない場合
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### Android Emulator が起動しない

**解決策:**
1. Android Studio を起動
2. Tools → AVD Manager
3. エミュレーターを手動で起動
4. その状態で `npx expo start` → `a`

### ポート8081が既に使われている

**解決策:**
```bash
# 別のポートを使う
npx expo start --port 8082

# またはプロセスを停止
lsof -ti:8081 | xargs kill -9  # Mac/Linux
```

---

## 📊 ログの確認方法

### ターミナルログ

`npx expo start` を実行しているターミナルに、すべてのログが表示されます。

```bash
# エラーが出たらこのターミナルを確認
```

### アプリ内ログ

`console.log()` を使ったログも、PCのターミナルに表示されます。

```javascript
// App.js
console.log('アプリが起動しました');
console.warn('警告メッセージ');
console.error('エラーメッセージ');
```

### デバッグメニュー

実機またはエミュレーターで：
- **iOS**: `Cmd + D`（Simulator）/ デバイスをシェイク（実機）
- **Android**: `Cmd + M`（Mac）/ `Ctrl + M`（Windows）

メニューが表示され、以下の操作ができます：
- Reload（リロード）
- Debug Remote JS（Chrome DevToolsでデバッグ）
- Show Performance Monitor（パフォーマンス表示）

---

## 🎨 エディタの便利機能

### スニペット

VSCodeで `rnf` + Tab キー → React Native関数コンポーネントのテンプレートが挿入

```javascript
const ComponentName = () => {
  return (
    <View>
      <Text></Text>
    </View>
  );
};

export default ComponentName;
```

### 自動インポート

コンポーネント名を書いて、`Cmd/Ctrl + .` → 自動でimport文が追加されます。

### Go to Definition

`Cmd/Ctrl + クリック` でコンポーネントや関数の定義にジャンプ

---

## ✅ 動作確認チェックリスト

以下がすべてできればOK：

- [ ] `npx expo start` でサーバーが起動する
- [ ] 実機またはエミュレーターでアプリが表示される
- [ ] App.js の Text を変更すると、アプリに即座に反映される（Fast Refresh）
- [ ] デバッグメニューが開ける
- [ ] console.log() がターミナルに表示される

---

## 🎓 補足: Expo Go の制限

### Expo Go でできること
- Expo SDK のすべての機能
- カメラ、位置情報、センサー、Bluetooth など
- 基本的な開発とテスト

### Expo Go でできないこと
- カスタムネイティブモジュール（自作のSwift/Kotlinコード）
- 一部のサードパーティライブラリ（react-native-firebase など）
- バックグラウンド処理の完全なテスト

これらが必要な場合は **Development Build** を作成します（Step 22で解説）。

---

## 📚 次のステップ

環境構築が完了しました！

次は **Step 1: 最小構成のExpoアプリ** で、実際にコードを書いていきます。

以下の内容を学びます：
- Expoプロジェクトの構造
- 基本的なコンポーネント（View, Text, Button）
- スタイリングの基礎
- React → React Native → Expo の技術レイヤー詳細解説

---

## 🔗 参考リンク

- [Expo公式ドキュメント](https://docs.expo.dev/)
- [React Native公式ドキュメント](https://reactnative.dev/)
- [React公式ドキュメント](https://react.dev/)
- [Metro Bundler](https://facebook.github.io/metro/)

---

**お疲れ様でした！次へ進みましょう 🚀**

