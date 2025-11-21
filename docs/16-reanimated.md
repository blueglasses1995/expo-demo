# React Native Reanimated 3 - 高性能アニメーション完全ガイド

## 📋 目次

1. [Reanimated 3とは](#1-reanimated-3とは)
2. [技術的原理](#2-技術的原理)
3. [セットアップ](#3-セットアップ)
4. [機能一覧](#4-機能一覧)
5. [各機能の詳細](#5-各機能の詳細)
6. [実践例](#6-実践例)
7. [パフォーマンス最適化](#7-パフォーマンス最適化)
8. [Animated API との比較](#8-animated-api-との比較)

---

## 1. Reanimated 3とは

**React Native Reanimated** は、React Nativeで**60FPS以上の滑らかなアニメーション**を実現するライブラリです。

### 主な特徴

- ⚡ **UIスレッドで実行**: JavaScriptスレッドをブロックしない
- 🎯 **Worklets**: JavaScriptコードをネイティブ側で実行
- 📐 **Layout Animations**: レイアウト変更を自動でアニメーション
- 🎨 **Shared Values**: スレッド間で値を共有
- 🖐️ **Gesture Handler統合**: スワイプ、ピンチなどのジェスチャー対応
- 🔧 **Spring/Timing**: 物理ベースのアニメーション

### なぜReanimatedを使うのか？

**従来のAnimated APIの問題:**
- JavaScriptスレッドで実行されるため、重い処理があるとカクつく
- 60FPSを維持するのが難しい
- ジェスチャー処理が遅延する

**Reanimatedの解決策:**
- UIスレッドで直接実行されるため、常に滑らか
- JavaScriptスレッドの影響を受けない
- ネイティブと同等のパフォーマンス

---

## 2. 技術的原理

### アーキテクチャ図

```
┌──────────────────────────────────────────────────┐
│  JavaScript Thread                                │
│  - React コンポーネント                            │
│  - useAnimatedStyle()                             │
│  - useSharedValue()                               │
└────────────────┬─────────────────────────────────┘
                 │
                 │ Shared Values (高速同期)
                 │
┌────────────────▼─────────────────────────────────┐
│  UI Thread (ネイティブ側)                         │
│  - Worklets (JavaScriptコード)                   │
│  - アニメーション実行                              │
│  - 画面更新                                       │
└──────────────────────────────────────────────────┘
```

### Worklets とは？

**Worklets** は、JavaScriptの関数をUIスレッドで実行できる仕組みです。

```typescript
// 'worklet'; ディレクティブで Worklet として実行される
function myWorklet(value: number) {
  'worklet';
  return value * 2;
}

// または、useAnimatedStyle の中は自動的に Worklet
useAnimatedStyle(() => {
  // このコードはUIスレッドで実行される
  return {
    transform: [{ translateX: sharedValue.value }],
  };
});
```

### Shared Values

**Shared Values** は、JavaScriptスレッドとUIスレッド間で値を共有する仕組みです。

```
JavaScript Thread          UI Thread
      │                        │
      │  sharedValue.value = 100
      ├───────────────────────►│
      │                        │ アニメーション実行
      │                        │ transform: translateX(100)
      │                        │
```

### Reanimated 2 vs 3

| | Reanimated 2 | Reanimated 3 |
|---|--------------|---------------|
| Layout Animations | 基本的 | 強化版 |
| Shared Element Transitions | ❌ | ✅ |
| React Native New Architecture | 部分的 | 完全対応 |
| パフォーマンス | 高速 | さらに高速 |
| API | 複雑 | シンプル化 |

---

## 3. セットアップ

### Expo プロジェクトでのインストール

```bash
npx expo install react-native-reanimated
```

### 設定

**babel.config.js:**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin は最後に配置
      'react-native-reanimated/plugin',
    ],
  };
};
```

**重要:** Babelプラグインを追加したら、キャッシュをクリア:

```bash
npx expo start --clear
```

---

## 4. 機能一覧

### コア機能

1. **Shared Values**
   - `useSharedValue()` - アニメーション可能な値
   - `useDerivedValue()` - 計算された値
   - `useAnimatedReaction()` - 値の変更を監視

2. **アニメーションスタイル**
   - `useAnimatedStyle()` - アニメーション可能なスタイル
   - `useAnimatedProps()` - アニメーション可能なプロパティ

3. **アニメーション関数**
   - `withTiming()` - 時間ベースのアニメーション
   - `withSpring()` - バネ物理ベースのアニメーション
   - `withDecay()` - 減衰アニメーション
   - `withDelay()` - 遅延実行
   - `withRepeat()` - 繰り返し
   - `withSequence()` - 順次実行

4. **Layout Animations**
   - `Layout` - レイアウト変更のアニメーション
   - `FadeIn`, `FadeOut` - フェードイン/アウト
   - `SlideInLeft`, `SlideOutRight` - スライド
   - `ZoomIn`, `ZoomOut` - ズーム
   - カスタムアニメーション

5. **Gesture Handler 統合**
   - `useAnimatedGestureHandler()` (v2)
   - `useAnimatedScrollHandler()` - スクロールハンドラー

6. **Scroll View**
   - `useAnimatedScrollHandler()` - スクロール監視
   - `useScrollViewOffset()` - スクロール位置

---

## 5. 各機能の詳細

### 5.1 Shared Values

#### 基本的な使い方

```tsx
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Pressable } from 'react-native';

function AnimatedBox() {
  // Shared Value を作成
  const width = useSharedValue(100);

  // アニメーションスタイルを定義
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
    };
  });

  const handlePress = () => {
    // アニメーションで値を変更
    width.value = withSpring(width.value === 100 ? 200 : 100);
  };

  return (
    <>
      <Animated.View
        style={[
          { height: 100, backgroundColor: 'blue' },
          animatedStyle,
        ]}
      />
      <Pressable onPress={handlePress}>
        <Text>Toggle Width</Text>
      </Pressable>
    </>
  );
}
```

#### useDerivedValue

```tsx
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';

function DerivedExample() {
  const progress = useSharedValue(0);

  // progress から計算された値
  const width = useDerivedValue(() => {
    return progress.value * 200;
  });

  const backgroundColor = useDerivedValue(() => {
    return progress.value > 0.5 ? 'green' : 'blue';
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      backgroundColor: backgroundColor.value,
    };
  });

  return <Animated.View style={animatedStyle} />;
}
```

#### useAnimatedReaction

```tsx
import { useSharedValue, useAnimatedReaction } from 'react-native-reanimated';
import { runOnJS } from 'react-native-reanimated';

function ReactionExample() {
  const scrollY = useSharedValue(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // scrollY の変更を監視
  useAnimatedReaction(
    () => scrollY.value > 100,
    (result, previous) => {
      if (result !== previous) {
        // UIスレッドからJavaScriptスレッドへ
        runOnJS(setIsScrolled)(result);
      }
    }
  );

  return <Text>Scrolled: {isScrolled ? 'Yes' : 'No'}</Text>;
}
```

### 5.2 アニメーション関数

#### withTiming (時間ベース)

```tsx
import { withTiming, Easing } from 'react-native-reanimated';

// 基本的な使い方
opacity.value = withTiming(1, {
  duration: 300,
});

// イージング関数を指定
translateX.value = withTiming(100, {
  duration: 500,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
});

// コールバック
scale.value = withTiming(1.5, { duration: 200 }, (finished) => {
  'worklet';
  if (finished) {
    console.log('Animation finished!');
  }
});
```

#### withSpring (バネ物理)

```tsx
import { withSpring } from 'react-native-reanimated';

// デフォルト設定
translateY.value = withSpring(0);

// カスタム設定
scale.value = withSpring(1, {
  damping: 10,        // 減衰（低いほど弾む）
  stiffness: 100,     // 硬さ（高いほど速い）
  mass: 1,            // 質量（高いほど遅い）
  overshootClamping: false,  // オーバーシュートを許可
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
});
```

#### withDecay (慣性スクロール)

```tsx
import { withDecay } from 'react-native-reanimated';

// スワイプ後に慣性でスクロール
translateX.value = withDecay({
  velocity: velocityX.value,  // 初速度
  clamp: [0, -300],           // 範囲制限
  deceleration: 0.998,        // 減速率
});
```

#### withDelay (遅延)

```tsx
import { withDelay, withTiming } from 'react-native-reanimated';

// 1秒後にアニメーション開始
opacity.value = withDelay(1000, withTiming(1));
```

#### withRepeat (繰り返し)

```tsx
import { withRepeat, withTiming } from 'react-native-reanimated';

// 無限に繰り返し
rotation.value = withRepeat(
  withTiming(360, { duration: 1000 }),
  -1,      // -1 = 無限ループ
  true     // reverse = true（往復）
);

// 3回繰り返し
scale.value = withRepeat(
  withSpring(1.2),
  3,
  true
);
```

#### withSequence (順次実行)

```tsx
import { withSequence, withTiming, withSpring } from 'react-native-reanimated';

// アニメーションを順番に実行
scale.value = withSequence(
  withTiming(1.2, { duration: 200 }),
  withSpring(1),
  withTiming(0.8, { duration: 100 }),
  withSpring(1)
);
```

### 5.3 Layout Animations

Layout Animationsは、レイアウトの変更を自動的にアニメーション化します。

#### 基本的な使い方

```tsx
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

function LayoutAnimationExample() {
  const [items, setItems] = useState([1, 2, 3]);

  return (
    <View>
      {items.map((item) => (
        <Animated.View
          key={item}
          entering={FadeIn}       // 表示時
          exiting={FadeOut}       // 非表示時
          layout={Layout}         // 位置変更時
          style={{ padding: 20, backgroundColor: 'blue' }}
        >
          <Text>Item {item}</Text>
        </Animated.View>
      ))}
      <Button
        title="Add Item"
        onPress={() => setItems([...items, items.length + 1])}
      />
    </View>
  );
}
```

#### エントリーアニメーション

```tsx
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  ZoomIn,
  FlipInXDown,
  FlipInYLeft,
  BounceIn,
  LightSpeedInLeft,
} from 'react-native-reanimated';

// 基本的なフェードイン
<Animated.View entering={FadeIn}>

// 下からスライドイン
<Animated.View entering={SlideInDown}>

// カスタマイズ
<Animated.View
  entering={FadeInDown.duration(500).delay(200).springify()}
>

// イージングを指定
<Animated.View
  entering={SlideInLeft.duration(300).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
>
```

#### 退出アニメーション

```tsx
import Animated, {
  FadeOut,
  SlideOutRight,
  ZoomOut,
} from 'react-native-reanimated';

<Animated.View
  exiting={FadeOut.duration(300)}
>

<Animated.View
  exiting={SlideOutRight.springify()}
>
```

#### カスタムレイアウトアニメーション

```tsx
import Animated, { Layout, LinearTransition } from 'react-native-reanimated';

// デフォルト
<Animated.View layout={Layout}>

// カスタマイズ
<Animated.View
  layout={Layout.springify().damping(80).stiffness(200)}
>

// 線形遷移
<Animated.View layout={LinearTransition}>
```

### 5.4 スクロールアニメーション

#### useAnimatedScrollHandler

```tsx
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
} from 'react-native-reanimated';

function ScrollExample() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - scrollY.value / 100,
      transform: [
        { translateY: -scrollY.value * 0.5 },
      ],
    };
  });

  return (
    <>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text>Header</Text>
      </Animated.View>

      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        {/* コンテンツ */}
      </Animated.ScrollView>
    </>
  );
}
```

#### パララックス効果

```tsx
function ParallaxExample() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const imageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: scrollY.value * 0.5 },
      ],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: Math.min(scrollY.value / 200, 1),
    };
  });

  return (
    <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
      <Animated.Image
        source={{ uri: 'https://picsum.photos/400/300' }}
        style={[{ width: '100%', height: 300 }, imageStyle]}
      />
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, height: 300, backgroundColor: 'black' },
          overlayStyle,
        ]}
      />
      {/* コンテンツ */}
    </Animated.ScrollView>
  );
}
```

### 5.5 ジェスチャーとの統合

**Gesture Handlerとの組み合わせ（詳細は18-gesture-handler.mdで解説）:**

```tsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const context = useSharedValue({ x: 0, y: 0 });

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = {
        x: translateX.value,
        y: translateY.value,
      };
    })
    .onUpdate((event) => {
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
    })
    .onEnd(() => {
      // スナップバック
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          { width: 100, height: 100, backgroundColor: 'blue' },
          animatedStyle,
        ]}
      />
    </GestureDetector>
  );
}
```

---

## 6. 実践例

### 実例 1: フェードインカード

```tsx
import Animated, { FadeInDown } from 'react-native-reanimated';

function FadeInCard({ index, title, description }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
      <Text style={{ color: '#666' }}>{description}</Text>
    </Animated.View>
  );
}

// 使用例
{items.map((item, index) => (
  <FadeInCard
    key={item.id}
    index={index}
    title={item.title}
    description={item.description}
  />
))}
```

### 実例 2: 回転するローディングスピナー

```tsx
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

function Spinner() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1  // 無限ループ
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize: 48 }}>⚙️</Text>
    </Animated.View>
  );
}
```

### 実例 3: スワイプで削除

```tsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

function SwipeToDelete({ onDelete, children }) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(80);
  const opacity = useSharedValue(1);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.max(event.translationX, -200);
    })
    .onEnd((event) => {
      if (translateX.value < -100) {
        // 削除アニメーション
        translateX.value = withTiming(-500, { duration: 200 });
        itemHeight.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onDelete)();
        });
      } else {
        // 元に戻す
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      height: itemHeight.value,
      opacity: opacity.value,
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: Math.min(-translateX.value / 100, 1),
    };
  });

  return (
    <View style={{ position: 'relative' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 100,
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
          },
          deleteButtonStyle,
        ]}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>削除</Text>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

### 実例 4: プログレスバー

```tsx
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

function ProgressBar({ progress }) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 300 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value * 100}%`,
    };
  });

  return (
    <View style={{ height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
      <Animated.View
        style={[
          { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// 使用例
<ProgressBar progress={0.7} />  // 70%
```

---

## 7. パフォーマンス最適化

### Workletの使用

```tsx
// ✅ Good: Worklet として実行
const animatedStyle = useAnimatedStyle(() => {
  'worklet';
  const scale = interpolate(
    progress.value,
    [0, 1],
    [1, 1.5]
  );
  return { transform: [{ scale }] };
});

// ❌ Bad: JavaScript 関数を呼び出し
const calculateScale = (progress) => {
  return progress * 0.5 + 1;  // Worklet ではない
};

const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ scale: calculateScale(progress.value) }],  // エラー
  };
});
```

### runOnJS の使用

UIスレッドからJavaScriptの関数を呼び出す場合:

```tsx
import { runOnJS } from 'react-native-reanimated';

const animatedStyle = useAnimatedStyle(() => {
  if (progress.value > 0.9) {
    runOnJS(onComplete)();  // JavaScript関数を呼び出し
  }
  return { opacity: progress.value };
});
```

### メモ化

```tsx
import { useMemo } from 'react';

// ✅ Good: スタイルをメモ化
const staticStyle = useMemo(() => ({
  width: 100,
  height: 100,
  backgroundColor: 'blue',
}), []);

<Animated.View style={[staticStyle, animatedStyle]} />
```

---

## 8. Animated API との比較

### 従来のAnimated API

```tsx
import { Animated } from 'react-native';

const opacity = useRef(new Animated.Value(0)).current;

Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,
}).start();

<Animated.View style={{ opacity }} />
```

### Reanimated

```tsx
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const opacity = useSharedValue(0);

opacity.value = withTiming(1, { duration: 300 });

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));

<Animated.View style={animatedStyle} />
```

### 比較表

| | Animated API | Reanimated |
|---|--------------|------------|
| 実行場所 | JavaScriptスレッド | UIスレッド |
| パフォーマンス | 普通 | 非常に高速 |
| ジェスチャー対応 | 遅延あり | リアルタイム |
| Layout Animations | ❌ | ✅ |
| 学習曲線 | 低 | 中 |
| バンドルサイズ | 小 | 中 |

---

## 📚 参考リンク

- [Reanimated公式ドキュメント](https://docs.swmansion.com/react-native-reanimated/)
- [Reanimated GitHub](https://github.com/software-mansion/react-native-reanimated)
- [Reanimated Playground](https://reanimated-playground.com/)

---

**Next: [17-moti.md](./17-moti.md) - Motiの詳細**
