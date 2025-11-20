# Step 8: カメラ機能（expo-camera）

## 🎯 このステップのゴール

- expo-camera を使って写真撮影機能を実装
- 権限管理の仕組みを理解
- カメラプレビューの表示
- 撮影した写真の保存
- **技術解説**: JavaScriptからネイティブカメラAPIへのアクセス

所要時間: 1.5時間

---

## 📦 ライブラリのインストール

```bash
npx expo install expo-camera
```

**このコマンドで何がインストールされるか:**
- `expo-camera` (JavaScriptパッケージ)
- ネイティブ依存関係（iOS/Android）

---

## 🔬 技術解説: カメラ機能のレイヤー構造

### 全体像

```
┌───────────────────────────────────────────────────┐
│  Layer 1: あなたのコード                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  import { Camera } from 'expo-camera';            │
│  <Camera ref={cameraRef} />                       │
└───────────────────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────┐
│  Layer 4: Expo SDK (expo-camera)                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  JavaScript API:                                  │
│  - Camera コンポーネント                           │
│  - takePictureAsync()                             │
│  - requestCameraPermissionsAsync()                │
│                                                   │
│  ↕ (Bridge/JSI)                                   │
│                                                   │
│  Native Module (Swift/Kotlin):                    │
│  - EXCamera.swift                                 │
│  - ExpoCameraModule.kt                            │
└───────────────────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────┐
│  Layer 5: ネイティブプラットフォーム                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  iOS: AVFoundation                                │
│  ┌─────────────────────────────────────────┐     │
│  │ AVCaptureSession                        │     │
│  │   ├─ AVCaptureDevice (カメラハードウェア)  │     │
│  │   ├─ AVCaptureDeviceInput (入力)         │     │
│  │   └─ AVCapturePhotoOutput (出力)         │     │
│  │                                         │     │
│  │ AVCaptureVideoPreviewLayer (プレビュー)   │     │
│  └─────────────────────────────────────────┘     │
│                                                   │
│  Android: Camera2 API                             │
│  ┌─────────────────────────────────────────┐     │
│  │ CameraManager                           │     │
│  │   ├─ CameraDevice (カメラハードウェア)     │     │
│  │   ├─ CaptureRequest (撮影リクエスト)      │     │
│  │   └─ ImageReader (画像データ)            │     │
│  │                                         │     │
│  │ SurfaceView (プレビュー表示)             │     │
│  └─────────────────────────────────────────┘     │
└───────────────────────────────────────────────────┘
                      ↓
┌───────────────────────────────────────────────────┐
│  カメラハードウェア                                  │
│  📷 実際のカメラセンサー                            │
└───────────────────────────────────────────────────┘
```

### データの流れ

#### 写真撮影時の流れ

```
1. ユーザーがシャッターボタンをタップ
   ↓
2. JavaScript: cameraRef.current.takePictureAsync()
   ↓
3. ブリッジ経由でネイティブモジュールに送信
   {
     "method": "takePicture",
     "options": { quality: 0.8, base64: false }
   }
   ↓
4. Native (iOS): AVCapturePhotoOutput.capturePhoto()
   Native (Android): CameraDevice.capture()
   ↓
5. カメラハードウェアが画像データを生成
   ↓
6. Native: 画像データをファイルに保存
   ↓
7. ブリッジ経由でJavaScriptに結果を返す
   {
     "uri": "file:///path/to/photo.jpg",
     "width": 3024,
     "height": 4032
   }
   ↓
8. JavaScript: Promise が resolve
   const photo = await cameraRef.current.takePictureAsync();
```

---

## 📝 実装: カメラ画面を作る

### 1. 基本的なカメラコンポーネント

```javascript
// screens/CameraScreen.js
import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const cameraRef = useRef(null);

  // 権限を要求
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;  // 権限確認中
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>カメラの権限が必要です</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={cameraRef}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <Text style={styles.text}>カメラ切替</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});
```

### 2. 写真撮影機能を追加

```javascript
import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,  // 0.0〜1.0（圧縮率）
        base64: false,  // base64エンコードは重いので false
        exif: true,     // EXIF情報（位置情報など）を含める
      });
      setPhoto(photo);
      console.log('Photo:', photo);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>カメラの権限が必要です</Text>
      </View>
    );
  }

  if (photo) {
    // 撮影した写真を表示
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo.uri }} style={styles.preview} />
        <View style={styles.previewButtons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setPhoto(null)}
          >
            <Text style={styles.text}>撮り直す</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              // 保存処理（後述）
              console.log('Saved:', photo.uri);
              setPhoto(null);
            }}
          >
            <Text style={styles.text}>保存</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={cameraRef}
      >
        <View style={styles.controls}>
          {/* カメラ切替ボタン */}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>

          {/* シャッターボタン */}
          <TouchableOpacity
            style={styles.shutterButton}
            onPress={takePicture}
          >
            <View style={styles.shutterButtonInner} />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  controls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  flipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  preview: {
    flex: 1,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'black',
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
```

---

## 🔐 権限管理の詳細

### 権限の状態

```javascript
import { Camera } from 'expo-camera';

const { status } = await Camera.getCameraPermissionsAsync();

// status の値:
// - 'granted': 許可済み
// - 'denied': 拒否済み（再度要求しても自動的に拒否される）
// - 'undetermined': 未確認（まだ聞いていない）
```

### 権限要求の流れ

```javascript
// Step 1: 現在の権限状態を確認
const { status: currentStatus } = await Camera.getCameraPermissionsAsync();

if (currentStatus === 'granted') {
  // すでに許可済み
  return true;
}

if (currentStatus === 'denied') {
  // 一度拒否されている → 設定アプリに誘導
  Alert.alert(
    'カメラの権限が必要です',
    '設定アプリから権限を許可してください',
    [
      { text: 'キャンセル', style: 'cancel' },
      { text: '設定を開く', onPress: () => Linking.openSettings() }
    ]
  );
  return false;
}

// Step 2: 権限を要求
const { status: newStatus } = await Camera.requestCameraPermissionsAsync();

return newStatus === 'granted';
```

### iOS の仕組み

**app.json に説明文を記載（必須）:**

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "食事の写真を記録するためにカメラを使用します"
      }
    }
  }
}
```

**内部的な動作（iOS）:**

```swift
// Expo が自動生成するネイティブコード

import AVFoundation

// 権限要求
AVCaptureDevice.requestAccess(for: .video) { granted in
    if granted {
        // 許可された
    } else {
        // 拒否された
    }
}

// Info.plist の NSCameraUsageDescription が
// 許可ダイアログに表示される
```

### Android の仕組み

**app.json にパーミッション追加:**

```json
{
  "expo": {
    "android": {
      "permissions": [
        "CAMERA"
      ]
    }
  }
}
```

**内部的な動作（Android）:**

```kotlin
// AndroidManifest.xml に自動追加される
<uses-permission android:name="android.permission.CAMERA" />

// 実行時に権限要求
ActivityCompat.requestPermissions(
    activity,
    arrayOf(Manifest.permission.CAMERA),
    REQUEST_CAMERA_PERMISSION
)
```

---

## 💾 写真の保存

### expo-media-library を使う

```bash
npx expo install expo-media-library
```

```javascript
import * as MediaLibrary from 'expo-media-library';

// 権限要求
const { status } = await MediaLibrary.requestPermissionsAsync();

if (status === 'granted') {
  // 写真をカメラロールに保存
  const asset = await MediaLibrary.createAssetAsync(photo.uri);
  console.log('Saved to gallery:', asset.uri);
}
```

### 内部的な仕組み

**iOS:**
```swift
import Photos

// PHPhotoLibrary に保存
PHPhotoLibrary.shared().performChanges({
    PHAssetCreationRequest.creationRequestForAssetFromImage(atFileURL: url)
}) { success, error in
    if success {
        // 保存成功
    }
}
```

**Android:**
```kotlin
import android.provider.MediaStore

// MediaStore に保存
val values = ContentValues().apply {
    put(MediaStore.Images.Media.DISPLAY_NAME, "photo.jpg")
    put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
}

contentResolver.insert(
    MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
    values
)
```

---

## 🎨 カメラの高度な機能

### フラッシュモード

```javascript
const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);

<Camera
  flashMode={flashMode}
  // ...
>
  <TouchableOpacity
    onPress={() => {
      setFlashMode(
        flashMode === Camera.Constants.FlashMode.off
          ? Camera.Constants.FlashMode.on
          : Camera.Constants.FlashMode.off
      );
    }}
  >
    <Ionicons
      name={flashMode === Camera.Constants.FlashMode.on ? 'flash' : 'flash-off'}
      size={28}
      color="white"
    />
  </TouchableOpacity>
</Camera>
```

### ズーム

```javascript
const [zoom, setZoom] = useState(0);

<Camera
  zoom={zoom}  // 0.0〜1.0
  // ...
>
  <Slider
    value={zoom}
    onValueChange={setZoom}
    minimumValue={0}
    maximumValue={1}
  />
</Camera>
```

### オートフォーカス

```javascript
<Camera
  autoFocus={Camera.Constants.AutoFocus.on}
  // または
  autoFocus={Camera.Constants.AutoFocus.off}
/>
```

---

## 🔬 技術深掘り: カメラプレビューの仕組み

### React Nativeでのカメラプレビュー表示

```
┌─────────────────────────────────────────┐
│  JavaScript側                            │
│  <Camera style={{ width: 300, height: 400 }} /> │
└─────────────────────────────────────────┘
              ↓ ブリッジ
┌─────────────────────────────────────────┐
│  Native側                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  iOS:                                   │
│  AVCaptureVideoPreviewLayer を作成       │
│  └─ UIView に追加                        │
│                                         │
│  Android:                               │
│  SurfaceView を作成                      │
│  └─ CameraDevice.createCaptureSession() │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  画面に表示                               │
│  リアルタイムでカメラ映像が流れる          │
└─────────────────────────────────────────┘
```

### パフォーマンス特性

**なぜカメラプレビューは滑らか？**

カメラの映像は**ネイティブ側で直接レンダリング**されています。
JavaScript ↔ Native のブリッジを経由していません。

```
カメラハードウェア
  ↓ (毎秒30〜60フレーム)
Native のプレビューレイヤー
  ↓
画面に表示（60fps）

← JavaScriptは関与しない（だから高速）
```

シャッターボタンを押したときだけ、ブリッジを経由して撮影命令を送ります。

---

## 🆚 他の実装方法との比較

### expo-camera vs expo-image-picker

| 項目 | expo-camera | expo-image-picker |
|------|-------------|-------------------|
| **用途** | カメラアプリを作る | 写真選択機能 |
| **UI** | カスタム可能 | OS標準UI |
| **プレビュー** | リアルタイム表示 | なし |
| **ギャラリー** | なし | 選択可能 |
| **実装難易度** | 高い | 低い |

**使い分け:**
- カスタムカメラUI → `expo-camera`
- 単に写真を選びたい → `expo-image-picker`

### React Native vs ネイティブ

**React Native (expo-camera):**
```javascript
const photo = await cameraRef.current.takePictureAsync();
```

**iOS (Swift):**
```swift
let settings = AVCapturePhotoSettings()
photoOutput.capturePhoto(with: settings, delegate: self)

func photoOutput(_ output: AVCapturePhotoOutput,
                 didFinishProcessingPhoto photo: AVCapturePhoto,
                 error: Error?) {
    let data = photo.fileDataRepresentation()
    // ...
}
```

**Android (Kotlin):**
```kotlin
val captureRequest = cameraDevice.createCaptureRequest(
    CameraDevice.TEMPLATE_STILL_CAPTURE
)
cameraCaptureSession.capture(captureRequest.build(), captureCallback, null)
```

→ React Nativeなら1行で済む！

---

## ⚠️ よくある問題と解決法

### 問題1: カメラプレビューが真っ黒

**原因:** 権限がない

**解決策:**
```javascript
const { status } = await Camera.getCameraPermissionsAsync();
console.log('Permission status:', status);
```

### 問題2: "Camera is not ready"

**原因:** `ref` が設定される前に `takePictureAsync()` を呼んでいる

**解決策:**
```javascript
const takePicture = async () => {
  if (cameraRef.current) {  // ← チェックを追加
    const photo = await cameraRef.current.takePictureAsync();
  }
};
```

### 問題3: Androidでアプリがクラッシュ

**原因:** `CAMERA` 権限がない

**解決策:** app.json に追加
```json
{
  "android": {
    "permissions": ["CAMERA"]
  }
}
```

---

## 🎓 まとめ

### 学んだこと

#### レイヤー1: あなたのコード
```jsx
<Camera ref={cameraRef} />
await cameraRef.current.takePictureAsync();
```

#### レイヤー4: Expo SDK
- JavaScript API の提供
- ネイティブモジュールへの橋渡し
- クロスプラットフォーム対応

#### レイヤー5: ネイティブ
- **iOS**: AVFoundation によるカメラ制御
- **Android**: Camera2 API によるカメラ制御
- 実際のハードウェアアクセス

### 重要なポイント

1. **権限管理は必須**
   - iOS: Info.plist に説明文
   - Android: AndroidManifest.xml にパーミッション

2. **カメラプレビューはネイティブレンダリング**
   - だから60fpsで滑らか
   - JavaScriptは関与しない

3. **写真撮影はブリッジ経由**
   - 非同期処理（async/await）
   - 撮影後にJavaScriptに結果が返る

---

## 🚀 次のステップ

次は **Step 9: 画像ピッカー (expo-image-picker)** です。

ギャラリーから写真を選択する機能を追加します。

---

**お疲れ様でした！カメラアプリが作れるようになりました 📸**

