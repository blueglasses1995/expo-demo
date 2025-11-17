# Expo開発効率化＆デバッグ完全ガイド

## 🎯 このガイドの目的

Expo開発をスムーズに進めるための実践的なテクニック集です。

- デバッグ手法
- ログ確認方法
- エラーの読み方
- パフォーマンス最適化
- 開発ツールの使い方

実務で「これ知ってたら時間節約できた！」という内容を詰め込みました。

---

## 📋 目次

1. [ログ出力とデバッグ基礎](#1-ログ出力とデバッグ基礎)
2. [Expo DevTools](#2-expo-devtools)
3. [React Native Debugger](#3-react-native-debugger)
4. [エラーメッセージの読み方](#4-エラーメッセージの読み方)
5. [パフォーマンスモニタリング](#5-パフォーマンスモニタリング)
6. [ネットワークデバッグ](#6-ネットワークデバッグ)
7. [実機デバッグ](#7-実機デバッグ)
8. [Hot Reload / Fast Refresh](#8-hot-reload--fast-refresh)
9. [デバッグのベストプラクティス](#9-デバッグのベストプラクティス)

---

## 1. ログ出力とデバッグ基礎

### console.log の基本

```javascript
// 基本的なログ
console.log('アプリ起動');

// 変数の値を確認
const user = { name: 'Taro', age: 30 };
console.log('user:', user);

// 複数の値
console.log('name:', user.name, 'age:', user.age);

// オブジェクトの詳細表示
console.dir(user);

// テーブル形式（見やすい）
console.table(user);
```

### ログレベルの使い分け

```javascript
console.log('通常の情報');      // 白色
console.info('情報');           // 青色（一部環境）
console.warn('警告');          // 黄色（警告表示）
console.error('エラー');       // 赤色（エラー表示）
console.debug('デバッグ用');    // グレー（一部環境）
```

**ターミナルでの表示:**
```
LOG  通常の情報
WARN 警告
ERROR エラー
```

**実機での表示:**
- 警告/エラーは画面上に黄色/赤色のオーバーレイで表示される

### console.log の高度な使い方

#### 1. タイムスタンプ付きログ

```javascript
console.log(`[${new Date().toISOString()}] アプリ起動`);
// → [2024-01-15T10:30:45.123Z] アプリ起動
```

#### 2. 関数の実行タイミング確認

```javascript
function fetchData() {
  console.log('→ fetchData 開始');
  // 処理...
  console.log('← fetchData 完了');
}
```

#### 3. 条件付きログ

```javascript
const DEBUG = __DEV__;  // 開発環境でのみ true

if (DEBUG) {
  console.log('デバッグ情報:', data);
}

// または
DEBUG && console.log('デバッグ情報:', data);
```

#### 4. パフォーマンス計測

```javascript
console.time('データ取得');
await fetchDataFromAPI();
console.timeEnd('データ取得');
// → データ取得: 234.56ms
```

#### 5. スタックトレース

```javascript
console.trace('この関数がどこから呼ばれたか確認');
// → 呼び出し元の関数一覧が表示される
```

### ログの色分け（カスタムLogger）

```javascript
// utils/logger.js
const logger = {
  debug: (...args) => {
    if (__DEV__) {
      console.log('🔍 [DEBUG]', ...args);
    }
  },
  info: (...args) => console.log('ℹ️ [INFO]', ...args),
  warn: (...args) => console.warn('⚠️ [WARN]', ...args),
  error: (...args) => console.error('❌ [ERROR]', ...args),
  api: (...args) => console.log('🌐 [API]', ...args),
  nav: (...args) => console.log('🧭 [NAV]', ...args),
};

export default logger;

// 使い方
import logger from './utils/logger';
logger.api('GET /users/123');
logger.error('ログイン失敗', error);
```

---

## 2. Expo DevTools

### 起動方法

```bash
npx expo start
```

ターミナルに表示されるメニュー：

```
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

### 主な機能

#### デバッグメニューを開く（実機/エミュレーター）

**iOS Simulator:**
- `Cmd + D`

**Android Emulator:**
- `Cmd + M` (Mac) / `Ctrl + M` (Windows)

**実機:**
- デバイスを振る（シェイク）

メニュー内容：
```
- Reload
- Debug Remote JS
- Enable Fast Refresh
- Enable Hot Reloading
- Toggle Inspector
- Show Performance Monitor
```

#### リロード（最もよく使う）

**方法1: ショートカット**
- iOS Simulator: `Cmd + R`
- Android Emulator: `R` を2回押す

**方法2: ターミナル**
- `r` キーを押す

**方法3: デバッグメニュー**
- デバッグメニュー → "Reload"

#### キャッシュクリア付きリロード

```bash
npx expo start -c
# または
npx expo start --clear
```

変更が反映されないときに有効。

---

## 3. React Native Debugger

### インストール

**Mac:**
```bash
brew install react-native-debugger
```

**Windows/Linux:**
https://github.com/jhen0409/react-native-debugger/releases

### 使い方

1. React Native Debuggerを起動
2. アプリのデバッグメニュー → "Debug Remote JS"
3. 自動的に接続される

### 主な機能

#### Redux DevTools統合
- Redux の状態変化が見える
- アクションの履歴を確認
- タイムトラベルデバッグ

#### React DevTools統合
- コンポーネントツリーの表示
- Props/State の確認
- コンポーネントの選択とハイライト

#### ブレークポイント
```javascript
function calculateTotal(items) {
  debugger;  // ← ここで実行が止まる
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### ネットワークインスペクター
- すべてのHTTPリクエストを表示
- リクエスト/レスポンスの詳細確認

---

## 4. エラーメッセージの読み方

### 典型的なエラーと解決法

#### エラー1: "Invariant Violation: Element type is invalid"

```
Invariant Violation: Element type is invalid: expected a string
(for built-in components) or a class/function (for composite components)
but got: undefined. You likely forgot to export your component...
```

**原因:**
```javascript
// ❌ 間違い
import { MyComponent } from './MyComponent';
// でも MyComponent.js が export default している

// ✅ 正しい
import MyComponent from './MyComponent';
```

**解決策:** import/export の形式を確認

---

#### エラー2: "Unable to resolve module"

```
error: Error: Unable to resolve module react-native-vector-icons
from App.js: react-native-vector-icons could not be found
```

**原因:** ライブラリがインストールされていない

**解決策:**
```bash
npx expo install react-native-vector-icons
```

---

#### エラー3: "Text strings must be rendered within a <Text> component"

```
Invariant Violation: Text strings must be rendered within a <Text> component.
```

**原因:**
```javascript
// ❌ ダメ
<View>
  Hello World
</View>

// ✅ 正しい
<View>
  <Text>Hello World</Text>
</View>
```

---

#### エラー4: "Objects are not valid as a React child"

```
Error: Objects are not valid as a React child (found: object with keys {name, age}).
If you meant to render a collection of children, use an array instead.
```

**原因:**
```javascript
// ❌ オブジェクトをそのまま表示しようとしている
const user = { name: 'Taro', age: 30 };
<Text>{user}</Text>

// ✅ 文字列に変換
<Text>{user.name}</Text>
<Text>{JSON.stringify(user)}</Text>
```

---

#### エラー5: "Cannot read property 'map' of undefined"

```
TypeError: Cannot read property 'map' of undefined
```

**原因:** データがまだ読み込まれていない

**解決策:**
```javascript
// ❌ データがundefinedの可能性
{data.map(item => <Text key={item.id}>{item.name}</Text>)}

// ✅ 存在確認
{data?.map(item => <Text key={item.id}>{item.name}</Text>)}

// ✅ デフォルト値
{(data || []).map(item => <Text key={item.id}>{item.name}</Text>)}
```

---

### エラーの読み方（スタックトレース）

```
Error: Network request failed
    at node_modules/react-native/Libraries/Network/XMLHttpRequest.js:574:10
    at tryCallTwo (/node_modules/promise/lib/core.js:45:5)
    at App.js:23:8        ← ★ あなたのコードのどこでエラーが起きたか
```

**読み方:**
1. 最初の行でエラーの種類を確認（"Network request failed"）
2. スタックトレースの中から**自分のコード**（App.jsなど）を探す
3. その行番号を確認

---

## 5. パフォーマンスモニタリング

### Performance Monitor

デバッグメニュー → "Show Performance Monitor"

表示される情報：
```
RAM: 145 MB          ← メモリ使用量
JS: 16 ms (60 FPS)   ← JavaScriptスレッドのフレーム時間
UI: 16 ms (60 FPS)   ← UIスレッドのフレーム時間
Views: 42            ← 画面上のViewの数
```

#### FPSの見方

- **60 FPS**: 完璧（16ms/フレーム）
- **30 FPS**: カクつき始める
- **15 FPS以下**: 明らかに遅い

#### ボトルネックの特定

**JSスレッドが遅い（JS: 30ms）:**
- 原因: 複雑な計算、大量のデータ処理
- 解決: メモ化、非同期処理、最適化

**UIスレッドが遅い（UI: 30ms）:**
- 原因: 大量のView、複雑なレイアウト
- 解決: FlatList使用、shouldComponentUpdate、React.memo

### FPS Counter（常時表示）

```javascript
// App.js
import { setJSExceptionHandler } from 'react-native-exception-handler';

if (__DEV__) {
  // 開発時のみFPSを表示
  global.perf = require('react-native-performance');
  global.perf.setResourceLoggingEnabled(true);
}
```

---

## 6. ネットワークデバッグ

### Flipper（Meta公式ツール）

#### インストール

https://fbflipper.com/

#### 使い方

1. Flipperを起動
2. `npx expo prebuild` でネイティブプロジェクト生成
3. iOS/Androidをビルドして起動
4. Flipperが自動認識

#### 主な機能

**Network Plugin:**
- すべてのHTTPリクエスト/レスポンス
- リクエストヘッダー、ボディ
- レスポンス時間

**Layout Inspector:**
- UIの階層構造
- 各Viewのスタイル
- レイアウト問題の特定

**Logs:**
- console.log がリアルタイム表示
- フィルタリング可能

### fetch のログ出力

```javascript
// utils/api.js
const originalFetch = fetch;

global.fetch = async (...args) => {
  const [url, options] = args;
  console.log('🌐 Request:', options?.method || 'GET', url);

  try {
    const response = await originalFetch(...args);
    console.log('✅ Response:', response.status, url);
    return response;
  } catch (error) {
    console.error('❌ Error:', url, error);
    throw error;
  }
};
```

---

## 7. 実機デバッグ

### iOS実機

#### Safari Web Inspector

1. iPhone設定 → Safari → 詳細 → "Webインスペクタ" をON
2. MacのSafari → 開発 → [あなたのiPhone] → JSContext
3. Console が開く

**使える機能:**
- console.log の出力
- JavaScriptコードの実行
- ネットワーク監視

### Android実機

#### Chrome DevTools

1. Androidをデベロッパーモード + USBデバッグON
2. PCとUSBケーブルで接続
3. Chrome で `chrome://inspect` を開く
4. デバイスが表示される → "inspect"

**使える機能:**
- console.log
- ブレークポイント
- ネットワーク

### Logcat（Android）

```bash
# すべてのログ
adb logcat

# React Nativeのログのみ
adb logcat | grep ReactNative

# クリア
adb logcat -c
```

---

## 8. Hot Reload / Fast Refresh

### Fast Refresh（推奨）

**自動的に有効**（React Native 0.61+）

変更を保存すると：
- ✅ 関数コンポーネントが即座に更新
- ✅ 状態（state）は保持される
- ✅ エラーがあれば画面に表示

### Fast Refresh が効かないケース

#### 1. 構文エラー

```javascript
// ❌ カンマ忘れ
const obj = {
  name: 'Taro'
  age: 30
}
```

→ 手動でリロード必要

#### 2. ファイル名変更・削除

→ アプリを再起動

#### 3. ネイティブコード変更

```bash
# ネイティブ依存の変更後は再ビルド
npx expo prebuild
npx expo run:ios  # または run:android
```

### Hot Reload（古い方式）

デバッグメニュー → "Enable Hot Reloading"

Fast Refreshとの違い：
- 状態がリセットされる
- 非推奨（Fast Refreshを使うべき）

---

## 9. デバッグのベストプラクティス

### 1. console.log を戦略的に配置

```javascript
function fetchUserData(userId) {
  console.log('→ fetchUserData', { userId });

  try {
    const response = await api.get(`/users/${userId}`);
    console.log('✅ Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    console.log('← fetchUserData 完了');
  }
}
```

### 2. カスタムデバッグコンポーネント

```javascript
// components/DebugInfo.js
const DebugInfo = ({ data }) => {
  if (!__DEV__) return null;  // 本番では非表示

  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'black', opacity: 0.8, padding: 10 }}>
      <Text style={{ color: 'lime', fontSize: 10, fontFamily: 'monospace' }}>
        {JSON.stringify(data, null, 2)}
      </Text>
    </View>
  );
};

// 使い方
<DebugInfo data={{ user, isLoading, error }} />
```

### 3. エラーバウンダリ

```javascript
// components/ErrorBoundary.js
import React from 'react';
import { View, Text, Button } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // エラーレポートサービスに送信（Sentry など）
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>エラーが発生しました</Text>
          <Text style={{ color: 'red' }}>{this.state.error?.message}</Text>
          <Button title="リトライ" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }

    return this.props.children;
  }
}

// 使い方
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 4. デバッグフラグを使う

```javascript
// config/debug.js
export const DEBUG_FLAGS = {
  API: __DEV__ && true,      // API通信のログ
  NAVIGATION: __DEV__ && false,  // ナビゲーションのログ
  RENDER: __DEV__ && false,  // レンダリングのログ
};

// 使い方
if (DEBUG_FLAGS.API) {
  console.log('API Request:', url);
}
```

### 5. React DevTools Profiler

```javascript
import { Profiler } from 'react';

function onRenderCallback(
  id,
  phase,      // "mount" または "update"
  actualDuration,  // レンダリングにかかった時間
  baseDuration,
  startTime,
  commitTime
) {
  console.log(`${id} (${phase}) took ${actualDuration.toFixed(2)}ms`);
}

<Profiler id="UserList" onRender={onRenderCallback}>
  <UserList users={users} />
</Profiler>
```

---

## 🎓 まとめ: デバッグフロー

### 問題発生時のチェックリスト

1. **エラーメッセージを読む**
   - スタックトレースで該当箇所を特定

2. **console.log で状態確認**
   - 変数の値、関数の実行タイミング

3. **Fast Refresh が効いているか**
   - 効いていなければ手動リロード（`r`）

4. **キャッシュクリア**
   ```bash
   npx expo start -c
   ```

5. **依存関係の再インストール**
   ```bash
   rm -rf node_modules
   npm install
   ```

6. **実機で確認**
   - エミュレーターと実機で動作が異なる場合あり

7. **デバッガーを使う**
   - React Native Debugger
   - Chrome DevTools

8. **コミュニティに聞く**
   - GitHub Issues
   - Stack Overflow
   - Expo Forums

---

## 📚 参考リンク

- [Expo Debugging Guide](https://docs.expo.dev/debugging/runtime-issues/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Flipper](https://fbflipper.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

このガイドを使って、効率的にデバッグできるようになりましょう！

