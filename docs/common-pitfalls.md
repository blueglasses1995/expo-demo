# 実務でつまずきやすいポイント完全ガイド

## 🎯 このガイドの目的

React Native/Expo開発で**実際によく遭遇する問題**とその解決法を網羅的にまとめました。

「これハマったら時間かかるやつ」を事前に知っておくことで、開発をスムーズに進められます。

---

## 📋 目次

1. [プラットフォーム間の差異](#1-プラットフォーム間の差異)
2. [権限エラー](#2-権限エラー)
3. [ビルドエラー](#3-ビルドエラー)
4. [パフォーマンス問題](#4-パフォーマンス問題)
5. [状態管理の落とし穴](#5-状態管理の落とし穴)
6. [非同期処理](#6-非同期処理)
7. [ナビゲーション](#7-ナビゲーション)
8. [キーボード問題](#8-キーボード問題)
9. [画像とアセット](#9-画像とアセット)
10. [バージョン互換性](#10-バージョン互換性)

---

## 1. プラットフォーム間の差異

### 問題: iOSとAndroidで見た目が違う

#### ケース1: デフォルトフォント

```javascript
// iOSでは San Francisco、Androidでは Roboto
<Text>これは違うフォントで表示される</Text>
```

**解決策:**
```javascript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  text: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    // または共通フォントを使う
    fontFamily: 'MyCustomFont',
  }
});
```

#### ケース2: シャドウ

```javascript
// ❌ これはiOSでしか動かない
shadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
}

// ✅ iOS/Android両対応
shadow: {
  // iOS用
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  // Android用
  elevation: 5,
}
```

#### ケース3: StatusBar

```javascript
import { StatusBar, Platform } from 'react-native';

// iOSとAndroidで高さが違う
const STATUSBAR_HEIGHT = Platform.select({
  ios: 44,    // iPhoneXシリーズは更に高い
  android: StatusBar.currentHeight || 24,
});
```

**解決策: SafeAreaViewを使う**
```javascript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  {/* コンテンツ */}
</SafeAreaView>
```

#### ケース4: 戻るボタン（Androidのみ）

```javascript
import { BackHandler } from 'react-native';
import { useEffect } from 'react';

useEffect(() => {
  const backAction = () => {
    // Androidの戻るボタンが押されたとき
    Alert.alert('終了確認', '本当に終了しますか?', [
      { text: 'キャンセル', onPress: () => null },
      { text: '終了', onPress: () => BackHandler.exitApp() }
    ]);
    return true;  // デフォルト動作を無効化
  };

  const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
  return () => backHandler.remove();
}, []);
```

### プラットフォーム別コード

```javascript
import { Platform } from 'react-native';

// 方法1: Platform.OS
if (Platform.OS === 'ios') {
  // iOS専用コード
}

// 方法2: Platform.select
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
      android: {
        paddingTop: 10,
      },
    }),
  }
});

// 方法3: ファイル分割（推奨）
// Component.ios.js
// Component.android.js
import Component from './Component';  // 自動的にプラットフォーム別ファイルが読み込まれる
```

---

## 2. 権限エラー

### 問題: カメラ/位置情報にアクセスできない

#### ケース1: 権限を要求していない

```javascript
// ❌ いきなりカメラを使おうとする
import { Camera } from 'expo-camera';

function App() {
  return <Camera />;  // → エラー！
}

// ✅ 事前に権限を要求
import { Camera } from 'expo-camera';
import { useState, useEffect } from 'react';

function App() {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>権限確認中...</Text>;
  }
  if (hasPermission === false) {
    return <Text>カメラの権限が必要です</Text>;
  }

  return <Camera />;
}
```

#### ケース2: app.json に権限を記載していない

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "写真撮影に使用します",
        "NSPhotoLibraryUsageDescription": "写真を保存します",
        "NSLocationWhenInUseUsageDescription": "現在地を取得します"
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

#### ケース3: 権限が拒否された後の処理

```javascript
const { status } = await Camera.requestCameraPermissionsAsync();

if (status === 'denied') {
  // 一度拒否されると、再度要求しても自動的に denied になる
  Alert.alert(
    '権限が必要です',
    '設定アプリからカメラの権限を許可してください',
    [
      { text: 'キャンセル' },
      { text: '設定を開く', onPress: () => Linking.openSettings() }
    ]
  );
}
```

### 権限チェックのベストプラクティス

```javascript
// utils/permissions.js
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';

export const requestCameraPermission = async () => {
  const { status } = await Camera.getCameraPermissionsAsync();

  if (status === 'granted') {
    return true;
  }

  if (status === 'denied') {
    Alert.alert(
      'カメラの権限が必要です',
      '設定から権限を許可してください',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '設定を開く', onPress: () => Linking.openSettings() }
      ]
    );
    return false;
  }

  const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
  return newStatus === 'granted';
};
```

---

## 3. ビルドエラー

### 問題: "Pod install failed"（iOS）

```
error: CocoaPods installation failed
```

**原因:**
- CocoaPods のバージョンが古い
- Podfile.lock の不整合

**解決策:**
```bash
# CocoaPods を最新に
sudo gem install cocoapods

# キャッシュクリア
cd ios
pod deintegrate
pod install

# または
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

### 問題: "Duplicate resources"（Android）

```
error: Duplicate resources
```

**原因:** 同じリソースが複数回含まれている

**解決策:**
```bash
cd android
./gradlew clean

# または
cd android
rm -rf build app/build
```

### 問題: "Metro Bundler error"

```
error: Metro Bundler has encountered an error
```

**解決策:**
```bash
# キャッシュをクリア
npx expo start -c

# またはメトロのキャッシュを直接削除
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# Watchman をリセット (Mac/Linux)
watchman watch-del-all
```

---

## 4. パフォーマンス問題

### 問題: リストのスクロールが遅い

#### ❌ 悪い例

```javascript
// ScrollView で大量のデータを表示
<ScrollView>
  {data.map(item => (
    <View key={item.id}>
      <Text>{item.name}</Text>
    </View>
  ))}
</ScrollView>
```

**問題点:**
- すべての要素が一度にレンダリングされる
- 1000件あれば1000個のViewが生成される
- メモリ大量消費

#### ✅ 良い例

```javascript
// FlatList を使う（仮想化）
<FlatList
  data={data}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View>
      <Text>{item.name}</Text>
    </View>
  )}
  // パフォーマンス最適化
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={10}
  windowSize={5}
/>
```

### 問題: 不要な再レンダリング

#### ❌ 悪い例

```javascript
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Button title="カウント" onPress={() => setCount(count + 1)} />
      <ExpensiveComponent />  {/* countが変わるたびに再レンダリング */}
    </View>
  );
}
```

#### ✅ 良い例

```javascript
const ExpensiveComponentMemo = React.memo(ExpensiveComponent);

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Button title="カウント" onPress={() => setCount(count + 1)} />
      <ExpensiveComponentMemo />  {/* propsが変わらなければ再レンダリングしない */}
    </View>
  );
}
```

### 問題: 画像が重い

```javascript
// ✅ resizeMode と cache を使う
<Image
  source={{ uri: 'https://example.com/large-image.jpg' }}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"
  defaultSource={require('./placeholder.png')}  // ロード中の表示
/>

// ✅ または expo-image (パフォーマンス最適化済み)
import { Image } from 'expo-image';

<Image
  source={{ uri: 'https://example.com/large-image.jpg' }}
  style={{ width: 100, height: 100 }}
  contentFit="cover"
  placeholder={require('./placeholder.png')}
  transition={200}
/>
```

---

## 5. 状態管理の落とし穴

### 問題: stateの更新が即座に反映されない

```javascript
// ❌ これは期待通りに動かない
const [count, setCount] = useState(0);

const handlePress = () => {
  setCount(count + 1);
  console.log(count);  // ← まだ古い値（0）が表示される
};

// ✅ useEffect で監視
useEffect(() => {
  console.log('count changed:', count);
}, [count]);
```

### 問題: オブジェクト/配列の更新

```javascript
// ❌ ダメ（直接変更）
const [user, setUser] = useState({ name: 'Taro', age: 30 });

const updateAge = () => {
  user.age = 31;  // ← これは再レンダリングされない
  setUser(user);
};

// ✅ 正しい（新しいオブジェクトを作る）
const updateAge = () => {
  setUser({ ...user, age: 31 });
};

// 配列も同様
const [items, setItems] = useState([1, 2, 3]);

// ❌ ダメ
items.push(4);
setItems(items);

// ✅ 正しい
setItems([...items, 4]);
```

### 問題: クロージャの罠

```javascript
// ❌ これは期待通りに動かない
const [count, setCount] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1);  // ← 常に 0 + 1 = 1 になる
  }, 1000);

  return () => clearInterval(timer);
}, []);  // ← 依存配列が空なので、count は常に初期値

// ✅ 正しい方法1: 依存配列に含める
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1);
  }, 1000);

  return () => clearInterval(timer);
}, [count]);  // ← count が変わるたびに再設定される

// ✅ 正しい方法2: 関数型更新
useEffect(() => {
  const timer = setInterval(() => {
    setCount((prevCount) => prevCount + 1);  // ← 最新の値を参照
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

---

## 6. 非同期処理

### 問題: アンマウント後にstateを更新

```javascript
// ❌ これは警告が出る
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(result => {
      setData(result);  // ← コンポーネントがアンマウントされていたら警告
    });
  }, []);
}

// ✅ 正しい
function MyComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchData().then(result => {
      if (isMounted) {
        setData(result);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);
}
```

### 問題: async/await のエラーハンドリング

```javascript
// ❌ エラーが捕捉されない
useEffect(() => {
  async function loadData() {
    const data = await fetchData();  // エラーが起きたら？
    setData(data);
  }
  loadData();
}, []);

// ✅ try-catch を使う
useEffect(() => {
  async function loadData() {
    try {
      const data = await fetchData();
      setData(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  }
  loadData();
}, []);
```

---

## 7. ナビゲーション

### 問題: "Cannot navigate before mounting"

```javascript
// ❌ コンポーネント外で navigation を使おうとする
import { navigate } from './navigation';  // ← これは動かない

function login() {
  await api.login();
  navigate('Home');  // ← エラー
}

// ✅ navigation prop を渡す
function LoginScreen({ navigation }) {
  async function login() {
    await api.login();
    navigation.navigate('Home');  // ← OK
  }
}
```

### 問題: ナビゲーション後も前の画面が動いている

```javascript
// ❌ タイマーが残り続ける
function HomeScreen({ navigation }) {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('tick');
    }, 1000);
    // クリーンアップがない！
  }, []);
}

// ✅ クリーンアップ
function HomeScreen({ navigation }) {
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('tick');
    }, 1000);

    return () => clearInterval(timer);  // ← アンマウント時に実行
  }, []);
}
```

---

## 8. キーボード問題

### 問題: キーボードがコンテンツを隠す

```javascript
// ❌ キーボードに隠れる
<View style={{ flex: 1 }}>
  <TextInput placeholder="メッセージ" />
  <Button title="送信" />  {/* ← キーボードに隠れる */}
</View>

// ✅ KeyboardAvoidingView を使う
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <TextInput placeholder="メッセージ" />
  <Button title="送信" />
</KeyboardAvoidingView>
```

### 問題: スクロールビュー内のTextInput

```javascript
// ✅ KeyboardAwareScrollView を使う
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

<KeyboardAwareScrollView>
  <TextInput placeholder="名前" />
  <TextInput placeholder="メールアドレス" />
  <TextInput placeholder="メッセージ" />
  {/* キーボードが開いても、フォーカスされたTextInputが見える位置にスクロールされる */}
</KeyboardAwareScrollView>
```

---

## 9. 画像とアセット

### 問題: require() でパスを変数にできない

```javascript
// ❌ これは動かない
const imageName = 'logo';
<Image source={require(`./images/${imageName}.png`)} />

// ✅ オブジェクトで管理
const images = {
  logo: require('./images/logo.png'),
  icon: require('./images/icon.png'),
};

<Image source={images['logo']} />
```

### 問題: ネットワーク画像にサイズ指定が必要

```javascript
// ❌ サイズが0になる
<Image source={{ uri: 'https://example.com/image.jpg' }} />

// ✅ サイズを指定
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
/>
```

---

## 10. バージョン互換性

### 問題: React Native / Expo / ライブラリのバージョン不整合

```bash
# ❌ npm install で最新版をインストール
npm install react-navigation

# ✅ Expo互換バージョンをインストール
npx expo install react-navigation
```

### 問題: Hermes有効化後に動かない

```json
// android/app/build.gradle
project.ext.react = [
    enableHermes: true  // ← これを有効にしたら
]
```

**解決策:**
```bash
cd android
./gradlew clean
cd ..
npx expo start -c
```

---

## 🎓 まとめ: つまずかないための心得

### 開発前に

1. **公式ドキュメントを読む**
   - https://docs.expo.dev/
   - https://reactnative.dev/

2. **バージョンを確認**
   - `npx expo-doctor` でチェック

3. **エミュレーターと実機の両方でテスト**

### 開発中に

1. **こまめに git commit**
   - 動く状態を保存しておく

2. **console.log を多用**
   - 状態を常に確認

3. **エラーメッセージをよく読む**
   - 9割は解決のヒントが書いてある

### ハマったら

1. **キャッシュクリア**
   ```bash
   npx expo start -c
   ```

2. **再インストール**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **検索する**
   - GitHub Issues
   - Stack Overflow
   - Expo Forums

4. **最小構成で再現**
   - 問題を切り分ける

---

このガイドを参考に、スムーズな開発を！

