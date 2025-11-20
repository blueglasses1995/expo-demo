# 11. クイックリファレンス

## 🎯 このガイドの目的

よく使うコマンド、コード、設定をすぐに参照できるリファレンスです。

---

## 📋 目次

1. [よく使うコマンド](#よく使うコマンド)
2. [基本コンポーネント](#基本コンポーネント)
3. [スタイリング](#スタイリング)
4. [Hooks](#hooks)
5. [ナビゲーション](#ナビゲーション)
6. [ストレージ](#ストレージ)
7. [ネットワーク](#ネットワーク)
8. [権限](#権限)
9. [デバッグ](#デバッグ)
10. [ビルド・デプロイ](#ビルドデプロイ)

---

## よく使うコマンド

### プロジェクト作成

```bash
# 新規プロジェクト
npx create-expo-app my-app

# テンプレート指定
npx create-expo-app my-app --template blank
npx create-expo-app my-app --template tabs
```

### 開発

```bash
# 開発サーバー起動
npx expo start

# キャッシュクリア
npx expo start -c

# 特定プラットフォームで起動
npx expo start --ios
npx expo start --android
npx expo start --web
```

### パッケージ管理

```bash
# パッケージインストール（Expo互換バージョン）
npx expo install パッケージ名

# 例
npx expo install expo-camera
npx expo install react-native-maps

# 複数同時
npx expo install expo-camera expo-location expo-sensors
```

### ビルド

```bash
# EAS Build設定
eas build:configure

# ビルド実行
eas build --platform ios
eas build --platform android
eas build --platform all

# プロファイル指定
eas build --profile development
eas build --profile preview
eas build --profile production
```

### デプロイ

```bash
# App Store / Google Play に提出
eas submit --platform ios
eas submit --platform android

# OTAアップデート
eas update --branch production --message "Bug fixes"
```

---

## 基本コンポーネント

### View（コンテナ）

```jsx
import { View } from 'react-native';

<View style={{ flex: 1, padding: 20 }}>
  {/* コンテンツ */}
</View>
```

### Text（テキスト）

```jsx
import { Text } from 'react-native';

<Text style={{ fontSize: 16, color: '#333' }}>
  テキスト
</Text>
```

### Button（ボタン）

```jsx
import { Button } from 'react-native';

<Button
  title="押してね"
  onPress={() => console.log('Pressed')}
  color="#4A90E2"
  disabled={false}
/>
```

### Pressable（カスタムボタン）

```jsx
import { Pressable, Text } from 'react-native';

<Pressable
  onPress={() => console.log('Pressed')}
  style={({ pressed }) => [
    { padding: 10, backgroundColor: pressed ? '#ddd' : '#4A90E2' }
  ]}
>
  <Text style={{ color: 'white' }}>押してね</Text>
</Pressable>
```

### TextInput（入力フィールド）

```jsx
import { TextInput } from 'react-native';
import { useState } from 'react';

const [text, setText] = useState('');

<TextInput
  value={text}
  onChangeText={setText}
  placeholder="入力してください"
  style={{ borderWidth: 1, padding: 10 }}
  keyboardType="default"  // default, numeric, email-address, phone-pad
  secureTextEntry={false}  // パスワード用
  multiline={false}
/>
```

### ScrollView（スクロール）

```jsx
import { ScrollView } from 'react-native';

<ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{ padding: 20 }}
  showsVerticalScrollIndicator={true}
>
  {/* コンテンツ */}
</ScrollView>
```

### FlatList（効率的なリスト）

```jsx
import { FlatList } from 'react-native';

<FlatList
  data={[{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }]}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <Text>{item.name}</Text>
  )}
  refreshing={false}
  onRefresh={() => {}}
  onEndReached={() => {}}
  onEndReachedThreshold={0.5}
/>
```

### Image（画像）

```jsx
import { Image } from 'react-native';

// ローカル画像
<Image
  source={require('./assets/image.png')}
  style={{ width: 200, height: 200 }}
  resizeMode="cover"  // cover, contain, stretch, repeat, center
/>

// ネットワーク画像
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
/>
```

---

## スタイリング

### StyleSheet

```jsx
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',  // row, column
    justifyContent: 'center', // flex-start, center, flex-end, space-between, space-around
    alignItems: 'center',     // flex-start, center, flex-end, stretch
    padding: 20,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',       // normal, bold, 100-900
    color: '#333',
    marginBottom: 10,
  },
});
```

### Flexbox チートシート

```jsx
{
  // コンテナ
  flex: 1,                    // 親の空間を埋める
  flexDirection: 'row',       // row, column, row-reverse, column-reverse
  flexWrap: 'wrap',           // nowrap, wrap, wrap-reverse
  justifyContent: 'center',   // 主軸の配置
  alignItems: 'center',       // 交差軸の配置
  alignContent: 'center',     // 複数行の配置
  gap: 10,                    // 要素間の隙間

  // アイテム
  flexGrow: 1,                // 伸びる比率
  flexShrink: 1,              // 縮む比率
  flexBasis: 'auto',          // 基本サイズ
  alignSelf: 'center',        // 個別の配置
}
```

### よく使うスタイル

```jsx
{
  // サイズ
  width: 100,
  height: 100,
  minWidth: 50,
  maxWidth: 200,

  // 余白
  padding: 10,
  paddingVertical: 10,
  paddingHorizontal: 20,
  paddingTop: 5,
  margin: 10,
  marginVertical: 10,

  // ボーダー
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  borderTopLeftRadius: 8,

  // シャドウ (iOS)
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,

  // エレベーション (Android)
  elevation: 5,

  // 位置
  position: 'absolute',  // relative, absolute
  top: 0,
  left: 0,
  zIndex: 1,

  // オーバーフロー
  overflow: 'hidden',    // visible, hidden, scroll
}
```

---

## Hooks

### useState（状態管理）

```jsx
import { useState } from 'react';

const [count, setCount] = useState(0);
const [text, setText] = useState('');
const [user, setUser] = useState({ name: '', age: 0 });

// 更新
setCount(count + 1);
setCount(prev => prev + 1);  // 前の値を使う
setUser({ ...user, name: 'Taro' });
```

### useEffect（副作用）

```jsx
import { useEffect } from 'react';

// マウント時のみ実行
useEffect(() => {
  console.log('Mounted');
}, []);

// 依存配列の値が変わったら実行
useEffect(() => {
  console.log('Count changed:', count);
}, [count]);

// クリーンアップ
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
}, []);
```

### useCallback（関数のメモ化）

```jsx
import { useCallback } from 'react';

const handlePress = useCallback(() => {
  console.log('Pressed', someValue);
}, [someValue]);  // 依存配列
```

### useMemo（値のメモ化）

```jsx
import { useMemo } from 'react';

const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

### useRef（参照の保持）

```jsx
import { useRef } from 'react';

const inputRef = useRef(null);
const countRef = useRef(0);

// コンポーネントにアクセス
<TextInput ref={inputRef} />
inputRef.current.focus();

// 値の保持（再レンダリングなし）
countRef.current += 1;
```

---

## ナビゲーション

### インストール

```bash
npx expo install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-navigation/native-stack
npx expo install @react-navigation/bottom-tabs
```

### Stack Navigator

```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 画面遷移
function HomeScreen({ navigation }) {
  return (
    <Button
      title="Go to Details"
      onPress={() => navigation.navigate('Details', { itemId: 42 })}
    />
  );
}

// パラメータ取得
function DetailsScreen({ route, navigation }) {
  const { itemId } = route.params;
  return <Text>Item ID: {itemId}</Text>;
}
```

### Tab Navigator

```jsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

---

## ストレージ

### AsyncStorage

```bash
npx expo install @react-native-async-storage/async-storage
```

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// 保存
await AsyncStorage.setItem('key', 'value');
await AsyncStorage.setItem('user', JSON.stringify({ name: 'Taro' }));

// 取得
const value = await AsyncStorage.getItem('key');
const user = JSON.parse(await AsyncStorage.getItem('user'));

// 削除
await AsyncStorage.removeItem('key');

// 全削除
await AsyncStorage.clear();
```

### SecureStore（機密情報用）

```bash
npx expo install expo-secure-store
```

```jsx
import * as SecureStore from 'expo-secure-store';

// 保存（暗号化）
await SecureStore.setItemAsync('token', authToken);

// 取得
const token = await SecureStore.getItemAsync('token');

// 削除
await SecureStore.deleteItemAsync('token');
```

---

## ネットワーク

### fetch

```jsx
// GET
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// POST
const response = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ name: 'Taro' }),
});

// エラーハンドリング
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error('Fetch error:', error);
}
```

### axios

```bash
npm install axios
```

```jsx
import axios from 'axios';

// GET
const response = await axios.get('https://api.example.com/data');
const data = response.data;

// POST
const response = await axios.post('https://api.example.com/data', {
  name: 'Taro',
});

// インターセプター
axios.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 権限

### カメラ

```jsx
import { Camera } from 'expo-camera';

const { status } = await Camera.requestCameraPermissionsAsync();
if (status === 'granted') {
  // カメラ使用可能
}
```

### 位置情報

```jsx
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
if (status === 'granted') {
  const location = await Location.getCurrentPositionAsync();
}
```

### 通知

```jsx
import * as Notifications from 'expo-notifications';

const { status } = await Notifications.requestPermissionsAsync();
```

---

## デバッグ

### ログ出力

```jsx
console.log('通常のログ');
console.warn('警告');
console.error('エラー');
console.table({ name: 'Taro', age: 30 });
console.time('処理時間');
// 処理
console.timeEnd('処理時間');
```

### デバッグメニュー

```
iOS Simulator: Cmd + D
Android Emulator: Cmd + M (Mac) / Ctrl + M (Windows)
実機: シェイク
```

### React Native Debugger

```bash
brew install react-native-debugger  # Mac

# アプリでデバッグメニュー → "Debug Remote JS"
```

---

## ビルド・デプロイ

### app.json 基本設定

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.mycompany.myapp",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.mycompany.myapp",
      "versionCode": 1
    }
  }
}
```

### EAS設定

```bash
# 初回設定
eas build:configure

# ビルド
eas build -p ios --profile production
eas build -p android --profile production

# 提出
eas submit -p ios
eas submit -p android
```

---

## 📚 参考

よく使うExpoモジュール:
```bash
expo-camera         # カメラ
expo-image-picker   # 画像選択
expo-location       # 位置情報
expo-sensors        # センサー
expo-av             # 音声・動画
expo-file-system    # ファイル操作
expo-notifications  # 通知
expo-font           # フォント
expo-linear-gradient # グラデーション
expo-blur           # ブラー効果
```

このリファレンスをブックマークして、開発中にすぐ参照できるようにしましょう！

