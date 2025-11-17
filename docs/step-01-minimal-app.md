# Step 1: 最小構成のExpoアプリ

## 🎯 このステップのゴール

- Expoプロジェクトの構造を理解する
- 基本的なコンポーネント（View, Text, Button）を使う
- スタイリングの基礎を学ぶ
- React Webとの違いを体感する
- **技術的仕組み**: JSXがどうやってネイティブUIになるかを理解する

所要時間: 1時間

---

## 📁 プロジェクト構造の理解

まず、`npx create-expo-app wellness-tracker` で作成されたファイルを見てみましょう。

```
wellness-tracker/
├── App.js                 ← メインのアプリコンポーネント（ここから開始）
├── app.json              ← Expo設定（アプリ名、アイコンなど）
├── package.json          ← npm依存関係
├── babel.config.js       ← JavaScriptトランスパイラ設定
├── assets/               ← 画像・フォントなど
│   ├── icon.png         （アプリアイコン）
│   ├── splash.png       （起動画面）
│   └── adaptive-icon.png（Androidアダプティブアイコン）
└── node_modules/         ← インストールされたライブラリ
```

### 重要なファイル解説

#### 1. App.js - アプリのエントリーポイント

```javascript
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

**これが起動時に最初に実行されるコンポーネント**です。

#### 2. app.json - Expo設定

```json
{
  "expo": {
    "name": "wellness-tracker",
    "slug": "wellness-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

**アプリの設定ファイル**。ビルド時に参照されます。

#### 3. package.json - 依存関係

```json
{
  "name": "wellness-tracker",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0"
  }
}
```

`"main": "node_modules/expo/AppEntry.js"` が実際のエントリーポイント。
これが `App.js` を読み込みます。

---

## 🧱 基本コンポーネント

### React NativeとReact Webの対応表

| 用途 | React Web | React Native |
|------|-----------|--------------|
| コンテナ | `<div>` | `<View>` |
| テキスト | `<span>`, `<p>`, `<h1>` | `<Text>` |
| 画像 | `<img>` | `<Image>` |
| スクロール | `<div style={{overflow: 'scroll'}}>` | `<ScrollView>` |
| ボタン | `<button>` | `<Button>` または `<Pressable>` |
| 入力 | `<input>` | `<TextInput>` |

### なぜ違うコンポーネントを使うのか？

React Webの `<div>` や `<span>` は **HTML要素** です。
スマホには**HTMLレンダラー（ブラウザ）がない**ので、代わりに：

- **iOS**: UIKit の `UIView`, `UILabel` など
- **Android**: `android.view.View`, `TextView` など

を使います。

React Nativeの `<View>` は、これらネイティブコンポーネントへの**抽象化されたインターフェース**です。

---

## 📝 実践: 最初のアプリを作る

`App.js` を開いて、以下のコードに書き換えてください。

### App.js

```javascript
import { StyleSheet, Text, View, Button } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [weight, setWeight] = useState(70);

  const handleIncrease = () => {
    setWeight(weight + 0.1);
  };

  const handleDecrease = () => {
    setWeight(weight - 0.1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>健康管理アプリ</Text>
      <Text style={styles.label}>今日の体重</Text>
      <Text style={styles.weight}>{weight.toFixed(1)} kg</Text>

      <View style={styles.buttonContainer}>
        <Button title="+ 0.1kg" onPress={handleIncrease} />
        <View style={styles.spacer} />
        <Button title="- 0.1kg" onPress={handleDecrease} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  label: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  weight: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  spacer: {
    width: 20,
  },
});
```

### 保存してアプリを確認

ファイルを保存すると、**Fast Refresh** により即座にアプリに反映されます！

画面には：
- 「健康管理アプリ」というタイトル
- 「今日の体重」ラベル
- 70.0 kg という大きな数字
- 2つのボタン

が表示されているはずです。

ボタンを押すと、体重の数字が変わります。

---

## 🎨 スタイリングの基礎

### StyleSheet.create とは

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  }
});
```

これは React Web の CSS に相当します。

#### React Webとの違い

| React Web | React Native |
|-----------|--------------|
| CSS ファイル | StyleSheet オブジェクト |
| `class="container"` | `style={styles.container}` |
| ケバブケース `background-color` | キャメルケース `backgroundColor` |
| 単位: `px`, `%`, `rem` | 単位なし（dp: density-independent pixels） |

### インラインスタイル

```javascript
<Text style={{ fontSize: 20, color: 'red' }}>テキスト</Text>
```

これも可能ですが、**パフォーマンス上 StyleSheet.create が推奨**されます。

理由:
- StyleSheet.create で定義したスタイルは一度だけ作成される
- インラインスタイルは毎回新しいオブジェクトを生成 → 再レンダリングの原因に

### Flexbox レイアウト

React Nativeのレイアウトは**Flexboxのみ**です（floatやgridはありません）。

```javascript
container: {
  flex: 1,              // 親の空間を埋める
  flexDirection: 'column', // 縦並び（デフォルト）
  alignItems: 'center',    // 横方向中央揃え
  justifyContent: 'center', // 縦方向中央揃え
}
```

#### React Webとの違い

| React Web | React Native |
|-----------|--------------|
| `display: flex` が必要 | デフォルトでflex |
| `flex-direction: row` がデフォルト | `column` がデフォルト |

### 単位: dp (Density-Independent Pixels)

```javascript
fontSize: 20,  // 20dp
```

React Nativeでは単位を書きません。すべて**dp**として扱われます。

#### dpとは？

**物理ピクセルではなく、論理ピクセル**。

- iPhone SE (画面密度@2x): `fontSize: 20` → 40物理ピクセル
- iPad Pro (画面密度@3x): `fontSize: 20` → 60物理ピクセル

**どのデバイスでも同じ見た目になる**ように自動調整されます。

---

## 🔬 技術解説: JSXからネイティブUIへの変換

ここが最も重要な部分です。

### あなたが書いたコード

```jsx
<View style={styles.container}>
  <Text style={styles.title}>健康管理アプリ</Text>
</View>
```

### これがどう動くか（ステップバイステップ）

#### Step 1: Babel がトランスパイル

JSXは**JavaScript ではない**ので、まず普通のJavaScriptに変換されます。

```javascript
// JSX
<View style={styles.container}>
  <Text>健康管理アプリ</Text>
</View>

// ↓ Babel変換後

React.createElement(
  View,
  { style: styles.container },
  React.createElement(Text, null, '健康管理アプリ')
)
```

#### Step 2: React が仮想DOMを構築

```javascript
{
  type: View,
  props: { style: { flex: 1, ... } },
  children: [
    {
      type: Text,
      props: { style: { fontSize: 28, ... } },
      children: ['健康管理アプリ']
    }
  ]
}
```

これは**JavaScriptのオブジェクト**です。まだ画面には何も表示されていません。

#### Step 3: React Native のレンダラーが処理

React Nativeのレンダラーが、仮想DOMツリーを走査し、
**ネイティブUIコンポーネントを作成する指示**をブリッジ経由で送ります。

```javascript
// JavaScript → Native へのメッセージ
{
  "type": "createView",
  "viewId": 1,
  "viewType": "RCTView",  // React Native の View
  "props": {
    "style": { "flex": 1, "backgroundColor": "#f5f5f5", ... }
  }
}

{
  "type": "createView",
  "viewId": 2,
  "viewType": "RCTText",  // React Native の Text
  "props": {
    "text": "健康管理アプリ",
    "style": { "fontSize": 28, ... }
  },
  "parentId": 1  // View(id:1) の子要素として追加
}
```

#### Step 4: Native側でUIコンポーネントを生成

**iOS (Swift/Objective-C):**

```swift
// RCTView → UIView
let view = UIView()
view.backgroundColor = UIColor(red: 0.96, green: 0.96, blue: 0.96, alpha: 1.0)
// Flexboxレイアウトを計算（Yogaライブラリ使用）

// RCTText → UILabel
let label = UILabel()
label.text = "健康管理アプリ"
label.font = UIFont.systemFont(ofSize: 28, weight: .bold)
label.textColor = UIColor(red: 0.2, green: 0.2, blue: 0.2, alpha: 1.0)

view.addSubview(label)

// ViewControllerに追加
rootViewController.view.addSubview(view)
```

**Android (Kotlin/Java):**

```kotlin
// RCTView → android.view.ViewGroup
val view = FrameLayout(context)
view.setBackgroundColor(Color.parseColor("#f5f5f5"))

// RCTText → TextView
val textView = TextView(context)
textView.text = "健康管理アプリ"
textView.textSize = 28f
textView.setTypeface(null, Typeface.BOLD)
textView.setTextColor(Color.parseColor("#333333"))

view.addView(textView)
rootView.addView(view)
```

#### Step 5: 画面に表示

これでようやく**ネイティブのUIが画面に描画**されます。

---

## 🔄 イベント処理の仕組み

ボタンを押したときの流れも見てみましょう。

### あなたが書いたコード

```jsx
<Button title="+ 0.1kg" onPress={handleIncrease} />
```

### ボタンがタップされたとき

#### Step 1: ネイティブ側がタッチを検出

**iOS:**
```swift
// UIButton の touchUpInside イベント
button.addTarget(self, action: #selector(handleTap), for: .touchUpInside)

@objc func handleTap() {
    // JavaScript側に通知
    bridge.sendEvent("press", viewId: buttonId)
}
```

**Android:**
```kotlin
button.setOnClickListener {
    // JavaScript側に通知
    bridge.sendEvent("press", viewId = buttonId)
}
```

#### Step 2: ブリッジ経由でJavaScript側に送信

```json
{
  "type": "event",
  "eventType": "press",
  "viewId": 3
}
```

#### Step 3: React NativeがJavaScriptイベントを発火

```javascript
// React Native内部
const button = findViewById(3);
button.props.onPress();  // あなたの onPress ハンドラーが呼ばれる
```

#### Step 4: あなたのハンドラーが実行される

```javascript
const handleIncrease = () => {
  setWeight(weight + 0.1);  // stateを更新
};
```

#### Step 5: React が再レンダリング

```javascript
// 新しい体重で仮想DOMを再構築
<Text>{70.1} kg</Text>  // 70.0 → 70.1 に変更
```

#### Step 6: React Nativeが差分を検出

```javascript
// 変更があった部分だけ特定
{
  "type": "updateView",
  "viewId": 2,
  "props": {
    "text": "70.1 kg"  // ← ここだけ更新
  }
}
```

#### Step 7: Native側がUIを更新

```swift
// iOS
label.text = "70.1 kg"

// Android
textView.text = "70.1 kg"
```

### 図解: 全体の流れ

```
┌─────────────────────────────────────────────────────┐
│  1. ユーザーがボタンをタップ                           │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  2. iOS/Android がタッチイベントを検出                │
│     (UIButton / android.widget.Button)              │
└─────────────────────────────────────────────────────┘
                    ↓ ブリッジ
┌─────────────────────────────────────────────────────┐
│  3. JavaScript側に "press" イベント送信               │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  4. onPress ハンドラー実行                            │
│     setWeight(weight + 0.1)                         │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  5. React が再レンダリング                            │
│     新しい仮想DOMを構築                               │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  6. React Native が差分検出                          │
│     "70.1 kg" に変更されたTextだけ特定                │
└─────────────────────────────────────────────────────┘
                    ↓ ブリッジ
┌─────────────────────────────────────────────────────┐
│  7. Native側にUI更新指示                             │
│     updateView(id: 2, text: "70.1 kg")              │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  8. UILabel/TextView のテキストが更新される           │
│     → 画面に反映                                      │
└─────────────────────────────────────────────────────┘
```

この一連の流れが**数ミリ秒**で完了します。

---

## 🆚 React Web との比較

### 同じ機能をWebで実装すると

```jsx
// React Web
import { useState } from 'react';
import './App.css';

export default function App() {
  const [weight, setWeight] = useState(70);

  return (
    <div className="container">
      <h1 className="title">健康管理アプリ</h1>
      <p className="label">今日の体重</p>
      <p className="weight">{weight.toFixed(1)} kg</p>

      <div className="button-container">
        <button onClick={() => setWeight(weight + 0.1)}>+ 0.1kg</button>
        <button onClick={() => setWeight(weight - 0.1)}>- 0.1kg</button>
      </div>
    </div>
  );
}
```

```css
/* App.css */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 40px;
}
```

### 主な違い

| 項目 | React Web | React Native |
|------|-----------|--------------|
| **マークアップ** | HTML (`<div>`, `<button>`) | ネイティブコンポーネント (`<View>`, `<Button>`) |
| **スタイル** | CSS ファイル | StyleSheet オブジェクト |
| **レンダリング** | ブラウザのDOM | iOS: UIKit, Android: View |
| **イベント** | `onClick` | `onPress` |
| **実行環境** | ブラウザ (V8/SpiderMonkey/JavaScriptCore) | JSCore (iOS) / Hermes (Android) |

### 同じ部分

| 項目 | 共通 |
|------|------|
| **状態管理** | `useState`, `useEffect` などのHooks |
| **コンポーネント** | 関数コンポーネント |
| **再レンダリング** | 仮想DOMによる差分検出 |
| **言語** | JavaScript / TypeScript |

**つまり、Reactの考え方はそのまま使えます！**

---

## 🧪 実験: Fast Refresh を体験

Fast Refreshは、React Nativeの最も強力な開発機能の1つです。

### 実験1: テキストを変更

`App.js` の以下の行を変更してみてください：

```javascript
<Text style={styles.title}>健康管理アプリ</Text>
```

↓

```javascript
<Text style={styles.title}>Wellness Tracker</Text>
```

保存すると、**アプリを再起動せずに**変更が即座に反映されます。

### 実験2: スタイルを変更

```javascript
title: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#333',  // ← この色を変更
}
```

↓

```javascript
title: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#E74C3C',  // 赤色に
}
```

即座に色が変わります！

### 実験3: ロジックを変更

```javascript
const handleIncrease = () => {
  setWeight(weight + 0.1);  // ← 0.1 → 1 に変更
};
```

↓

```javascript
const handleIncrease = () => {
  setWeight(weight + 1);  // 1kg ずつ増える
};
```

**状態は保持されたまま**ロジックだけが更新されます。

### Fast Refreshの仕組み

```
1. ファイル変更を検出 (Metro Bundlerの監視機能)
   ↓
2. 変更されたモジュールだけを再バンドル
   ↓
3. アプリに新しいコードを送信
   ↓
4. コンポーネントを再マウント（状態は保持）
   ↓
5. 画面更新（1〜2秒）
```

これにより：
- ✅ ビルド不要
- ✅ アプリ再起動不要
- ✅ 状態が消えない
- ✅ 超高速フィードバック

---

## ⚠️ よくあるエラーと解決法

### エラー1: "Text strings must be rendered within a <Text> component"

```javascript
// ❌ ダメな例
<View>
  Hello
</View>

// ✅ 正しい例
<View>
  <Text>Hello</Text>
</View>
```

**原因:** React Nativeでは、すべてのテキストは `<Text>` で囲む必要があります。

### エラー2: "Invariant Violation: View config not found for name div"

```javascript
// ❌ HTMLタグを使ってしまった
<div>
  <span>Hello</span>
</div>

// ✅ React Nativeコンポーネントを使う
<View>
  <Text>Hello</Text>
</View>
```

**原因:** HTMLタグは使えません。

### エラー3: スタイルが効かない

```javascript
// ❌ CSSプロパティ名
<Text style={{ 'font-size': 20 }}>テキスト</Text>

// ✅ キャメルケース
<Text style={{ fontSize: 20 }}>テキスト</Text>
```

**原因:** プロパティ名はキャメルケースで書く必要があります。

---

## 📊 console.log でデバッグ

開発中は `console.log` を多用しましょう。

```javascript
const handleIncrease = () => {
  console.log('現在の体重:', weight);
  setWeight(weight + 0.1);
  console.log('新しい体重:', weight + 0.1);
};
```

ログは**PCのターミナル**（`npx expo start` を実行しているターミナル）に表示されます。

### 他のログ関数

```javascript
console.log('通常のログ');
console.warn('警告');  // 黄色で表示
console.error('エラー');  // 赤色で表示
console.table({ name: 'John', age: 30 });  // テーブル形式
```

---

## 🎓 技術的まとめ

このステップで学んだこと：

### レイヤー1: あなたのコード
```jsx
<View><Text>Hello</Text></View>
```

### レイヤー2: React Core
- JSX → `React.createElement()` に変換
- 仮想DOM構築
- 差分検出

### レイヤー3: React Native
- 仮想DOM → ネイティブUI への変換指示
- ブリッジ経由でメッセージ送信
- イベントのハンドリング

### レイヤー4: (今回は未使用)

### レイヤー5: ネイティブプラットフォーム
- iOS: UIView, UILabel
- Android: View, TextView
- 実際の画面描画

---

## 🚀 次のステップ

次は **Step 2: ナビゲーション (React Navigation)** です。

以下を学びます：
- 複数画面の作成
- タブナビゲーション
- スタックナビゲーション
- **技術解説**: ネイティブナビゲーションとの違い

現在のアプリは1画面だけですが、実際のアプリには複数の画面が必要です。
React Navigationを使って、本格的なアプリの構造を作っていきましょう！

---

## 📚 参考リンク

- [React Native Core Components](https://reactnative.dev/docs/components-and-apis)
- [React Native StyleSheet](https://reactnative.dev/docs/stylesheet)
- [React Native Flexbox](https://reactnative.dev/docs/flexbox)
- [Babel とは](https://babeljs.io/docs/en/)

---

**お疲れ様でした！基礎はバッチリです 🎉**

