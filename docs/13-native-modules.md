# Expo で iOS/Android ネイティブコードを統合する完全ガイド

## 📋 目次

1. [Expo Go vs Development Builds](#1-expo-go-vs-development-builds)
2. [Expo Modules API でネイティブコードを書く](#2-expo-modules-api-でネイティブコードを書く)
3. [Config Plugins でネイティブ設定を変更](#3-config-plugins-でネイティブ設定を変更)
4. [Prebuild でネイティブプロジェクトを生成](#4-prebuild-でネイティブプロジェクトを生成)
5. [既存のネイティブライブラリを追加](#5-既存のネイティブライブラリを追加)
6. [実践: カスタムネイティブモジュールの作成](#6-実践-カスタムネイティブモジュールの作成)
7. [2024-2025年のトレンドアーキテクチャ](#7-2024-2025年のトレンドアーキテクチャ)

---

## 1. Expo Go vs Development Builds

### Expo Go の制限

**Expo Go** は便利な開発ツールですが、以下の制限があります：

```
❌ カスタムネイティブコード（Swift/Kotlin）を追加できない
❌ Expo SDK に含まれないネイティブライブラリを使えない
❌ AndroidManifest.xml や Info.plist を直接編集できない
❌ 特殊な権限やバックグラウンド処理の設定ができない
```

**使えるもの:**
- Expo SDK に含まれる公式ライブラリ（Camera、Location、Notifications等）
- 純粋な JavaScript ライブラリ
- React Navigation、Redux など

### Development Build（カスタムクライアント）

**Development Build** を使うと、ネイティブコードを含むカスタムアプリをビルドできます：

```
✅ カスタムネイティブモジュール（Swift/Kotlin）を追加可能
✅ 任意のネイティブライブラリをインストール可能
✅ ネイティブ設定ファイルを完全にカントロール
✅ Fast Refresh と Hot Reload が使える（Expo Go と同じ開発体験）
```

### 切り替えのタイミング

| 状況 | 推奨 |
|------|------|
| プロトタイプ作成中 | Expo Go |
| Expo SDK のライブラリのみ使用 | Expo Go |
| カスタムネイティブコードが必要 | Development Build |
| 特殊な権限設定が必要 | Development Build |
| App Store/Google Play にリリース | Development Build (EAS Build) |

---

## 2. Expo Modules API でネイティブコードを書く

### Expo Modules API とは？

**Expo Modules API** は、Swift（iOS）と Kotlin（Android）でネイティブモジュールを書くための**モダンな API** です。

#### 従来の React Native Native Modules との比較

| | 従来の方法 | Expo Modules API |
|---|------------|------------------|
| iOS 言語 | Objective-C | **Swift** ✨ |
| Android 言語 | Java | **Kotlin** ✨ |
| 型安全性 | ❌ 手動で型変換 | ✅ 自動型変換 |
| Promise サポート | ❌ 手動実装 | ✅ 自動サポート |
| コード量 | 多い | **少ない** |
| 学習曲線 | 急 | **緩やか** |

### アーキテクチャ図

```
┌─────────────────────────────────────────────────┐
│  JavaScript/TypeScript (React Native)          │
│  ↓ import { myFunction } from 'my-module'      │
├─────────────────────────────────────────────────┤
│  Expo Modules API (Bridge)                     │
│  - 自動型変換                                    │
│  - Promise/async サポート                        │
│  - イベントエミッター                             │
├──────────────────┬──────────────────────────────┤
│  iOS (Swift)     │  Android (Kotlin)            │
│  - UIKit         │  - Android SDK               │
│  - Core Location │  - androidx.* libraries      │
│  - AVFoundation  │  - Jetpack Compose           │
└──────────────────┴──────────────────────────────┘
```

### 基本的な使い方

#### ステップ 1: ローカルモジュールを作成

```bash
# プロジェクトルートで実行
npx create-expo-module my-native-module

# または、monorepo 構成の場合
cd modules
npx create-expo-module my-native-module
```

生成されるディレクトリ構造:

```
my-native-module/
├── android/              # Android ネイティブコード（Kotlin）
│   └── src/main/java/expo/modules/mynativemodule/
│       └── MyNativeModuleModule.kt
├── ios/                  # iOS ネイティブコード（Swift）
│   └── MyNativeModuleModule.swift
├── src/                  # TypeScript インターフェース
│   └── index.ts
└── expo-module.config.json
```

#### ステップ 2: Swift でネイティブコードを書く (iOS)

**ios/MyNativeModuleModule.swift:**

```swift
import ExpoModulesCore

// Expo Modules API を使ってモジュールを定義
public class MyNativeModuleModule: Module {
  // モジュールの定義
  public func definition() -> ModuleDefinition {
    // モジュール名
    Name("MyNativeModule")

    // 同期関数: 文字列を返す
    Function("hello") { (name: String) -> String in
      return "Hello, \(name)!"
    }

    // 非同期関数: Promise を返す
    AsyncFunction("fetchData") { (url: String, promise: Promise) in
      // バックグラウンドスレッドで実行
      DispatchQueue.global().async {
        // ネイティブ API を呼び出す
        guard let url = URL(string: url) else {
          promise.reject("INVALID_URL", "Invalid URL provided")
          return
        }

        let task = URLSession.shared.dataTask(with: url) { data, response, error in
          if let error = error {
            promise.reject("FETCH_ERROR", error.localizedDescription)
            return
          }

          guard let data = data else {
            promise.reject("NO_DATA", "No data received")
            return
          }

          // JSON として返す
          if let json = try? JSONSerialization.jsonObject(with: data) {
            promise.resolve(json)
          } else {
            promise.reject("PARSE_ERROR", "Failed to parse JSON")
          }
        }
        task.resume()
      }
    }

    // iOS のネイティブ API を呼び出す例: バイブレーション
    Function("vibrate") {
      import AudioToolbox
      AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
    }

    // デバイス情報を取得
    Function("getDeviceInfo") { () -> [String: Any] in
      return [
        "model": UIDevice.current.model,
        "systemVersion": UIDevice.current.systemVersion,
        "name": UIDevice.current.name
      ]
    }

    // イベントエミッター（リアルタイム通知）
    Events("onDataReceived")

    // 定期的にイベントを発行する例
    Function("startMonitoring") {
      Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { timer in
        self.sendEvent("onDataReceived", [
          "timestamp": Date().timeIntervalSince1970,
          "value": Int.random(in: 0...100)
        ])
      }
    }
  }
}
```

#### ステップ 3: Kotlin でネイティブコードを書く (Android)

**android/src/main/java/expo/modules/mynativemodule/MyNativeModuleModule.kt:**

```kotlin
package expo.modules.mynativemodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.URL

class MyNativeModuleModule : Module() {
  // モジュールの定義
  override fun definition() = ModuleDefinition {
    // モジュール名
    Name("MyNativeModule")

    // 同期関数: 文字列を返す
    Function("hello") { name: String ->
      "Hello, $name!"
    }

    // 非同期関数: Coroutines を使用
    AsyncFunction("fetchData") { url: String ->
      withContext(Dispatchers.IO) {
        try {
          val connection = URL(url).openConnection()
          val response = connection.getInputStream().bufferedReader().use { it.readText() }
          response
        } catch (e: Exception) {
          throw Exception("Failed to fetch data: ${e.message}")
        }
      }
    }

    // Android のネイティブ API を呼び出す例: バイブレーション
    Function("vibrate") {
      val vibrator = appContext.reactContext?.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
      vibrator?.let {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          it.vibrate(VibrationEffect.createOneShot(200, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
          @Suppress("DEPRECATION")
          it.vibrate(200)
        }
      }
    }

    // デバイス情報を取得
    Function("getDeviceInfo") {
      mapOf(
        "model" to Build.MODEL,
        "manufacturer" to Build.MANUFACTURER,
        "androidVersion" to Build.VERSION.RELEASE,
        "sdkInt" to Build.VERSION.SDK_INT
      )
    }

    // イベントエミッター
    Events("onDataReceived")

    // 定期的にイベントを発行する例
    Function("startMonitoring") {
      // 実装例: WorkManager や Handler を使用
      // ここでは簡略化
    }
  }
}
```

#### ステップ 4: TypeScript インターフェースを作成

**src/index.ts:**

```typescript
import { NativeModulesProxy, EventEmitter } from 'expo-modules-core';

// TypeScript 型定義
const MyNativeModule = NativeModulesProxy.MyNativeModule;

export function hello(name: string): string {
  return MyNativeModule.hello(name);
}

export async function fetchData(url: string): Promise<any> {
  return await MyNativeModule.fetchData(url);
}

export function vibrate(): void {
  MyNativeModule.vibrate();
}

export interface DeviceInfo {
  model: string;
  systemVersion?: string;
  androidVersion?: string;
  name?: string;
  manufacturer?: string;
  sdkInt?: number;
}

export function getDeviceInfo(): DeviceInfo {
  return MyNativeModule.getDeviceInfo();
}

// イベントリスナー
const emitter = new EventEmitter(MyNativeModule);

export function addDataListener(listener: (event: any) => void) {
  return emitter.addListener('onDataReceived', listener);
}

export function startMonitoring(): void {
  MyNativeModule.startMonitoring();
}
```

#### ステップ 5: モジュールをプロジェクトに追加

**package.json に追加:**

```json
{
  "dependencies": {
    "my-native-module": "file:./modules/my-native-module"
  }
}
```

```bash
npm install
npx expo prebuild --clean
npx expo run:ios  # または run:android
```

#### ステップ 6: React Native から使う

**App.tsx:**

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import * as MyNativeModule from 'my-native-module';

export default function App() {
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    // デバイス情報を取得
    const info = MyNativeModule.getDeviceInfo();
    setDeviceInfo(info);

    // イベントリスナーを登録
    const subscription = MyNativeModule.addDataListener((event) => {
      console.log('Received data:', event);
    });

    return () => subscription.remove();
  }, []);

  const handleFetch = async () => {
    try {
      const data = await MyNativeModule.fetchData('https://api.example.com/data');
      console.log('Fetched:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View>
      <Text>{MyNativeModule.hello('World')}</Text>
      <Text>{JSON.stringify(deviceInfo, null, 2)}</Text>
      <Button title="Vibrate" onPress={() => MyNativeModule.vibrate()} />
      <Button title="Fetch Data" onPress={handleFetch} />
    </View>
  );
}
```

---

## 3. Config Plugins でネイティブ設定を変更

### Config Plugins とは？

**Config Plugins** は、`app.json` や `app.config.js` からネイティブプロジェクト（`AndroidManifest.xml`、`Info.plist` など）を自動的に変更する仕組みです。

#### 従来の方法との比較

| | 従来（Bare workflow） | Config Plugins |
|---|----------------------|----------------|
| 設定ファイル | 直接編集 | app.json で管理 |
| バージョン管理 | ネイティブファイルを Git に含める | **app.json のみ** |
| チーム開発 | コンフリクトしやすい | **シンプル** |
| Expo Go | 使えない | **prebuild すれば使える** |

### 使用例 1: カスタム権限を追加

**app.json:**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "$(PRODUCT_NAME) needs access to your Camera for scanning QR codes."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "$(PRODUCT_NAME) uses your location to show nearby stores."
        }
      ]
    ]
  }
}
```

これにより、以下が自動的に追加されます：

**iOS (`Info.plist`):**
```xml
<key>NSCameraUsageDescription</key>
<string>$(PRODUCT_NAME) needs access to your Camera for scanning QR codes.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>$(PRODUCT_NAME) uses your location to show nearby stores.</string>
```

**Android (`AndroidManifest.xml`):**
```xml
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

### 使用例 2: カスタム Config Plugin を作成

複雑な設定変更が必要な場合は、独自の Config Plugin を作成できます。

**app.config.js:**

```javascript
module.exports = {
  expo: {
    plugins: [
      // カスタム Config Plugin
      [
        './plugins/withCustomConfig.js',
        {
          apiKey: 'YOUR_API_KEY',
          enableFeature: true
        }
      ]
    ]
  }
};
```

**plugins/withCustomConfig.js:**

```javascript
const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

module.exports = function withCustomConfig(config, { apiKey, enableFeature }) {
  // Android の設定を変更
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // <meta-data> を追加
    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    mainApplication['meta-data'].push({
      $: {
        'android:name': 'com.example.API_KEY',
        'android:value': apiKey
      }
    });

    return config;
  });

  // iOS の設定を変更
  config = withInfoPlist(config, (config) => {
    config.modResults.APIKey = apiKey;
    config.modResults.FeatureEnabled = enableFeature;
    return config;
  });

  return config;
};
```

### よく使う Config Plugin の例

#### 1. **App Icon と Splash Screen を動的に変更**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "13.0"
          },
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "minSdkVersion": 23
          }
        }
      ]
    ]
  }
}
```

#### 2. **Firebase を設定**

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics"
    ]
  }
}
```

---

## 4. Prebuild でネイティブプロジェクトを生成

### Prebuild とは？

**Prebuild** は、`app.json` の設定を元に `ios/` と `android/` ディレクトリを自動生成するコマンドです。

```bash
npx expo prebuild
```

#### 生成される内容

```
your-project/
├── ios/                     # Xcode プロジェクト（自動生成）
│   ├── Podfile
│   ├── YourApp.xcworkspace
│   └── YourApp/
│       ├── Info.plist       # app.json から生成
│       └── ...
├── android/                 # Android Studio プロジェクト（自動生成）
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml  # app.json から生成
│   │       └── java/
│   └── build.gradle
├── app.json                 # 設定の元となるファイル
└── package.json
```

### Prebuild のオプション

```bash
# 既存のネイティブプロジェクトを削除して再生成
npx expo prebuild --clean

# iOS のみ
npx expo prebuild --platform ios

# Android のみ
npx expo prebuild --platform android
```

### いつ Prebuild を実行するか？

| 状況 | Prebuild が必要か？ |
|------|---------------------|
| `app.json` を変更した | ✅ Yes |
| 新しいネイティブライブラリを追加した | ✅ Yes |
| Config Plugin を追加した | ✅ Yes |
| JavaScript コードのみ変更 | ❌ No |

### Git で管理するべきか？

**推奨: `.gitignore` に追加**

```gitignore
# Expo
ios/
android/
```

**理由:**
- `ios/` と `android/` は `app.json` から自動生成できる
- チーム開発でコンフリクトが起きにくい
- CI/CD で毎回生成すれば、常にクリーンな状態

**例外的に Git で管理する場合:**
- ネイティブコードを直接編集する必要がある場合
- 複雑なカスタマイズが必要な場合

---

## 5. 既存のネイティブライブラリを追加

### React Native ライブラリのインストール

多くの人気ライブラリは Expo と互換性があります。

#### 例: React Native Maps を追加

```bash
npx expo install react-native-maps
```

**app.json に Config Plugin を追加:**

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      ]
    ]
  }
}
```

```bash
npx expo prebuild --clean
npx expo run:ios  # または run:android
```

#### 互換性の確認方法

1. **Expo 公式ドキュメントで確認**
   - https://docs.expo.dev/versions/latest/

2. **React Native Directory で確認**
   - https://reactnative.directory/
   - "✅ Expo Go" マークがあれば Expo Go で使える

3. **パッケージの README を読む**
   - "Expo compatible" や "Config Plugin available" と記載があれば使える

### よく使うネイティブライブラリ

| ライブラリ | 用途 | Expo Go | Config Plugin |
|-----------|------|---------|---------------|
| react-native-maps | 地図表示 | ❌ | ✅ |
| react-native-firebase | Firebase | ❌ | ✅ |
| react-native-iap | アプリ内課金 | ❌ | ✅ |
| react-native-svg | SVG 描画 | ✅ | - |
| react-native-reanimated | アニメーション | ✅ | - |
| @react-native-community/netinfo | ネットワーク状態 | ✅ | - |

---

## 6. 実践: カスタムネイティブモジュールの作成

### 実例 1: iOS の Face ID を使う

**Swift (ios/FaceIDModule.swift):**

```swift
import ExpoModulesCore
import LocalAuthentication

public class FaceIDModule: Module {
  public func definition() -> ModuleDefinition {
    Name("FaceID")

    AsyncFunction("authenticate") { (reason: String, promise: Promise) in
      let context = LAContext()
      var error: NSError?

      // Face ID / Touch ID が使えるか確認
      guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
        promise.reject("NOT_AVAILABLE", "Biometric authentication is not available")
        return
      }

      // 認証を実行
      context.evaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        localizedReason: reason
      ) { success, error in
        if success {
          promise.resolve(["success": true])
        } else {
          promise.reject("AUTH_FAILED", error?.localizedDescription ?? "Authentication failed")
        }
      }
    }

    Function("getBiometryType") { () -> String in
      let context = LAContext()
      _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)

      switch context.biometryType {
      case .faceID:
        return "FaceID"
      case .touchID:
        return "TouchID"
      case .none:
        return "None"
      @unknown default:
        return "Unknown"
      }
    }
  }
}
```

**TypeScript (src/index.ts):**

```typescript
import { NativeModulesProxy } from 'expo-modules-core';

const FaceID = NativeModulesProxy.FaceID;

export async function authenticate(reason: string): Promise<{ success: boolean }> {
  return await FaceID.authenticate(reason);
}

export function getBiometryType(): 'FaceID' | 'TouchID' | 'None' | 'Unknown' {
  return FaceID.getBiometryType();
}
```

**使用例:**

```typescript
import * as FaceID from 'my-faceid-module';

const handleAuth = async () => {
  try {
    const biometryType = FaceID.getBiometryType();
    console.log('Available:', biometryType);

    const result = await FaceID.authenticate('ログインするために認証してください');
    if (result.success) {
      console.log('認証成功！');
    }
  } catch (error) {
    console.error('認証失敗:', error);
  }
};
```

### 実例 2: Android の Bluetooth Low Energy (BLE) を使う

**Kotlin (android/.../BLEModule.kt):**

```kotlin
package expo.modules.ble

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context

class BLEModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("BLE")

    Function("isBluetoothEnabled") {
      val bluetoothManager = appContext.reactContext?.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
      val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter
      bluetoothAdapter?.isEnabled ?: false
    }

    AsyncFunction("scanDevices") { timeout: Int ->
      // BLE スキャンの実装
      // 実際の実装では BluetoothLeScanner を使用
      withContext(Dispatchers.IO) {
        delay(timeout.toLong())
        listOf(
          mapOf("name" to "Device 1", "address" to "AA:BB:CC:DD:EE:FF"),
          mapOf("name" to "Device 2", "address" to "11:22:33:44:55:66")
        )
      }
    }
  }
}
```

---

## 7. 2024-2025年のトレンドアーキテクチャ

### 🔥 React Native New Architecture

React Native は **New Architecture** に移行中です。

#### 主な変更点

| 従来 | New Architecture |
|------|------------------|
| Bridge (JSON シリアライズ) | **JSI (JavaScript Interface)** |
| 非同期のみ | **同期呼び出しも可能** |
| UIManager | **Fabric (新レンダラー)** |
| Native Modules | **Turbo Modules** |

#### アーキテクチャ図

**従来の Bridge:**

```
┌──────────────┐         ┌──────────────┐
│  JavaScript  │◄───────►│    Bridge    │
│   Thread     │  JSON   │ (Serializer) │
└──────────────┘         └──────────────┘
                                ▲
                                │ JSON
                                ▼
                         ┌──────────────┐
                         │   Native     │
                         │   Thread     │
                         └──────────────┘
```

**New Architecture (JSI):**

```
┌──────────────┐         ┌──────────────┐
│  JavaScript  │◄───────►│     JSI      │
│   Thread     │ Direct  │  (C++ Host)  │
└──────────────┘         └──────────────┘
                                ▲
                                │ Direct
                                ▼
                         ┌──────────────┐
                         │   Native     │
                         │   Thread     │
                         └──────────────┘
```

#### メリット

1. **パフォーマンス向上**: JSON シリアライズのオーバーヘッドがない
2. **同期呼び出し**: JavaScript から直接ネイティブ関数を同期的に呼べる
3. **型安全性**: C++ で型が保証される
4. **レンダリングの高速化**: Fabric により React の優先度付きレンダリングが可能

#### Expo での有効化方法

**app.json:**

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": true
          },
          "android": {
            "newArchEnabled": true
          }
        }
      ]
    ]
  }
}
```

```bash
npx expo prebuild --clean
npx expo run:ios
```

### 🚀 Expo Router (File-based Routing)

**Expo Router** は Next.js や Remix のような **ファイルベースルーティング** を React Native にもたらします。

#### 従来の React Navigation との比較

**従来の React Navigation:**

```typescript
// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Expo Router (ファイルベース):**

```
app/
├── (tabs)/
│   ├── index.tsx          → / (Home)
│   ├── profile.tsx        → /profile
│   └── settings.tsx       → /settings
├── user/
│   └── [id].tsx           → /user/:id (Dynamic route)
└── _layout.tsx            → Root layout
```

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

#### メリット

1. **直感的**: ファイル構造がそのまま URL になる
2. **Deep Linking が簡単**: 自動的に Deep Link が生成される
3. **SEO フレンドリー**: Web でも同じコードが動く
4. **型安全**: TypeScript でルートが型推論される

#### インストール

```bash
npx create-expo-app@latest --template tabs
```

### 📦 Monorepo 構成

複数のアプリやパッケージを1つのリポジトリで管理する **Monorepo** が人気です。

#### ツール

| ツール | 特徴 | 人気度 |
|--------|------|--------|
| **Turborepo** | 高速ビルドキャッシュ | ⭐⭐⭐⭐⭐ |
| **Nx** | 強力な開発ツール統合 | ⭐⭐⭐⭐ |
| **Yarn Workspaces** | シンプル | ⭐⭐⭐ |

#### Turborepo の構成例

```
my-monorepo/
├── apps/
│   ├── mobile/              # Expo アプリ
│   │   ├── app.json
│   │   └── App.tsx
│   └── web/                 # Next.js アプリ
│       ├── next.config.js
│       └── pages/
├── packages/
│   ├── ui/                  # 共通 UI コンポーネント
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   ├── api-client/          # API クライアント
│   │   └── index.ts
│   └── config/              # 共通設定
│       └── eslint-config/
├── turbo.json
└── package.json
```

**turbo.json:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false
    },
    "lint": {
      "outputs": []
    }
  }
}
```

**メリット:**
- コードを複数のアプリで再利用
- 一括でビルド・テスト
- 型安全性を保ったまま共有

### 🎨 状態管理のトレンド

| ライブラリ | 特徴 | 学習曲線 | 人気度 |
|-----------|------|----------|--------|
| **Zustand** | シンプル、ボイラープレート少ない | 低 | ⭐⭐⭐⭐⭐ |
| **Jotai** | Atomic state management | 中 | ⭐⭐⭐⭐ |
| **Redux Toolkit** | 公式推奨の Redux 実装 | 中 | ⭐⭐⭐⭐ |
| **Recoil** | Facebook 製、React らしい API | 中 | ⭐⭐⭐ |
| **MobX** | リアクティブプログラミング | 高 | ⭐⭐⭐ |

#### Zustand の例（最も人気）

```typescript
import { create } from 'zustand';

interface UserStore {
  user: { name: string; email: string } | null;
  login: (name: string, email: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  login: (name, email) => set({ user: { name, email } }),
  logout: () => set({ user: null }),
}));

// 使用例
function Profile() {
  const { user, logout } = useUserStore();

  return (
    <View>
      <Text>{user?.name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

### 🔐 型安全性のトレンド

#### 1. **Zod でランタイムバリデーション**

```typescript
import { z } from 'zod';

// スキーマ定義
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0).max(120),
});

// 型を抽出
type User = z.infer<typeof UserSchema>;

// API レスポンスを検証
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();

  // ランタイムで型をチェック
  return UserSchema.parse(data);  // 型が合わなければエラー
}
```

#### 2. **tRPC で型安全な API 呼び出し**

```typescript
// Backend (Node.js)
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const appRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return { id: input.id, name: 'John', email: 'john@example.com' };
    }),
});

export type AppRouter = typeof appRouter;

// Frontend (React Native)
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './server';

const trpc = createTRPCReact<AppRouter>();

function UserProfile({ userId }: { userId: string }) {
  // 型安全な API 呼び出し（自動補完される）
  const { data, isLoading } = trpc.getUser.useQuery({ id: userId });

  if (isLoading) return <Text>Loading...</Text>;

  return <Text>{data.name}</Text>;  // data の型が自動的に推論される
}
```

### 🧪 テストのトレンド

| ツール | 用途 | 人気度 |
|--------|------|--------|
| **Jest** | ユニットテスト | ⭐⭐⭐⭐⭐ |
| **React Native Testing Library** | コンポーネントテスト | ⭐⭐⭐⭐⭐ |
| **Detox** | E2E テスト (iOS/Android) | ⭐⭐⭐⭐ |
| **Maestro** | E2E テスト (モバイル特化) | ⭐⭐⭐⭐ |

#### Maestro の例（最新の E2E ツール）

```yaml
# flows/login.yaml
appId: com.example.app
---
- launchApp
- tapOn: "Login"
- inputText: "john@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Sign In"
- assertVisible: "Welcome, John!"
```

```bash
maestro test flows/login.yaml
```

### 📊 推奨される構成（2025年版）

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "^3.0.0",        // ファイルベースルーティング
    "zustand": "^4.5.0",             // 状態管理
    "zod": "^3.22.0",                // バリデーション
    "@tanstack/react-query": "^5.0.0",  // データフェッチング
    "react-native-reanimated": "^3.6.0", // アニメーション
    "react-native-gesture-handler": "^2.14.0"  // ジェスチャー
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.0"
  }
}
```

---

## 📚 まとめ

### Swift/Kotlin を書く必要があるか？

| シナリオ | Swift/Kotlin 必要？ |
|---------|---------------------|
| Expo SDK の機能のみ使用 | ❌ 不要 |
| React Native ライブラリを追加 | ❌ 不要（Config Plugin があれば） |
| 独自のネイティブ機能が必要 | ✅ 必要 |
| 既存のネイティブライブラリがない機能 | ✅ 必要 |
| パフォーマンスクリティカルな処理 | ✅ 必要（場合による） |

### 学習の優先順位

1. **まずは JavaScript/TypeScript のみで開発** (Expo Go)
2. **Config Plugins でネイティブ設定を変更** (Development Builds)
3. **必要になったら Swift/Kotlin を学ぶ** (カスタムネイティブモジュール)

### 次のステップ

- [Expo Modules API 公式ドキュメント](https://docs.expo.dev/modules/overview/)
- [Config Plugins 公式ドキュメント](https://docs.expo.dev/config-plugins/introduction/)
- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Expo Router 公式ドキュメント](https://docs.expo.dev/router/introduction/)

---

**Happy Native Coding! 🚀**
