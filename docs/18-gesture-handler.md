# React Native Gesture Handler - ジェスチャー処理完全ガイド

## 📋 目次

1. [Gesture Handlerとは](#1-gesture-handlerとは)
2. [技術的原理](#2-技術的原理)
3. [セットアップ](#3-セットアップ)
4. [機能一覧](#4-機能一覧)
5. [各機能の詳細](#5-各機能の詳細)
6. [実践例](#6-実践例)
7. [パフォーマンス最適化](#7-パフォーマンス最適化)

---

## 1. Gesture Handlerとは

**React Native Gesture Handler** は、タッチジェスチャーをネイティブレベルで処理するライブラリです。

### 主な特徴

- ⚡ **ネイティブ処理**: UIスレッドで直接実行
- 🎯 **遅延ゼロ**: タッチ入力に即座に反応
- 🖐️ **多様なジェスチャー**: タップ、スワイプ、ピンチ、回転など
- 🔗 **Reanimated統合**: 滑らかなアニメーション
- 📱 **クロスプラットフォーム**: iOS/Android/Web対応
- 🎭 **同時ジェスチャー**: 複数のジェスチャーを同時処理

### なぜGesture Handlerを使うのか？

**React NativeのTouchableの問題:**
- JavaScriptスレッドで処理されるため遅延がある
- 複雑なジェスチャーの実装が困難
- スクロールとの競合が発生しやすい

**Gesture Handlerの解決策:**
- UIスレッドでネイティブ処理
- リアルタイムのジェスチャー認識
- Reanimatedと組み合わせて60FPS維持

---

## 2. 技術的原理

### アーキテクチャ図

```
┌──────────────────────────────────────────────────┐
│  User Touch Input                                 │
│  (タップ、スワイプ、ピンチ...)                     │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  UI Thread (ネイティブ側)                         │
│  - Gesture Handler がジェスチャーを認識            │
│  - Worklets を実行                                │
│  - Shared Values を更新                           │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  Reanimated                                       │
│  - アニメーションを実行                            │
│  - 画面を更新 (60FPS)                             │
└──────────────────────────────────────────────────┘
```

### Gesture Handler v1 vs v2

| | v1 (旧API) | v2 (新API) |
|---|------------|------------|
| API | useGestureHandler | Gesture オブジェクト |
| Reanimated統合 | 限定的 | 完全統合 |
| ジェスチャー合成 | 複雑 | シンプル |
| TypeScript | 部分的 | 完全サポート |
| パフォーマンス | 良い | 非常に良い |

**推奨: v2 API** (2024年以降)

---

## 3. セットアップ

### インストール

```bash
# Gesture Handler と Reanimated をインストール
npx expo install react-native-gesture-handler react-native-reanimated
```

### 設定

**babel.config.js:**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',  // 最後に配置
    ],
  };
};
```

### アプリのルートでラップ

**App.tsx または app/_layout.tsx:**

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* アプリのコンテンツ */}
    </GestureHandlerRootView>
  );
}
```

---

## 4. 機能一覧

### ジェスチャータイプ

1. **基本ジェスチャー**
   - `Tap` - タップ
   - `Pan` - ドラッグ
   - `LongPress` - 長押し

2. **回転・スケール**
   - `Pinch` - ピンチ（拡大縮小）
   - `Rotation` - 回転

3. **スワイプ**
   - `Fling` - フリング（勢いのあるスワイプ）

4. **ネイティブジェスチャー**
   - `Native` - ネイティブビューのジェスチャー

5. **合成ジェスチャー**
   - `Simultaneous` - 同時実行
   - `Exclusive` - 排他的実行
   - `Race` - 競合
   - `Sequential` - 順次実行

### コンポーネント

- `GestureDetector` - ジェスチャーを検出
- `GestureHandlerRootView` - ルートコンテナ

---

## 5. 各機能の詳細

### 5.1 Tap (タップ)

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function TapExample() {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.9);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
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

#### ダブルタップ

```tsx
const doubleTap = Gesture.Tap()
  .numberOfTaps(2)
  .onEnd(() => {
    console.log('Double tapped!');
  });
```

### 5.2 Pan (ドラッグ)

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
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
    .onEnd((event) => {
      // 速度を使って慣性スクロール
      translateX.value = withDecay({
        velocity: event.velocityX,
      });
      translateY.value = withDecay({
        velocity: event.velocityY,
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

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

#### 軸を制限

```tsx
// 横方向のみ
const panX = Gesture.Pan()
  .activeOffsetX([-10, 10])  // 横方向に10px動いたら開始
  .failOffsetY([-10, 10]);    // 縦方向に10px動いたらキャンセル

// 縦方向のみ
const panY = Gesture.Pan()
  .activeOffsetY([-10, 10])
  .failOffsetX([-10, 10]);
```

### 5.3 Pinch (ピンチ)

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

function PinchableImage() {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinch}>
      <Animated.Image
        source={{ uri: 'https://picsum.photos/300' }}
        style={[{ width: 300, height: 300 }, animatedStyle]}
      />
    </GestureDetector>
  );
}
```

### 5.4 Rotation (回転)

```tsx
function RotatableBox() {
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const rotate = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}rad` }],
  }));

  return (
    <GestureDetector gesture={rotate}>
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

### 5.5 LongPress (長押し)

```tsx
function LongPressExample() {
  const scale = useSharedValue(1);

  const longPress = Gesture.LongPress()
    .minDuration(500)  // 500ms 長押し
    .onStart(() => {
      scale.value = withSpring(1.2);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={longPress}>
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

### 5.6 合成ジェスチャー

#### 同時実行 (Simultaneous)

```tsx
// ピンチと回転を同時に実行
const pinch = Gesture.Pinch()
  .onUpdate((event) => {
    scale.value = savedScale.value * event.scale;
  });

const rotate = Gesture.Rotation()
  .onUpdate((event) => {
    rotation.value = savedRotation.value + event.rotation;
  });

const composed = Gesture.Simultaneous(pinch, rotate);

<GestureDetector gesture={composed}>
  <Animated.View style={animatedStyle} />
</GestureDetector>
```

#### 排他的実行 (Exclusive)

```tsx
// どちらか一方のみが実行される
const horizontal = Gesture.Pan()
  .activeOffsetX([-10, 10])
  .failOffsetY([-10, 10]);

const vertical = Gesture.Pan()
  .activeOffsetY([-10, 10])
  .failOffsetX([-10, 10]);

const composed = Gesture.Exclusive(horizontal, vertical);
```

#### 競合 (Race)

```tsx
// 最初に認識されたジェスチャーが勝つ
const tap = Gesture.Tap();
const longPress = Gesture.LongPress().minDuration(300);

const composed = Gesture.Race(tap, longPress);
```

### 5.7 高度な使用例

#### ドラッグ＆ピンチ＆回転

```tsx
function TransformableImage() {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const savedScale = useSharedValue(1);
  const savedRotation = useSharedValue(0);
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
    });

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotate = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const composed = Gesture.Simultaneous(pan, pinch, rotate);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.Image
        source={{ uri: 'https://picsum.photos/300' }}
        style={[{ width: 300, height: 300 }, animatedStyle]}
      />
    </GestureDetector>
  );
}
```

---

## 6. 実践例

### 実例 1: スワイプで削除可能なリストアイテム

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

function SwipeableListItem({ onDelete, children }) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(80);
  const opacity = useSharedValue(1);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // 左にしかスワイプできない
      translateX.value = Math.max(Math.min(event.translationX, 0), -200);
    })
    .onEnd(() => {
      if (translateX.value < -100) {
        // 削除
        translateX.value = withTiming(-500);
        itemHeight.value = withTiming(0);
        opacity.value = withTiming(0, {}, () => {
          runOnJS(onDelete)();
        });
      } else {
        // 元に戻す
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    height: itemHeight.value,
    opacity: opacity.value,
  }));

  const deleteButtonStyle = useAnimatedStyle(() => ({
    opacity: Math.min(-translateX.value / 100, 1),
  }));

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

### 実例 2: ボトムシート

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 50;

function BottomSheet() {
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(
        event.translationY + context.value.y,
        MAX_TRANSLATE_Y
      );
    })
    .onEnd((event) => {
      if (translateY.value > -SCREEN_HEIGHT / 3) {
        // 閉じる
        translateY.value = withSpring(0, { damping: 50 });
      } else if (translateY.value < -SCREEN_HEIGHT / 1.5) {
        // 全開
        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
      } else {
        // 半開
        translateY.value = withSpring(-SCREEN_HEIGHT / 2, { damping: 50 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <>
      {/* Backdrop */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
      }} />

      {/* Sheet */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: SCREEN_HEIGHT,
              left: 0,
              right: 0,
              height: SCREEN_HEIGHT,
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            },
            animatedStyle,
          ]}
        >
          <View style={{
            width: 40,
            height: 4,
            backgroundColor: '#ccc',
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 20,
          }} />
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            ボトムシート
          </Text>
          {/* コンテンツ */}
        </Animated.View>
      </GestureDetector>
    </>
  );
}
```

### 実例 3: カルーセル

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH * 0.7;
const SPACING = 10;

function Carousel({ items }) {
  const translateX = useSharedValue(0);
  const context = useSharedValue({ x: 0 });

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      translateX.value = context.value.x + event.translationX;
    })
    .onEnd((event) => {
      const snapPoint = Math.round(translateX.value / ITEM_WIDTH) * ITEM_WIDTH;
      const maxTranslate = 0;
      const minTranslate = -(items.length - 1) * ITEM_WIDTH;

      translateX.value = withSpring(
        Math.max(Math.min(snapPoint, maxTranslate), minTranslate)
      );
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={{ flexDirection: 'row' }}>
        {items.map((item, index) => {
          const animatedStyle = useAnimatedStyle(() => {
            const inputRange = [
              (index - 1) * ITEM_WIDTH,
              index * ITEM_WIDTH,
              (index + 1) * ITEM_WIDTH,
            ];

            const scale = interpolate(
              translateX.value,
              inputRange,
              [0.8, 1, 0.8]
            );

            const opacity = interpolate(
              translateX.value,
              inputRange,
              [0.5, 1, 0.5]
            );

            return {
              transform: [
                { translateX: translateX.value },
                { scale },
              ],
              opacity,
            };
          });

          return (
            <Animated.View
              key={item.id}
              style={[
                {
                  width: ITEM_WIDTH,
                  height: 200,
                  backgroundColor: 'blue',
                  borderRadius: 12,
                  marginHorizontal: SPACING,
                },
                animatedStyle,
              ]}
            >
              <Text style={{ color: 'white', fontSize: 24 }}>
                {item.title}
              </Text>
            </Animated.View>
          );
        })}
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 7. パフォーマンス最適化

### Workletの使用

すべてのコールバックは自動的にWorkletとして実行されますが、明示的に指定することも可能:

```tsx
const pan = Gesture.Pan()
  .onUpdate((event) => {
    'worklet';
    translateX.value = event.translationX;
  });
```

### runOnJSの使用

UIスレッドからJavaScript関数を呼び出す:

```tsx
const pan = Gesture.Pan()
  .onEnd(() => {
    runOnJS(console.log)('Gesture ended');
    runOnJS(onGestureEnd)();
  });
```

### メモ化

```tsx
// ✅ Good: ジェスチャーをメモ化
const pan = useMemo(
  () =>
    Gesture.Pan()
      .onUpdate((event) => {
        translateX.value = event.translationX;
      }),
  []
);
```

---

## 📚 参考リンク

- [Gesture Handler公式ドキュメント](https://docs.swmansion.com/react-native-gesture-handler/)
- [Gesture Handler GitHub](https://github.com/software-mansion/react-native-gesture-handler)
- [Gesture Handler Examples](https://github.com/software-mansion/react-native-gesture-handler/tree/main/example)

---

**Next: [19-skia.md](./19-skia.md) - React Native Skiaの詳細**
