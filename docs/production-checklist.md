# スマホアプリ開発者が実務で気にしている点：完全ガイド

## 🎯 このガイドの目的

趣味や学習でアプリを作るのと、**実際にユーザーに使われるアプリ**を作るのとでは、
気にすべき点が大きく異なります。

このドキュメントでは、プロの開発者が日々意識している考慮事項を網羅的に解説します。

---

## 📋 目次

1. [パフォーマンス](#1-パフォーマンス)
2. [ユーザー体験（UX）](#2-ユーザー体験ux)
3. [セキュリティ](#3-セキュリティ)
4. [プラットフォーム対応](#4-プラットフォーム対応)
5. [データ管理](#5-データ管理)
6. [アクセシビリティ](#6-アクセシビリティ)
7. [テスト戦略](#7-テスト戦略)
8. [リリース管理](#8-リリース管理)
9. [監視・分析](#9-監視分析)
10. [規約・法的要件](#10-規約法的要件)
11. [チーム開発](#11-チーム開発)
12. [コスト・運用](#12-コスト運用)

---

## 1. パフォーマンス

### 1.1 メモリ管理

#### なぜ重要か

スマホは**メモリが限られている**デバイスです。
メモリリークがあると：
- アプリがクラッシュする
- OSに強制終了される
- デバイス全体が遅くなる

#### 実務での対策

**画像のメモリ管理**

```javascript
// ❌ 悪い例：大きな画像を直接表示
<Image
  source={{ uri: 'https://example.com/10mb-image.jpg' }}
  style={{ width: 100, height: 100 }}
/>

// ✅ 良い例：リサイズ済み画像を使う
<Image
  source={{ uri: 'https://example.com/thumbnails/image-100x100.jpg' }}
  style={{ width: 100, height: 100 }}
  // または expo-image を使う（自動メモリ管理）
/>
```

**FlatList の最適化**

```javascript
<FlatList
  data={items}
  renderItem={renderItem}
  // メモリ節約の設定
  removeClippedSubviews={true}  // 画面外のViewを削除
  maxToRenderPerBatch={10}       // バッチ処理数
  windowSize={5}                 // メモリに保持する範囲
  initialNumToRender={10}        // 初期レンダリング数

  // キーは必須（再利用のため）
  keyExtractor={(item) => item.id.toString()}

  // コンポーネントのメモ化
  renderItem={React.useCallback(({ item }) => (
    <MemoizedItem item={item} />
  ), [])}
/>

const MemoizedItem = React.memo(Item);
```

**イベントリスナーのクリーンアップ**

```javascript
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleAppStateChange);

  // 必ずクリーンアップ
  return () => {
    subscription.remove();
  };
}, []);
```

**メモリリークチェックツール**

```javascript
// React DevTools Profiler で確認
// - コンポーネントがアンマウント後もメモリに残っていないか
// - 不要な再レンダリングが起きていないか

// Flipper のメモリプロファイラ
// - ヒープスナップショット
// - メモリ使用量の推移
```

---

### 1.2 バッテリー消費

#### なぜ重要か

バッテリーを大量消費するアプリは：
- ユーザーにアンインストールされる
- レビューで低評価
- OSの省電力モードで制限される

#### 実務での対策

**位置情報の最適化**

```javascript
import * as Location from 'expo-location';

// ❌ 悪い例：常に高精度で取得
Location.watchPositionAsync({
  accuracy: Location.Accuracy.Highest,  // GPS常時起動
  distanceInterval: 0,                  // 常に更新
}, (location) => {
  updateLocation(location);
});

// ✅ 良い例：必要な精度のみ
Location.watchPositionAsync({
  accuracy: Location.Accuracy.Balanced,  // Wi-Fi/基地局も使う
  distanceInterval: 10,                  // 10m移動したら更新
  timeInterval: 5000,                    // 最低5秒間隔
}, (location) => {
  updateLocation(location);
});

// さらに良い：使用時のみ
useEffect(() => {
  let subscription;

  if (isTracking) {
    // トラッキング開始
    subscription = Location.watchPositionAsync(...);
  }

  return () => {
    // 停止したらリソース解放
    subscription?.remove();
  };
}, [isTracking]);
```

**ポーリングの最適化**

```javascript
// ❌ 悪い例：頻繁にAPIリクエスト
setInterval(() => {
  fetchData();
}, 1000);  // 1秒ごと → サーバー・バッテリー両方に負荷

// ✅ 良い例：適切な間隔 + バックグラウンド時は停止
useEffect(() => {
  let interval;

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      // アクティブ時のみポーリング
      interval = setInterval(fetchData, 30000);  // 30秒
    } else {
      // バックグラウンドでは停止
      clearInterval(interval);
    }
  };

  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    clearInterval(interval);
    subscription.remove();
  };
}, []);
```

**アニメーションの最適化**

```javascript
// ❌ JavaScriptアニメーション（バッテリー消費大）
const [position, setPosition] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setPosition(p => p + 1);
  }, 16);  // 60fps

  return () => clearInterval(interval);
}, []);

// ✅ ネイティブアニメーション（GPU使用、バッテリー効率良い）
import { Animated } from 'react-native';

const animatedValue = useRef(new Animated.Value(0)).current;

Animated.timing(animatedValue, {
  toValue: 100,
  duration: 1000,
  useNativeDriver: true,  // ← これが重要！
}).start();
```

---

### 1.3 起動時間

#### なぜ重要か

ユーザーは**2秒以内**に何か見えないとイライラします。
- 3秒以上 → 離脱率が急増
- 5秒以上 → App Storeで低評価

#### 実務での対策

**遅延読み込み（Lazy Loading）**

```javascript
// ❌ 悪い例：起動時にすべてインポート
import HeavyChart from './components/HeavyChart';
import ComplexMap from './components/ComplexMap';
import VideoPlayer from './components/VideoPlayer';

// ✅ 良い例：必要になったら読み込む
const HeavyChart = React.lazy(() => import('./components/HeavyChart'));
const ComplexMap = React.lazy(() => import('./components/ComplexMap'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      {showChart && <HeavyChart />}
    </Suspense>
  );
}
```

**初期データの最小化**

```javascript
// ❌ 悪い例：起動時にすべて取得
useEffect(() => {
  Promise.all([
    fetchUserProfile(),
    fetchAllPosts(),        // 1000件
    fetchAllComments(),     // 10000件
    fetchAllFriends(),      // 500件
  ]).then(() => setReady(true));
}, []);

// ✅ 良い例：必要最小限のみ
useEffect(() => {
  // 起動時は最低限
  fetchUserProfile().then(() => setReady(true));

  // 他は後で
  setTimeout(() => {
    fetchRecentPosts(10);  // 最新10件だけ
  }, 1000);
}, []);
```

**スプラッシュスクリーンの活用**

```json
// app.json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#FFFFFF",
      "resizeMode": "contain"
    }
  }
}
```

```javascript
// App.js
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();  // 自動で消さない

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 必要な初期化処理
        await loadFonts();
        await fetchInitialData();
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();  // 準備完了後に消す
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return <MainApp />;
}
```

**起動時間の計測**

```javascript
// app.json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/perf"  // Firebase Performance Monitoring
    ]
  }
}

// App.js
import perf from '@react-native-firebase/perf';

const trace = await perf().startTrace('app_startup');
// 初期化処理
await trace.stop();

console.log(`Startup time: ${trace.getMetric('duration')}ms`);
```

---

### 1.4 レンダリングパフォーマンス

#### なぜ重要か

**60fps** を維持できないと、カクつきが目立ちます。
- スクロール
- アニメーション
- 画面遷移

#### 実務での対策

**不要な再レンダリングの防止**

```javascript
// ❌ 悪い例：親が更新されるたびに子も再レンダリング
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Button title="カウント" onPress={() => setCount(count + 1)} />
      <ExpensiveChild data={someData} />  {/* count変更で毎回再レンダリング */}
    </View>
  );
}

// ✅ 良い例：React.memo で最適化
const ExpensiveChild = React.memo(({ data }) => {
  return <ComplexComponent data={data} />;
});

// さらに良い：useMemo / useCallback
function Parent() {
  const [count, setCount] = useState(0);

  const memoizedData = useMemo(() => {
    return processData(rawData);
  }, [rawData]);  // rawData が変わったときだけ再計算

  const handlePress = useCallback(() => {
    // 処理
  }, []);  // 関数の再生成を防ぐ

  return (
    <View>
      <Button title="カウント" onPress={() => setCount(count + 1)} />
      <ExpensiveChild data={memoizedData} onPress={handlePress} />
    </View>
  );
}
```

**shouldComponentUpdate の活用（クラスコンポーネント）**

```javascript
class ExpensiveList extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // dataが変わったときだけ再レンダリング
    return nextProps.data !== this.props.data;
  }

  render() {
    // 重い処理
  }
}

// または PureComponent を使う
class ExpensiveList extends React.PureComponent {
  // 自動的に shallow comparison
}
```

**パフォーマンスモニタリング**

```javascript
// React DevTools Profiler
import { Profiler } from 'react';

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MainContent />
    </Profiler>
  );
}

function onRenderCallback(
  id,
  phase,
  actualDuration,  // このレンダリングにかかった時間
  baseDuration,
  startTime,
  commitTime
) {
  if (actualDuration > 16) {  // 60fps = 16ms/frame
    console.warn(`Slow render: ${id} took ${actualDuration}ms`);
  }
}
```

---

## 2. ユーザー体験（UX）

### 2.1 レスポンス時間

#### なぜ重要か

ユーザーは**即座のフィードバック**を期待します。
- タップから反応まで100ms以下が理想
- 1秒以上 → イライラ
- 3秒以上 → バグと認識

#### 実務での対策

**楽観的UI更新（Optimistic UI）**

```javascript
// ❌ 悪い例：サーバーレスポンスを待つ
const handleLike = async () => {
  setLoading(true);
  await api.likePost(postId);  // 1〜2秒かかる
  setIsLiked(true);
  setLoading(false);
};

// ✅ 良い例：即座にUIを更新
const handleLike = async () => {
  // 先にUIを更新（即座）
  setIsLiked(true);
  setLikeCount(count => count + 1);

  try {
    await api.likePost(postId);
  } catch (error) {
    // 失敗したら元に戻す
    setIsLiked(false);
    setLikeCount(count => count - 1);
    Alert.alert('エラー', 'いいねに失敗しました');
  }
};
```

**デバウンス・スロットリング**

```javascript
import { debounce } from 'lodash';

// 検索フィールド
const handleSearch = debounce((text) => {
  // 入力停止後300msしてから実行
  searchAPI(text);
}, 300);

<TextInput
  onChangeText={handleSearch}
  placeholder="検索..."
/>

// スクロールイベント
import { throttle } from 'lodash';

const handleScroll = throttle((event) => {
  // 100msに1回だけ実行
  updateScrollPosition(event.nativeEvent.contentOffset.y);
}, 100);

<ScrollView onScroll={handleScroll} />
```

**スケルトンスクリーン**

```javascript
// ❌ 悪い例：真っ白な画面
{isLoading ? <ActivityIndicator /> : <Content />}

// ✅ 良い例：スケルトン表示
{isLoading ? <SkeletonScreen /> : <Content />}

// スケルトンの実装
function SkeletonScreen() {
  return (
    <View>
      <SkeletonPlaceholder>
        <View style={{ width: 200, height: 20, marginBottom: 10 }} />
        <View style={{ width: 150, height: 20, marginBottom: 10 }} />
        <View style={{ width: '100%', height: 200 }} />
      </SkeletonPlaceholder>
    </View>
  );
}
```

---

### 2.2 オフライン対応

#### なぜ重要か

ユーザーは**常にネットワークがあるとは限りません**。
- 地下鉄
- トンネル
- 電波の悪い場所
- 機内モード

#### 実務での対策

**ネットワーク状態の監視**

```javascript
import NetInfo from '@react-native-community/netinfo';

function App() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);

      if (!state.isConnected) {
        // オフラインになった
        showOfflineMessage();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text>オフラインです</Text>
        </View>
      )}
      <MainContent />
    </View>
  );
}
```

**オフライン時のキャッシュ利用**

```javascript
// API呼び出し時にキャッシュを活用
async function fetchPosts() {
  try {
    // まずキャッシュから読み込み（即座に表示）
    const cachedPosts = await AsyncStorage.getItem('cached_posts');
    if (cachedPosts) {
      setPosts(JSON.parse(cachedPosts));
    }

    // ネットワークから最新データ取得
    const response = await api.getPosts();
    setPosts(response.data);

    // キャッシュを更新
    await AsyncStorage.setItem('cached_posts', JSON.stringify(response.data));
  } catch (error) {
    // オフライン時はキャッシュのみ使用
    if (cachedPosts) {
      Alert.alert('オフライン', 'キャッシュされたデータを表示しています');
    } else {
      Alert.alert('エラー', 'データを取得できません');
    }
  }
}
```

**オフライン操作のキュー**

```javascript
// オフライン時の操作を保存し、オンライン復帰時に実行
class OfflineQueue {
  constructor() {
    this.queue = [];
    this.init();
  }

  async init() {
    const saved = await AsyncStorage.getItem('offline_queue');
    if (saved) {
      this.queue = JSON.parse(saved);
    }

    // オンライン復帰を監視
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  }

  async add(action) {
    this.queue.push(action);
    await AsyncStorage.setItem('offline_queue', JSON.stringify(this.queue));
  }

  async processQueue() {
    while (this.queue.length > 0) {
      const action = this.queue[0];
      try {
        await executeAction(action);
        this.queue.shift();
        await AsyncStorage.setItem('offline_queue', JSON.stringify(this.queue));
      } catch (error) {
        console.error('Queue processing failed:', error);
        break;
      }
    }
  }
}

// 使い方
const handleLike = async (postId) => {
  const isOnline = await NetInfo.fetch().then(state => state.isConnected);

  if (isOnline) {
    await api.likePost(postId);
  } else {
    // オフライン時はキューに追加
    await offlineQueue.add({ type: 'LIKE_POST', postId });
    Alert.alert('オフライン', 'オンライン復帰時に同期されます');
  }
};
```

---

### 2.3 エラーハンドリング

#### なぜ重要か

エラーが起きたとき、**ユーザーに何が起きたか伝える**必要があります。
- 分かりやすいメッセージ
- 次に何をすべきか提示
- クラッシュさせない

#### 実務での対策

**エラーバウンダリ**

```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // エラーレポートサービスに送信
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>エラーが発生しました</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message}
          </Text>
          <Button
            title="再読み込み"
            onPress={() => {
              this.setState({ hasError: false });
              // アプリをリロード
            }}
          />
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

**ユーザーフレンドリーなエラーメッセージ**

```javascript
// ❌ 悪い例：技術的なメッセージをそのまま表示
catch (error) {
  Alert.alert('Error', error.message);
  // → "Network request failed at XMLHttpRequest.js:574"
}

// ✅ 良い例：分かりやすいメッセージ
catch (error) {
  let message = 'エラーが発生しました';

  if (error.message.includes('Network')) {
    message = 'インターネット接続を確認してください';
  } else if (error.response?.status === 401) {
    message = 'ログインし直してください';
  } else if (error.response?.status === 500) {
    message = 'サーバーエラーが発生しました。しばらくしてから再度お試しください';
  }

  Alert.alert('エラー', message, [
    { text: 'キャンセル', style: 'cancel' },
    { text: '再試行', onPress: () => retry() }
  ]);
}
```

**グローバルエラーハンドラ**

```javascript
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';

// JavaScriptエラー
setJSExceptionHandler((error, isFatal) => {
  console.log('JS Error:', error);

  if (isFatal) {
    Alert.alert(
      '予期しないエラー',
      'アプリを再起動してください',
      [{
        text: '再起動',
        onPress: () => {
          // アプリを再起動
          RNRestart.Restart();
        }
      }]
    );
  }
}, true);

// ネイティブエラー
setNativeExceptionHandler((errorString) => {
  console.log('Native Error:', errorString);
  // クラッシュレポートに送信
});
```

---

### 2.4 ローディング状態

#### なぜ重要か

「何も起きていない」とユーザーに思わせない。
- 処理中であることを示す
- 進捗を可視化
- キャンセル可能にする

#### 実務での対策

**適切なローディング表示**

```javascript
// ❌ 悪い例：何も表示しない
const handleSubmit = async () => {
  await submitForm();  // ユーザーは「押したのに反応ない」と思う
};

// ✅ 良い例：ローディング表示
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await submitForm();
  } finally {
    setIsSubmitting(false);
  }
};

<Button
  title="送信"
  onPress={handleSubmit}
  disabled={isSubmitting}
/>
{isSubmitting && <ActivityIndicator />}
```

**プログレスバー**

```javascript
import * as FileSystem from 'expo-file-system';

const [progress, setProgress] = useState(0);

const downloadFile = async () => {
  const callback = downloadProgress => {
    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
    setProgress(progress);
  };

  const downloadResumable = FileSystem.createDownloadResumable(
    'https://example.com/large-file.zip',
    FileSystem.documentDirectory + 'file.zip',
    {},
    callback
  );

  const { uri } = await downloadResumable.downloadAsync();
};

<ProgressBar progress={progress} />
<Text>{Math.round(progress * 100)}%</Text>
```

**Pull to Refresh**

```javascript
import { RefreshControl } from 'react-native';

const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  try {
    await fetchNewData();
  } finally {
    setRefreshing(false);
  }
};

<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }
>
  <Content />
</ScrollView>
```

---

## 3. セキュリティ

### 3.1 認証・認可

#### なぜ重要か

ユーザーデータを守る責任があります。
- 不正アクセス防止
- なりすまし防止
- データ漏洩防止

#### 実務での対策

**トークンの安全な保存**

```javascript
// ❌ 悪い例：AsyncStorageに平文で保存
await AsyncStorage.setItem('auth_token', token);

// ✅ 良い例：Secure Storageを使う
import * as SecureStore from 'expo-secure-store';

// 保存（暗号化される）
await SecureStore.setItemAsync('auth_token', token);

// 取得
const token = await SecureStore.getItemAsync('auth_token');
```

**トークンのリフレッシュ**

```javascript
// アクセストークン（短命：15分）
// リフレッシュトークン（長命：30日）

async function apiRequest(url) {
  let token = await SecureStore.getItemAsync('access_token');

  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (response.status === 401) {
    // トークンが期限切れ → リフレッシュ
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    const newToken = await refreshAccessToken(refreshToken);

    await SecureStore.setItemAsync('access_token', newToken);

    // リトライ
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${newToken}` }
    });
  }

  return response;
}
```

**生体認証**

```javascript
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateUser() {
  // デバイスが対応しているか確認
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return false;
  }

  // 生体認証が登録されているか
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    Alert.alert('生体認証が未登録', '設定から登録してください');
    return false;
  }

  // 認証実行
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'ログインするには認証してください',
    fallbackLabel: 'パスワードを使用',
  });

  return result.success;
}
```

---

### 3.2 データ暗号化

#### なぜ重要か

**機密データは暗号化**して保存する必要があります。
- クレジットカード情報
- 個人情報
- 医療データ

#### 実務での対策

**通信の暗号化（HTTPS）**

```javascript
// ❌ 絶対にダメ：HTTPを使う
const API_URL = 'http://api.example.com';

// ✅ 必ずHTTPSを使う
const API_URL = 'https://api.example.com';

// SSL Pinning（中間者攻撃対策）
// react-native-ssl-pinning を使う
```

**ローカルデータの暗号化**

```javascript
import CryptoJS from 'crypto-js';

// 暗号化
function encryptData(data, secretKey) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

// 復号化
function decryptData(encryptedData, secretKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// 使い方
const secretKey = await SecureStore.getItemAsync('encryption_key');
const encrypted = encryptData(sensitiveData, secretKey);
await AsyncStorage.setItem('sensitive_data', encrypted);
```

---

### 3.3 APIキーの管理

#### なぜ重要か

APIキーがコードに埋め込まれていると：
- GitHub に公開 → 悪用される
- リバースエンジニアリング → 抽出される
- 不正利用 → 高額請求

#### 実務での対策

**環境変数を使う**

```javascript
// ❌ 絶対にダメ：コードに直接書く
const GOOGLE_MAPS_API_KEY = 'AIzaSyXXXXXXXXXXXXXXX';

// ✅ 環境変数を使う
// .env
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXX

// app.config.js
export default {
  expo: {
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    }
  }
};

// ✅ さらに良い：サーバー経由
// APIキーはサーバー側で管理
// アプリ → サーバー → Google Maps API
```

**.gitignore に追加**

```
# .gitignore
.env
.env.local
.env.production
google-services.json
GoogleService-Info.plist
```

---

## 4. プラットフォーム対応

### 4.1 iOS/Androidの違い

#### なぜ重要か

同じコードでも**OSごとに動作が異なる**ことがあります。

#### 実務での対策

**UI/UXの違いを尊重**

```javascript
import { Platform } from 'react-native';

// ボタンのデザイン
const buttonStyle = Platform.select({
  ios: {
    backgroundColor: '#007AFF',  // iOS標準の青
    borderRadius: 8,
  },
  android: {
    backgroundColor: '#2196F3',  // Material Design
    borderRadius: 4,
    elevation: 2,
  },
});

// 戻るボタンの挙動（Androidのみ）
useEffect(() => {
  if (Platform.OS === 'android') {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // カスタム処理
      return true;
    });

    return () => backHandler.remove();
  }
}, []);
```

**通知の違い**

```javascript
// iOS: 常に権限が必要
// Android: 権限不要（Android 12以前）、必要（Android 13以降）

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

async function registerForPushNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('通知の権限が必要です');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
```

---

### 4.2 画面サイズ対応

#### なぜ重要か

スマホの画面サイズは**非常に多様**です。
- iPhone SE: 4.7インチ
- iPhone 15 Pro Max: 6.7インチ
- iPad: 10〜12インチ
- Android: 無数のサイズ

#### 実務での対策

**レスポンシブデザイン**

```javascript
import { Dimensions, useWindowDimensions } from 'react-native';

// 方法1: Dimensions（初期値のみ）
const { width, height } = Dimensions.get('window');

// 方法2: useWindowDimensions（動的に更新）
function MyComponent() {
  const { width, height } = useWindowDimensions();

  const numColumns = width > 600 ? 3 : 2;  // タブレットなら3列

  return (
    <FlatList
      data={items}
      numColumns={numColumns}
      renderItem={...}
    />
  );
}
```

**SafeAreaView の使用**

```javascript
import { SafeAreaView } from 'react-native-safe-area-context';

// iPhone X 以降のノッチ、ホームインジケーターを避ける
function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Content />
    </SafeAreaView>
  );
}
```

**相対的なサイズ指定**

```javascript
// ❌ 固定値
const styles = StyleSheet.create({
  title: {
    fontSize: 24,  // 小さい画面では大きすぎる
  }
});

// ✅ 画面サイズに応じて調整
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const scale = width / 375;  // iPhone SE基準

function normalize(size) {
  return Math.round(size * scale);
}

const styles = StyleSheet.create({
  title: {
    fontSize: normalize(24),
  }
});
```

---

## 5. データ管理

### 5.1 キャッシング戦略

#### なぜ重要か

**ネットワークリクエストは遅く、コストがかかります**。
- サーバー負荷
- 通信費用
- ユーザー体験

#### 実務での対策

**React Query（推奨）**

```javascript
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5分間はキャッシュを使う
      cacheTime: 10 * 60 * 1000, // 10分間メモリに保持
      retry: 2,                  // 失敗時2回リトライ
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}

// 使い方
function UserProfile({ userId }) {
  const { data, isLoading, error } = useQuery(
    ['user', userId],
    () => fetchUser(userId),
    {
      staleTime: 10 * 60 * 1000,  // このデータは10分間新鮮
    }
  );

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return <Profile user={data} />;
}
```

**永続化キャッシュ**

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24,  // 24時間
});
```

---

### 5.2 データ同期

#### なぜ重要か

複数デバイス間でデータを同期する必要があります。
- iPhone と iPad
- 機種変更
- バックアップ・復元

#### 実務での対策

**楽観的更新 + 同期**

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function TodoList() {
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newTodo) => api.createTodo(newTodo),
    {
      // 楽観的更新
      onMutate: async (newTodo) => {
        // 進行中のクエリをキャンセル
        await queryClient.cancelQueries(['todos']);

        // 以前のデータを保存
        const previousTodos = queryClient.getQueryData(['todos']);

        // 楽観的に更新
        queryClient.setQueryData(['todos'], old => [...old, newTodo]);

        return { previousTodos };
      },

      // エラー時はロールバック
      onError: (err, newTodo, context) => {
        queryClient.setQueryData(['todos'], context.previousTodos);
      },

      // 成功時はサーバーデータで上書き
      onSuccess: () => {
        queryClient.invalidateQueries(['todos']);
      },
    }
  );

  return <TodoListUI mutation={mutation} />;
}
```

**競合解決**

```javascript
// Last Write Wins（最後の書き込みが勝つ）
// シンプルだが、データロスの可能性あり

// Conflict Resolution（競合検出・解決）
async function syncData() {
  const localData = await getLocalData();
  const serverData = await getServerData();

  if (localData.version !== serverData.version) {
    // 競合発生
    const resolution = await resolveConflict(localData, serverData);
    await saveData(resolution);
  }
}
```

---

## 6. アクセシビリティ

### 6.1 スクリーンリーダー対応

#### なぜ重要か

視覚障害者もアプリを使います。
- **法的義務**（米国: ADA、EU: EAA、日本: 障害者差別解消法）
- App Store審査で要求されることも
- ユーザー層の拡大

#### 実務での対策

**基本的なアクセシビリティ**

```javascript
// ボタン
<TouchableOpacity
  accessible={true}
  accessibilityLabel="いいね"
  accessibilityHint="このポストにいいねします"
  accessibilityRole="button"
  onPress={handleLike}
>
  <Icon name="heart" />
</TouchableOpacity>

// 画像
<Image
  source={require('./photo.jpg')}
  accessible={true}
  accessibilityLabel="富士山の写真"
/>

// 入力フィールド
<TextInput
  accessible={true}
  accessibilityLabel="メールアドレス"
  accessibilityHint="ログインに使用するメールアドレスを入力してください"
  placeholder="email@example.com"
/>
```

**動的なコンテンツ**

```javascript
// 状態が変わったことを通知
import { AccessibilityInfo } from 'react-native';

const handleLike = () => {
  setLiked(true);
  AccessibilityInfo.announceForAccessibility('いいねしました');
};

// ローディング状態
<View accessibilityLiveRegion="polite">
  {isLoading ? (
    <Text accessible={true}>読み込み中...</Text>
  ) : (
    <Content />
  )}
</View>
```

---

### 6.2 カラーコントラスト

#### なぜ重要か

**WCAG 2.1**（Web Content Accessibility Guidelines）基準：
- テキスト: 4.5:1以上
- 大きなテキスト: 3:1以上

#### 実務での対策

```javascript
// ❌ 悪い例：コントラスト不足
const styles = StyleSheet.create({
  text: {
    color: '#CCCCCC',  // 薄いグレー
    backgroundColor: '#FFFFFF',  // 白背景
    // コントラスト比: 1.6:1 → 読みにくい
  }
});

// ✅ 良い例：十分なコントラスト
const styles = StyleSheet.create({
  text: {
    color: '#333333',  // 濃いグレー
    backgroundColor: '#FFFFFF',
    // コントラスト比: 12.6:1 → 読みやすい
  }
});
```

**ツール:**
- https://webaim.org/resources/contrastchecker/
- Figmaのプラグイン

---

### 6.3 フォントサイズ

#### 実務での対策

```javascript
import { PixelRatio, Platform } from 'react-native';

// ユーザーの設定を尊重
import { Text } from 'react-native';

// デフォルトのTextコンポーネントを上書き
const CustomText = ({ style, ...props }) => {
  return (
    <Text
      style={[style, { fontSize: style?.fontSize || 16 }]}
      allowFontScaling={true}  // システムのフォントサイズ設定を適用
      {...props}
    />
  );
};
```

---

## 7. テスト戦略

### 7.1 ユニットテスト

#### なぜ重要か

**個々の関数・コンポーネントが正しく動作する**ことを保証。
- バグの早期発見
- リファクタリングの安全性
- ドキュメント代わり

#### 実務での対策

**Jest + React Native Testing Library**

```javascript
// utils/formatDate.test.js
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('日付を正しくフォーマットする', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('2024年1月15日');
  });

  it('不正な日付はエラーを返す', () => {
    expect(() => formatDate('invalid')).toThrow();
  });
});
```

**コンポーネントのテスト**

```javascript
// Button.test.js
import { render, fireEvent } from '@testing-library/react-native';
import Button from './Button';

describe('Button', () => {
  it('タップ時にonPressが呼ばれる', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="押してね" onPress={onPress} />
    );

    fireEvent.press(getByText('押してね'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled時はタップできない', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="押してね" onPress={onPress} disabled={true} />
    );

    fireEvent.press(getByText('押してね'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

**カバレッジ目標**

```bash
npm test -- --coverage

# 目標:
# - Statements: 80%以上
# - Branches: 75%以上
# - Functions: 80%以上
# - Lines: 80%以上
```

---

### 7.2 E2Eテスト

#### なぜ重要か

**実際のユーザー操作をシミュレート**して、アプリ全体が動作することを確認。

#### 実務での対策

**Detox**

```javascript
// e2e/firstTest.e2e.js
describe('ログインフロー', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('ログインできる', async () => {
    // メールアドレス入力
    await element(by.id('email-input')).typeText('test@example.com');

    // パスワード入力
    await element(by.id('password-input')).typeText('password123');

    // ログインボタンをタップ
    await element(by.id('login-button')).tap();

    // ホーム画面が表示されることを確認
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

**実行**

```bash
# iOS
detox test --configuration ios.sim.debug

# Android
detox test --configuration android.emu.debug
```

---

## 8. リリース管理

### 8.1 バージョニング

#### なぜ重要か

**セマンティックバージョニング**で変更の大きさを伝える。

#### 実務での対策

```
major.minor.patch

例: 1.2.3
- major (1): 破壊的変更（API変更、データ構造変更）
- minor (2): 新機能追加（後方互換性あり）
- patch (3): バグ修正
```

**app.json**

```json
{
  "expo": {
    "version": "1.2.3",
    "ios": {
      "buildNumber": "10"  // ビルドごとに増やす
    },
    "android": {
      "versionCode": 10    // ビルドごとに増やす
    }
  }
}
```

**自動化**

```bash
# package.json
{
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor",
    "version:major": "npm version major"
  }
}

npm run version:patch  # 1.2.3 → 1.2.4
```

---

### 8.2 段階的ロールアウト

#### なぜ重要か

**いきなり全ユーザーにリリースするとリスクが高い**。
- 致命的なバグがあったら？
- サーバーがダウンしたら？

#### 実務での対策

**Google Play: 段階的公開**

```
1日目: 5%のユーザー
2日目: 10%
3日目: 20%
4日目: 50%
5日目: 100%

問題があれば即座に停止できる
```

**iOS: TestFlight → App Store**

```
1. TestFlight で内部テスト（開発チーム）
2. TestFlight で外部テスト（ベータテスター）
3. App Store で段階的リリース（手動リリースを選択）
```

**機能フラグ**

```javascript
// Firebase Remote Config
import remoteConfig from '@react-native-firebase/remote-config';

// 新機能をフラグで制御
const isNewFeatureEnabled = remoteConfig().getValue('new_feature_enabled').asBoolean();

{isNewFeatureEnabled && <NewFeature />}

// サーバー側で即座にON/OFFできる
```

---

### 8.3 リリースノート

#### なぜ重要か

ユーザーに**何が変わったか**伝える。
- 新機能の発見
- バグ修正の確認
- 信頼感の向上

#### 実務での対策

**良いリリースノートの例**

```markdown
バージョン 2.3.0

新機能:
- カレンダー表示機能を追加しました
- ダークモードに対応しました

改善:
- 起動速度が20%向上しました
- 検索機能が高速化しました

バグ修正:
- 通知が届かない問題を修正しました
- クラッシュする問題を修正しました
```

**悪い例**

```
バグ修正とパフォーマンス改善
```

---

## 9. 監視・分析

### 9.1 クラッシュレポート

#### なぜ重要か

**ユーザーのアプリがクラッシュしたら、すぐに知る**必要があります。

#### 実務での対策

**Sentry**

```bash
npx expo install sentry-expo
```

```javascript
// App.js
import * as Sentry from 'sentry-expo';

Sentry.init({
  dsn: 'https://xxxxx@sentry.io/xxxxx',
  enableInExpoDevelopment: false,  // 開発時は無効
  debug: __DEV__,
});

// 手動でエラーを送信
try {
  riskyFunction();
} catch (error) {
  Sentry.captureException(error);
}
```

**Firebase Crashlytics**

```bash
npx expo install @react-native-firebase/app @react-native-firebase/crashlytics
```

```javascript
import crashlytics from '@react-native-firebase/crashlytics';

// クラッシュレポートに追加情報
crashlytics().setAttribute('user_id', userId);
crashlytics().setUserId(userId);

// カスタムログ
crashlytics().log('User clicked the button');

// 手動でエラーを記録
crashlytics().recordError(error);
```

---

### 9.2 アナリティクス

#### なぜ重要か

**ユーザーがアプリをどう使っているか**を知る。
- 人気の機能
- 離脱ポイント
- ユーザー属性

#### 実務での対策

**Firebase Analytics**

```javascript
import analytics from '@react-native-firebase/analytics';

// 画面遷移
await analytics().logScreenView({
  screen_name: 'HomeScreen',
  screen_class: 'HomeScreen',
});

// イベント
await analytics().logEvent('add_to_cart', {
  item_id: 'SKU_12345',
  item_name: 'Product Name',
  price: 9.99,
});

// ユーザープロパティ
await analytics().setUserProperty('account_type', 'premium');
```

**追跡すべきイベント**

```javascript
// ビジネスKPI
- ユーザー登録
- 購入完了
- サブスクリプション開始

// エンゲージメント
- アプリ起動
- セッション時間
- 画面遷移

// 機能利用
- 検索実行
- フィルタ使用
- シェア

// エラー
- API失敗
- タイムアウト
- ユーザー操作エラー
```

---

### 9.3 パフォーマンスモニタリング

#### 実務での対策

**Firebase Performance Monitoring**

```javascript
import perf from '@react-native-firebase/perf';

// API呼び出しのトレース
const trace = await perf().startTrace('api_call');
await fetchData();
await trace.stop();

// カスタムメトリクス
trace.putMetric('items_count', itemsCount);
trace.putAttribute('user_type', 'premium');

// 自動トレース（ネットワークリクエスト）
// 自動的に記録される
```

**監視する指標**

```
- アプリ起動時間: <2秒
- 画面遷移: <300ms
- API応答時間: <1秒
- FPS: 55以上（60が理想）
- メモリ使用量: <200MB
```

---

## 10. 規約・法的要件

### 10.1 プライバシーポリシー

#### なぜ重要か

**法的に必須**です。
- GDPR（EU）
- CCPA（カリフォルニア州）
- 個人情報保護法（日本）
- App Store / Google Play の要件

#### 実務での対策

**必須項目**

```markdown
1. 収集する情報
   - 個人情報（名前、メール、電話番号）
   - 位置情報
   - デバイス情報
   - 利用状況

2. 情報の使用目的
   - サービス提供
   - 機能改善
   - マーケティング

3. 第三者提供
   - 分析ツール（Google Analytics）
   - 広告（AdMob）
   - クラッシュレポート（Sentry）

4. データ保持期間

5. ユーザーの権利
   - データの閲覧・修正・削除

6. 問い合わせ先
```

**アプリ内に表示**

```javascript
<TouchableOpacity
  onPress={() => Linking.openURL('https://yourapp.com/privacy')}
>
  <Text>プライバシーポリシー</Text>
</TouchableOpacity>
```

---

### 10.2 利用規約

#### 実務での対策

**必須項目**

```markdown
1. サービス内容
2. 禁止事項
3. 免責事項
4. サービスの変更・終了
5. 知的財産権
6. 準拠法・管轄裁判所
```

---

### 10.3 App Store / Google Play ガイドライン

#### 実務での対策

**App Store Review Guidelines**

よくリジェクトされる理由:
```
- クラッシュする
- 説明と異なる機能
- プライバシーポリシーがない
- 課金説明が不明確
- 未完成
- 権限の説明が不十分
```

**Google Play Developer Policy**

よくリジェクトされる理由:
```
- 危険な権限の不適切使用
- 誤解を招くコンテンツ
- 著作権侵害
- 子供向けアプリの要件違反
```

---

## 11. チーム開発

### 11.1 コーディング規約

#### なぜ重要か

チーム全員が**同じスタイル**で書くことで：
- コードレビューが楽
- 可読性向上
- バグ減少

#### 実務での対策

**ESLint + Prettier**

```bash
npx expo install --dev eslint prettier eslint-config-prettier
```

```json
// .eslintrc.json
{
  "extends": [
    "expo",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "react/prop-types": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

**自動整形**

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

### 11.2 Git運用

#### 実務での対策

**ブランチ戦略**

```
main: 本番環境
  ├─ develop: 開発環境
  │   ├─ feature/user-profile
  │   ├─ feature/payment
  │   └─ bugfix/login-error
  └─ hotfix/critical-bug
```

**コミットメッセージ規約**

```
<type>: <subject>

[body]

type:
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: コードスタイル（動作に影響なし）
- refactor: リファクタリング
- test: テスト追加
- chore: ビルドプロセスなど

例:
feat: カレンダー表示機能を追加

ユーザーが過去の記録をカレンダー形式で
閲覧できるようにしました。
```

**Pull Request**

```markdown
## 変更内容
- 機能Aを追加
- バグBを修正

## テスト方法
1. ログイン
2. 設定画面を開く
3. カレンダーが表示されることを確認

## スクリーンショット
（画像）

## チェックリスト
- [ ] テスト追加
- [ ] ドキュメント更新
- [ ] iOS/Android 両方で動作確認
```

---

## 12. コスト・運用

### 12.1 サーバーコスト

#### なぜ重要か

**ユーザーが増えるとコストが急増**します。

#### 実務での対策

**API呼び出しの最適化**

```javascript
// ❌ 悪い例：リスト内で個別にAPI呼び出し
{users.map(user => (
  <UserItem userId={user.id} />  // それぞれがAPI呼び出し
))}

// ✅ 良い例：一括取得
const users = await api.getUsers(userIds);
{users.map(user => (
  <UserItem user={user} />
))}
```

**画像最適化**

```javascript
// CDNでリサイズ済み画像を配信
const imageUrl = `https://cdn.example.com/images/${imageId}_${width}x${height}.jpg`;

// または Expo Image で自動最適化
import { Image } from 'expo-image';

<Image
  source={{ uri: originalUrl }}
  style={{ width: 100, height: 100 }}
  contentFit="cover"
  // 自動的にリサイズリクエスト
/>
```

---

### 12.2 運用コスト

#### 実務での対策

**監視の自動化**

```javascript
// 定期的なヘルスチェック
// → サーバーダウンを即座に検知

// アラート設定
// - クラッシュ率が1%を超えたら通知
// - API応答時間が3秒を超えたら通知
// - アクティブユーザーが50%減ったら通知
```

**自動化ツール**

```bash
# CI/CD（GitHub Actions）
- コミット時に自動テスト
- main ブランチへのマージで自動デプロイ
- 定期的なセキュリティスキャン

# 自動化の例
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm test
      - run: npm run lint
```

---

## 📋 本番リリースチェックリスト

最後に、実務で使える総合チェックリストです。

### リリース前（必須）

#### パフォーマンス
- [ ] 起動時間 < 2秒
- [ ] メモリリーク確認済み
- [ ] 60fps維持（スクロール、アニメーション）
- [ ] 大きな画像は最適化済み

#### ユーザー体験
- [ ] すべてのローディング状態に表示がある
- [ ] オフライン時の動作確認済み
- [ ] エラーメッセージが分かりやすい
- [ ] 全ての画面サイズでテスト済み

#### セキュリティ
- [ ] APIキーが環境変数化されている
- [ ] HTTPS通信のみ
- [ ] 認証トークンは SecureStore に保存
- [ ] 個人情報は暗号化されている

#### プラットフォーム
- [ ] iOS実機でテスト済み
- [ ] Android実機でテスト済み
- [ ] タブレットでテスト済み（対応する場合）
- [ ] iOS/Android両方の権限が正しく設定されている

#### 法的要件
- [ ] プライバシーポリシーがある
- [ ] 利用規約がある
- [ ] 必要な権限の説明文が適切
- [ ] App Store / Google Play ガイドラインに準拠

#### テスト
- [ ] ユニットテストカバレッジ 80%以上
- [ ] E2Eテストで主要フローをカバー
- [ ] TestFlightでベータテスト済み（iOS）
- [ ] Internal Testingでテスト済み（Android）

#### 監視
- [ ] クラッシュレポート設定済み（Sentry / Crashlytics）
- [ ] アナリティクス設定済み（Firebase Analytics）
- [ ] パフォーマンス監視設定済み

#### リリース準備
- [ ] バージョン番号を更新
- [ ] リリースノート作成
- [ ] スクリーンショット準備（各サイズ）
- [ ] アプリアイコン・スプラッシュスクリーン確認

---

## 🎓 まとめ

実務でのスマホアプリ開発は、**コードを書くだけでは終わりません**。

### 重要な3つの視点

1. **ユーザー視点**
   - 使いやすいか
   - 速いか
   - 分かりやすいか

2. **ビジネス視点**
   - コストは適切か
   - スケールするか
   - 収益につながるか

3. **エンジニア視点**
   - 保守しやすいか
   - テストできるか
   - 拡張しやすいか

この3つのバランスを取ることが、**プロの開発者**の役割です。

---

## 📚 参考リンク

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Expo Best Practices](https://docs.expo.dev/workflow/overview/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)

---

**このチェックリストを使って、プロダクションレディなアプリを作りましょう！**

