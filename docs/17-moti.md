# Moti - 宣言的アニメーションライブラリ完全ガイド

## 📋 目次

1. [Motiとは](#1-motiとは)
2. [技術的原理](#2-技術的原理)
3. [セットアップ](#3-セットアップ)
4. [機能一覧](#4-機能一覧)
5. [各機能の詳細](#5-各機能の詳細)
6. [実践例](#6-実践例)
7. [ReanimatedとMotiの使い分け](#7-reanimatedとmotiの使い分け)

---

## 1. Motiとは

**Moti** は、**React Native Reanimated** の上に構築された**宣言的アニメーションライブラリ**です。

### 主な特徴

- 🎨 **シンプル**: Framer Motion風の直感的なAPI
- ⚡ **高パフォーマンス**: Reanimatedベースで60FPS
- 📝 **宣言的**: propsでアニメーションを定義
- 🎭 **アニメーション済みコンポーネント**: `<MotiView>`, `<MotiText>` など
- 🔄 **ループアニメーション**: `loop` プロパティで簡単に実装
- 🌈 **バリアント**: 名前付きアニメーション状態

### なぜMotiを使うのか？

**Reanimatedの問題:**
- APIが複雑（`useSharedValue`, `useAnimatedStyle`など）
- ボイラープレートが多い
- 学習曲線が急

**Motiの解決策:**
- シンプルなpropsベースのAPI
- 最小限のコード
- Webエンジニアに馴染みやすい（Framer Motion風）

---

## 2. 技術的原理

### アーキテクチャ図

```
┌──────────────────────────────────────────────────┐
│  Moti Components                                  │
│  <MotiView animate={{ scale: 1.5 }} />           │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  Moti Core                                        │
│  - Props → Shared Values への変換                │
│  - アニメーション設定の管理                        │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  React Native Reanimated                         │
│  - useSharedValue()                              │
│  - useAnimatedStyle()                            │
│  - withSpring(), withTiming()                    │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  UI Thread (60FPS)                                │
└──────────────────────────────────────────────────┘
```

### コード変換の例

#### Motiのコード:

```tsx
<MotiView
  from={{ opacity: 0, scale: 0.5 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'spring' }}
/>
```

#### 内部でReanimatedに変換:

```tsx
// Moti が内部で行う処理（簡略化）
const opacity = useSharedValue(0);
const scale = useSharedValue(0.5);

useEffect(() => {
  opacity.value = withSpring(1);
  scale.value = withSpring(1);
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [{ scale: scale.value }],
}));

<Animated.View style={animatedStyle} />
```

---

## 3. セットアップ

### インストール

```bash
# Reanimated が必要
npx expo install react-native-reanimated

# Moti をインストール
npm install moti
```

### 設定

**babel.config.js:**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',  // 必須
    ],
  };
};
```

---

## 4. 機能一覧

### コアコンポーネント

1. **基本コンポーネント**
   - `MotiView` - アニメーション可能なView
   - `MotiText` - アニメーション可能なText
   - `MotiImage` - アニメーション可能なImage
   - `MotiScrollView` - アニメーション可能なScrollView
   - `MotiPressable` - アニメーション可能なPressable

2. **Hooks**
   - `useDynamicAnimation()` - 動的にアニメーションを制御
   - `useAnimationState()` - 状態マシン的なアニメーション

3. **アニメーションプロパティ**
   - `from` - 初期状態
   - `animate` - 目標状態
   - `transition` - アニメーション設定
   - `exit` - 削除時のアニメーション
   - `exitTransition` - 削除時のアニメーション設定

4. **特殊機能**
   - `AnimatePresence` - マウント/アンマウント時のアニメーション
   - バリアント - 名前付きアニメーション状態
   - ループアニメーション

---

## 5. 各機能の詳細

### 5.1 基本的なアニメーション

#### MotiView

```tsx
import { MotiView } from 'moti';

function FadeInBox() {
  return (
    <MotiView
      from={{
        opacity: 0,
        scale: 0.5,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: 'timing',
        duration: 500,
      }}
      style={{
        width: 100,
        height: 100,
        backgroundColor: 'blue',
      }}
    />
  );
}
```

#### MotiText

```tsx
import { MotiText } from 'moti';

function AnimatedText() {
  return (
    <MotiText
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', delay: 300 }}
      style={{ fontSize: 24, fontWeight: 'bold' }}
    >
      Hello Moti!
    </MotiText>
  );
}
```

### 5.2 アニメーション設定

#### Timing (時間ベース)

```tsx
<MotiView
  animate={{ scale: 1.5 }}
  transition={{
    type: 'timing',
    duration: 500,
    delay: 200,
  }}
/>
```

#### Spring (バネ物理)

```tsx
<MotiView
  animate={{ scale: 1.5 }}
  transition={{
    type: 'spring',
    damping: 15,        // 減衰
    stiffness: 150,     // 硬さ
    mass: 1,            // 質量
  }}
/>
```

### 5.3 ループアニメーション

```tsx
import { MotiView } from 'moti';

function PulsingCircle() {
  return (
    <MotiView
      from={{
        scale: 1,
        opacity: 1,
      }}
      animate={{
        scale: 1.5,
        opacity: 0,
      }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,        // 無限ループ
        repeatReverse: false,
      }}
      style={{
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'blue',
      }}
    />
  );
}
```

#### リバース付きループ

```tsx
<MotiView
  from={{ rotate: '0deg' }}
  animate={{ rotate: '360deg' }}
  transition={{
    type: 'timing',
    duration: 2000,
    loop: true,
    repeatReverse: true,  // 往復
  }}
/>
```

### 5.4 インタラクティブアニメーション

#### プレス時のアニメーション

```tsx
import { MotiPressable } from 'moti/interactions';

function InteractiveButton() {
  return (
    <MotiPressable
      animate={({ pressed }) => {
        'worklet';
        return {
          scale: pressed ? 0.95 : 1,
        };
      }}
      transition={{
        type: 'spring',
      }}
      style={{
        padding: 16,
        backgroundColor: 'blue',
        borderRadius: 8,
      }}
    >
      <Text style={{ color: 'white' }}>Press me</Text>
    </MotiPressable>
  );
}
```

#### ホバー時のアニメーション（Web）

```tsx
import { MotiView } from 'moti';

function HoverCard() {
  return (
    <MotiView
      animate={({ hovered, pressed }) => {
        'worklet';

        return {
          scale: pressed ? 0.95 : hovered ? 1.05 : 1,
        };
      }}
      transition={{
        type: 'spring',
      }}
      style={{
        width: 200,
        height: 200,
        backgroundColor: 'blue',
      }}
    />
  );
}
```

### 5.5 useDynamicAnimation

動的にアニメーションを制御する場合:

```tsx
import { MotiView, useDynamicAnimation } from 'moti';
import { Button } from 'react-native';

function DynamicExample() {
  const animation = useDynamicAnimation(() => ({
    scale: 1,
    rotate: '0deg',
  }));

  const handlePress = () => {
    animation.animateTo({
      scale: 1.5,
      rotate: '180deg',
    });
  };

  const handleReset = () => {
    animation.animateTo({
      scale: 1,
      rotate: '0deg',
    });
  };

  return (
    <>
      <MotiView
        state={animation}
        transition={{
          type: 'spring',
        }}
        style={{
          width: 100,
          height: 100,
          backgroundColor: 'blue',
        }}
      />
      <Button title="Animate" onPress={handlePress} />
      <Button title="Reset" onPress={handleReset} />
    </>
  );
}
```

### 5.6 AnimatePresence

コンポーネントのマウント/アンマウント時にアニメーション:

```tsx
import { AnimatePresence, MotiView } from 'moti';
import { useState } from 'react';

function PresenceExample() {
  const [visible, setVisible] = useState(true);

  return (
    <>
      <Button
        title={visible ? 'Hide' : 'Show'}
        onPress={() => setVisible(!visible)}
      />

      <AnimatePresence>
        {visible && (
          <MotiView
            from={{
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
            }}
            transition={{
              type: 'spring',
            }}
            style={{
              width: 200,
              height: 200,
              backgroundColor: 'blue',
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
```

### 5.7 バリアント

名前付きのアニメーション状態を定義:

```tsx
import { MotiView } from 'moti';
import { useState } from 'react';

const variants = {
  default: {
    scale: 1,
    rotate: '0deg',
    backgroundColor: '#3b82f6',
  },
  active: {
    scale: 1.2,
    rotate: '90deg',
    backgroundColor: '#ef4444',
  },
  inactive: {
    scale: 0.8,
    rotate: '-90deg',
    backgroundColor: '#10b981',
  },
};

function VariantExample() {
  const [state, setState] = useState('default');

  return (
    <>
      <MotiView
        animate={state}
        variants={variants}
        transition={{
          type: 'spring',
        }}
        style={{
          width: 100,
          height: 100,
        }}
      />
      <Button title="Active" onPress={() => setState('active')} />
      <Button title="Inactive" onPress={() => setState('inactive')} />
      <Button title="Default" onPress={() => setState('default')} />
    </>
  );
}
```

### 5.8 ステージング（順次実行）

```tsx
import { MotiView } from 'moti';

function StaggredExample() {
  const items = [1, 2, 3, 4, 5];

  return (
    <View>
      {items.map((item, index) => (
        <MotiView
          key={item}
          from={{
            opacity: 0,
            translateX: -50,
          }}
          animate={{
            opacity: 1,
            translateX: 0,
          }}
          transition={{
            type: 'spring',
            delay: index * 100,  // 100msずつ遅延
          }}
          style={{
            padding: 16,
            backgroundColor: 'blue',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: 'white' }}>Item {item}</Text>
        </MotiView>
      ))}
    </View>
  );
}
```

---

## 6. 実践例

### 実例 1: ローディングドット

```tsx
import { MotiView } from 'moti';
import { View } from 'react-native';

function LoadingDots() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {[0, 1, 2].map((index) => (
        <MotiView
          key={index}
          from={{
            opacity: 0.3,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1.2,
          }}
          transition={{
            type: 'timing',
            duration: 500,
            delay: index * 150,
            loop: true,
            repeatReverse: true,
          }}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: '#3b82f6',
          }}
        />
      ))}
    </View>
  );
}
```

### 実例 2: スケルトンローディング

```tsx
import { MotiView } from 'moti';

function Skeleton({ width = '100%', height = 20, borderRadius = 4 }) {
  return (
    <MotiView
      from={{
        opacity: 0.5,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
        repeatReverse: true,
      }}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e0e0e0',
      }}
    />
  );
}

function SkeletonCard() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Skeleton width={100} height={100} borderRadius={50} />
      <Skeleton width="80%" height={20} />
      <Skeleton width="60%" height={16} />
      <Skeleton width="90%" height={16} />
    </View>
  );
}
```

### 実例 3: カウンターアニメーション

```tsx
import { MotiText } from 'moti';
import { useState, useEffect } from 'react';

function AnimatedCounter({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = (value - displayValue) / steps;
    let current = displayValue;

    const timer = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= value) ||
        (increment < 0 && current <= value)
      ) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <MotiText
      animate={{
        scale: displayValue !== value ? 1.2 : 1,
      }}
      transition={{
        type: 'spring',
      }}
      style={{
        fontSize: 48,
        fontWeight: 'bold',
        color: '#3b82f6',
      }}
    >
      {displayValue}
    </MotiText>
  );
}
```

### 実例 4: トースト通知

```tsx
import { MotiView } from 'moti';
import { AnimatePresence } from 'moti';
import { useState, useEffect } from 'react';

function Toast({ visible, message, onHide }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{
            opacity: 0,
            translateY: -100,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          exit={{
            opacity: 0,
            translateY: -100,
          }}
          transition={{
            type: 'spring',
          }}
          style={{
            position: 'absolute',
            top: 50,
            left: 20,
            right: 20,
            padding: 16,
            backgroundColor: '#10b981',
            borderRadius: 8,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>
            {message}
          </Text>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

// 使用例
function App() {
  const [toastVisible, setToastVisible] = useState(false);

  return (
    <>
      <Button
        title="Show Toast"
        onPress={() => setToastVisible(true)}
      />
      <Toast
        visible={toastVisible}
        message="操作が完了しました！"
        onHide={() => setToastVisible(false)}
      />
    </>
  );
}
```

### 実例 5: プログレスリング

```tsx
import { MotiView } from 'moti';
import { useEffect } from 'react';

function ProgressRing({ progress }) {
  return (
    <View style={{ width: 100, height: 100, position: 'relative' }}>
      {/* 背景 */}
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 8,
          borderColor: '#e0e0e0',
        }}
      />

      {/* プログレス */}
      <MotiView
        from={{
          rotate: '0deg',
        }}
        animate={{
          rotate: `${progress * 360}deg`,
        }}
        transition={{
          type: 'spring',
        }}
        style={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: 50,
          borderWidth: 8,
          borderColor: '#3b82f6',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
        }}
      />
    </View>
  );
}

// 使用例
<ProgressRing progress={0.75} />  // 75%
```

---

## 7. ReanimatedとMotiの使い分け

### 比較表

| | Reanimated | Moti |
|---|------------|------|
| 学習曲線 | 急 | 緩やか |
| コード量 | 多い | 少ない |
| カスタマイズ性 | 非常に高い | 中程度 |
| パフォーマンス | 最高 | 高い（Reanimatedベース） |
| ジェスチャー対応 | 完全 | 基本的 |
| 複雑なアニメーション | ✅ 得意 | ❌ 不向き |
| シンプルなアニメーション | ⚠️ オーバーキル | ✅ 最適 |

### 使い分けの基準

**Motiを使うべき場合:**
- ✅ シンプルなフェードイン/アウト
- ✅ スケール、回転などの基本的なアニメーション
- ✅ ループアニメーション
- ✅ 宣言的なコードを好む
- ✅ 学習コストを抑えたい

**Reanimatedを使うべき場合:**
- ✅ 複雑なジェスチャー処理（ドラッグ、スワイプ）
- ✅ パフォーマンスクリティカルな処理
- ✅ カスタムアニメーションロジック
- ✅ Shared Valuesの細かい制御が必要
- ✅ Layout Animationsの高度な使用

**両方を併用する:**
- シンプルな部分はMoti
- 複雑な部分はReanimated
- 同じプロジェクト内で混在可能

```tsx
// Moti でシンプルなアニメーション
<MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
  {/* Reanimated で複雑なジェスチャー */}
  <GestureDetector gesture={panGesture}>
    <Animated.View style={animatedStyle}>
      {/* コンテンツ */}
    </Animated.View>
  </GestureDetector>
</MotiView>
```

---

## 📚 参考リンク

- [Moti公式ドキュメント](https://moti.fyi/)
- [Moti GitHub](https://github.com/nandorojo/moti)
- [Moti Examples](https://github.com/nandorojo/moti/tree/master/example)

---

**Next: [18-gesture-handler.md](./18-gesture-handler.md) - React Native Gesture Handlerの詳細**
