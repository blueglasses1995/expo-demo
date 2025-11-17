# React Native / Expo の技術アーキテクチャ完全解説

## 🎯 この章の目的

「Reactは知っているけど、それがどうやってスマホアプリになるの？」
という疑問に、徹底的に答えます。

React Web、React Native、Expo、そしてiOS/Androidのネイティブコードが
どのように連携してアプリが動くのか、レイヤーごとに詳しく解説します。

---

## 📚 目次

1. [全体像：技術スタックの5層構造](#全体像技術スタックの5層構造)
2. [Layer 1: あなたが書くコード（JavaScript/JSX）](#layer-1-あなたが書くコードjavascriptjsx)
3. [Layer 2: React Core（仮想DOM）](#layer-2-react-core仮想dom)
4. [Layer 3: React Native（ブリッジ）](#layer-3-react-nativeブリッジ)
5. [Layer 4: Expo SDK](#layer-4-expo-sdk)
6. [Layer 5: ネイティブプラットフォーム](#layer-5-ネイティブプラットフォーム)
7. [他の技術との比較](#他の技術との比較)
8. [よくある誤解](#よくある誤解)

---

## 全体像：技術スタックの5層構造

スマホアプリが動く仕組みを、下から上に見ていきましょう。

```
┌─────────────────────────────────────────────────────────┐
│  Layer 5: ネイティブプラットフォーム (iOS/Android OS)       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ・UIKit (iOS) / Android View System                    │
│  ・Core Location / LocationManager                      │
│  ・AVFoundation / Camera2 API                           │
│  ・Core Bluetooth / Bluetooth LE API                    │
│  ・その他すべてのOSが提供するAPI                           │
└─────────────────────────────────────────────────────────┘
                         ↑
                    (Objective-C / Swift)
                    (Java / Kotlin)
                         ↑
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Expo SDK (ネイティブモジュール)                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ・expo-camera  → AVFoundation/Camera2をラップ           │
│  ・expo-location → Core Location/LocationManagerをラップ │
│  ・expo-bluetooth → Core Bluetooth/BLE APIをラップ        │
│  ・expo-notifications → UserNotifications/FCMをラップ     │
│  ・その他50個以上のモジュール                              │
└─────────────────────────────────────────────────────────┘
                         ↑
                  (ネイティブコード + JSバインディング)
                         ↑
┌─────────────────────────────────────────────────────────┐
│  Layer 3: React Native Core                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ・JavaScript ↔ Native の橋渡し (Bridge / JSI)           │
│  ・基本コンポーネント: <View>, <Text>, <Image>            │
│  ・ネイティブコンポーネントのレンダラー                       │
│  ・イベントシステム (タッチ、スクロールなど)                  │
└─────────────────────────────────────────────────────────┘
                         ↑
                    (JavaScript)
                         ↑
┌─────────────────────────────────────────────────────────┐
│  Layer 2: React Core                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ・仮想DOM (Virtual DOM)                                │
│  ・差分検出アルゴリズム (Reconciliation)                   │
│  ・Hooks (useState, useEffect, etc.)                    │
│  ・コンポーネントライフサイクル                             │
└─────────────────────────────────────────────────────────┘
                         ↑
                    (JavaScript)
                         ↑
┌─────────────────────────────────────────────────────────┐
│  Layer 1: あなたが書くコード                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ・JSX で UI を記述                                       │
│  ・Hooks で状態管理                                       │
│  ・イベントハンドラー                                      │
└─────────────────────────────────────────────────────────┘
```

### 🔄 データの流れ

**上から下へ（レンダリング）:**
```
あなたのJSX
  ↓
Reactが仮想DOMを構築
  ↓
React Nativeが差分を検出
  ↓
ブリッジ経由でネイティブに指示
  ↓
iOSの UIView / AndroidのViewが画面に描画
```

**下から上へ（イベント）:**
```
ユーザーが画面をタップ
  ↓
iOSの UITouch / AndroidのMotionEvent
  ↓
ブリッジ経由でJavaScript側に通知
  ↓
React Nativeがイベントを発火
  ↓
あなたの onPress ハンドラーが実行される
```

---

## Layer 1: あなたが書くコード（JavaScript/JSX）

### React Webとほぼ同じ

```jsx
import { useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="増やす" onPress={() => setCount(count + 1)} />
    </View>
  );
}
```

### React Webとの違い

| React Web | React Native |
|-----------|--------------|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<img>` | `<Image>` |
| `<button>` | `<Button>` または `<Pressable>` |
| `<input>` | `<TextInput>` |
| CSS (`className`) | StyleSheet または inline style |

### なぜHTMLタグが使えない？

HTMLは**ブラウザのDOM**のためのマークアップです。
スマホアプリには**ブラウザがない**ので、代わりに：

- iOS: UIKit の UIView, UILabel, UIButton など
- Android: View, TextView, Button など

これらネイティブUIコンポーネントを使います。

React Nativeの `<View>` は：
- **iOS** では `UIView` に変換
- **Android** では `android.view.View` に変換

されます。

---

## Layer 2: React Core（仮想DOM）

### React WebもReact Nativeも同じReact Coreを使う

Reactの本質は「**UIを関数として表現する**」こと。

```jsx
UI = f(state)
```

この考え方はWebでもネイティブでも同じです。

### 仮想DOM（Virtual DOM）とは

実際のUI要素を直接操作するのではなく、JavaScriptのオブジェクトとして
UI構造を表現したもの。

```javascript
// あなたが書くJSX
<View>
  <Text>Hello</Text>
</View>

// 内部的にはこういうオブジェクトに変換される
{
  type: View,
  props: {},
  children: [
    {
      type: Text,
      props: {},
      children: ['Hello']
    }
  ]
}
```

### 差分検出（Reconciliation）

状態が変わったとき、Reactは：

1. **新しい仮想DOMツリーを作る**
2. **前回の仮想DOMと比較する**
3. **変更があった部分だけを特定する**
4. **その部分だけを実際のUIに反映する**

これにより、効率的な更新が可能になります。

### Hooksの役割

```jsx
const [count, setCount] = useState(0);  // 状態
useEffect(() => { ... }, [count]);       // 副作用
```

Hooksは、関数コンポーネントで状態やライフサイクルを扱う仕組み。
これもWebとネイティブで**全く同じAPI**です。

---

## Layer 3: React Native（ブリッジ）

ここが最も重要で、最も理解しにくい部分です。

### 🌉 ブリッジ（Bridge）とは

JavaScriptとネイティブコード（Swift/Kotlin）は、
**別々のスレッドで動いている**異なる世界です。

```
┌──────────────────┐         ┌──────────────────┐
│  JavaScript側    │         │  ネイティブ側     │
│  ━━━━━━━━━━━━━  │         │  ━━━━━━━━━━━━━  │
│                  │         │                  │
│  あなたのコード   │         │  iOS: Swift      │
│  React Core      │         │  Android: Kotlin │
│  ライブラリ       │◄───────►│  ネイティブUI     │
│                  │  Bridge │  システムAPI      │
│  (JSスレッド)     │         │  (UIスレッド)     │
└──────────────────┘         └──────────────────┘
```

この2つの世界を繋ぐのが**ブリッジ**です。

### ブリッジでやり取りされるメッセージ

#### 例1: ボタンを表示する

```jsx
<Button title="押して" onPress={handlePress} />
```

**JavaScript → Native へのメッセージ:**
```json
{
  "type": "createView",
  "viewId": 123,
  "viewType": "RCTButton",
  "props": {
    "title": "押して",
    "onPress": true
  }
}
```

**Native側の動作:**
```swift
// iOS (Swift)
let button = UIButton(type: .system)
button.setTitle("押して", for: .normal)
button.addTarget(self, action: #selector(handleTap), for: .touchUpInside)
view.addSubview(button)
```

#### 例2: ボタンがタップされた

**Native → JavaScript へのメッセージ:**
```json
{
  "type": "event",
  "viewId": 123,
  "eventType": "press"
}
```

**JavaScript側の動作:**
```javascript
// onPress ハンドラーが呼ばれる
handlePress()
```

### 新しいアーキテクチャ: JSI (JavaScript Interface)

従来のブリッジは**JSON文字列**でやり取りしていたため、遅かったです。

**新アーキテクチャ（JSI）** では：
- JavaScript から直接ネイティブの関数を呼べる
- 同期的な通信も可能
- より高速

```javascript
// 従来: 非同期でメッセージ送信
NativeModules.Camera.takePicture().then(...)

// JSI: 直接呼び出し
const result = global.camera.takePicture()
```

Expoも徐々にJSIに移行中です（2024年現在）。

---

## Layer 4: Expo SDK

### Expo SDK = ネイティブ機能の使いやすいラッパー

React Nativeは基本的なUIコンポーネントしか提供しません。
カメラ、位置情報、Bluetoothなどは**含まれていません**。

それらを使いやすくパッケージ化したのが**Expo SDK**です。

### 例: カメラ機能の実装レイヤー

```
あなたのコード:
  import { Camera } from 'expo-camera';
  <Camera ref={cameraRef} />
  ↓
Expo SDK (expo-camera):
  JavaScript API を提供
  権限チェック、設定の簡素化
  ↓
Expo Native Module (Swift/Kotlin):
  ネイティブカメラAPIのラッパー
  ↓
iOS: AVFoundation
  AVCaptureSession, AVCaptureDevice...
  実際のカメラハードウェアにアクセス

Android: Camera2 API
  CameraManager, CameraDevice...
  実際のカメラハードウェアにアクセス
```

### Expo SDK の構成

Expo SDKは50個以上のモジュールから構成されています：

| カテゴリ | 主なモジュール |
|---------|---------------|
| **メディア** | expo-camera, expo-image-picker, expo-av |
| **位置情報** | expo-location |
| **センサー** | expo-sensors (加速度計、ジャイロ、歩数計) |
| **通信** | expo-notifications, expo-sharing |
| **Bluetooth** | expo-bluetooth |
| **ストレージ** | expo-file-system, expo-sqlite |
| **認証** | expo-local-authentication (指紋、Face ID) |
| **その他** | expo-haptics (バイブレーション), expo-battery |

### なぜExpoを使うと楽なのか？

#### ネイティブコードなしで実装できる

**React Nativeだけの場合:**
```
1. npm install react-native-camera
2. iOS: Podfileを編集、pod install
3. AndroidManifest.xml に権限を追加
4. Info.plist に権限説明を追加
5. ネイティブコードのビルド設定を調整
6. Xcodeでビルドエラーを解決...
```

**Expoの場合:**
```
1. npx expo install expo-camera
2. コード書く
3. おわり
```

#### クロスプラットフォーム対応が自動

```javascript
import * as Location from 'expo-location';

// iOS でも Android でも同じコード
const location = await Location.getCurrentPositionAsync();
```

内部的には：
- **iOS**: Core Locationの `CLLocationManager`
- **Android**: Google Play ServicesのFused Location Provider

を使い分けていますが、あなたは意識する必要がありません。

---

## Layer 5: ネイティブプラットフォーム

### iOS と Android の違い

同じ機能でも、OS レベルでは全く違うAPIです。

#### 例: 位置情報取得

**iOS (Swift):**
```swift
import CoreLocation

let locationManager = CLLocationManager()
locationManager.requestWhenInUseAuthorization()
locationManager.startUpdatingLocation()

func locationManager(_ manager: CLLocationManager,
                     didUpdateLocations locations: [CLLocation]) {
    let location = locations.last!
    // latitude: location.coordinate.latitude
}
```

**Android (Kotlin):**
```kotlin
import com.google.android.gms.location.*

val fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
fusedLocationClient.lastLocation.addOnSuccessListener { location ->
    // latitude: location.latitude
}
```

**Expo (JavaScript):**
```javascript
import * as Location from 'expo-location';

const location = await Location.getCurrentPositionAsync();
// latitude: location.coords.latitude
```

### ネイティブUIコンポーネント

React Nativeのコンポーネントは、最終的にネイティブのUIコンポーネントに変換されます。

```jsx
<ScrollView>
  <View style={{ width: 100, height: 100, backgroundColor: 'red' }}>
    <Text>Hello</Text>
  </View>
</ScrollView>
```

**iOS では:**
```
UIScrollView
  └─ UIView (width: 100, height: 100, backgroundColor: red)
       └─ UILabel (text: "Hello")
```

**Android では:**
```
ScrollView
  └─ FrameLayout (width: 100, height: 100, backgroundColor: red)
       └─ TextView (text: "Hello")
```

### パフォーマンス特性

ネイティブUIを使っているので：

✅ **速い:**
- スクロール、アニメーション
- タッチ応答
- 60fps の滑らかな動き

⚠️ **ブリッジのオーバーヘッド:**
- JavaScript ↔ Native の通信には若干の遅延
- 大量のデータ転送は避けるべき

---

## 他の技術との比較

### React Native vs React Web

| 項目 | React Web | React Native |
|------|-----------|--------------|
| **実行環境** | ブラウザ (Chrome, Safari...) | ネイティブアプリ |
| **レンダリング** | HTML/CSS → DOM | ネイティブUI (UIView/View) |
| **パフォーマンス** | ブラウザ依存 | ネイティブに近い |
| **API** | Web API (fetch, localStorage...) | ネイティブAPI (カメラ、GPS...) |
| **配布** | URL | App Store / Google Play |
| **更新** | 即座 | アプリ更新が必要 (※OTA可能) |

### React Native vs Flutter

| 項目 | React Native | Flutter |
|------|--------------|---------|
| **言語** | JavaScript/TypeScript | Dart |
| **UI** | ネイティブコンポーネント | 独自レンダリングエンジン |
| **見た目** | プラットフォームネイティブ | どちらも同じ (Material/Cupertino) |
| **ブリッジ** | JavaScript ↔ Native | Dart ↔ Native (より高速) |
| **学習コスト** | React経験者は低い | Dart から学ぶ必要 |
| **エコシステム** | npm (巨大) | pub.dev (成長中) |
| **ホットリロード** | あり | あり |

### React Native vs ネイティブ開発 (Swift/Kotlin)

| 項目 | React Native | ネイティブ |
|------|--------------|-----------|
| **コード共有** | iOS/Android で共通 | それぞれ別 |
| **開発速度** | 速い | 遅い (2つのアプリを作る) |
| **パフォーマンス** | ほぼネイティブ並み | 最高 |
| **ネイティブ機能** | 一部制限あり | すべて使える |
| **チーム** | 1チーム | iOS/Androidチーム |
| **学習コスト** | JavaScript | Swift + Kotlin |

### いつReact Nativeを選ぶべきか？

**React Nativeが向いている:**
- iOS/Android両方リリースしたい
- 開発スピード重視
- Reactエンジニアが既にいる
- MVPを素早く作りたい
- OTA (Over The Air) アップデートしたい

**ネイティブが向いている:**
- 超高パフォーマンスが必要（ゲーム、AR/VR）
- プラットフォーム固有の最新APIを即座に使いたい
- 既存のネイティブアプリがある

**Flutter が向いている:**
- デザインを完全にコントロールしたい
- iOSとAndroidで全く同じ見た目にしたい
- Googleのエコシステムを好む

---

## よくある誤解

### ❌ 「React NativeはWebViewでHTMLを表示している」

**これは間違いです！**

React Nativeは**ネイティブUIコンポーネント**を使います。
WebView (Cordova/Ionic) とは全く違います。

```
┌─────────────────────────────────────┐
│  WebView系 (Cordova, Ionic)         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  HTML/CSS → WebView → 表示         │
│  (ブラウザの中でアプリが動く)         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  React Native                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  JSX → ネイティブUI → 表示          │
│  (本物のネイティブアプリ)             │
└─────────────────────────────────────┘
```

### ❌ 「ExpoはReact Nativeの簡易版」

**これも誤解です！**

Expoは：
- React Nativeの**上に構築された**開発環境
- 機能は**むしろ多い**（50個以上のネイティブモジュール）
- 制約があるのは「カスタムネイティブコード」を書けないこと
  - ただし Expo Modules API で書ける（2024年現在）

### ❌ 「React Nativeは遅い」

**現代のReact Nativeは速いです！**

- UIスレッドはネイティブで動く
- 新アーキテクチャ (JSI) でさらに高速化
- Instagram, Facebook, Shopify などが本番利用

遅くなるケース:
- ブリッジで大量のデータ転送
- 非効率な再レンダリング
- メモリリーク

→ これらは設計の問題であり、React Native 自体の問題ではありません。

### ❌ 「Expoだとネイティブコードが書けない」

**昔は正しかったですが、今は違います！**

- **Expo Modules API** でカスタムネイティブモジュールを書ける
- **Config Plugins** でネイティブ設定をカスタマイズ可能
- **Prebuild** で完全なネイティブプロジェクトを生成可能

```bash
npx expo prebuild
# → ios/ と android/ フォルダが生成される
# → Xcodeで開いてネイティブコード編集可能
```

---

## 🎓 まとめ: 5つのレイヤーを理解する

```
Layer 1: JSX
   ↓ React の仮想DOM
Layer 2: React Core
   ↓ プラットフォーム別レンダラー
Layer 3: React Native (Bridge/JSI)
   ↓ ネイティブモジュール
Layer 4: Expo SDK
   ↓ プラットフォームAPI
Layer 5: iOS / Android
```

この構造を理解していれば：

✅ エラーメッセージが読める
- 「JavaScript側の問題」vs「ネイティブ側の問題」が分かる

✅ パフォーマンス問題を解決できる
- どのレイヤーがボトルネックかを特定できる

✅ 新しいライブラリを評価できる
- どのレイヤーで動くのか理解できる

✅ 実装方法を選択できる
- 「これはJSで書ける」vs「ネイティブモジュールが必要」が判断できる

---

次は **Step 0: 開発環境のセットアップ** で実際に手を動かしていきましょう！

