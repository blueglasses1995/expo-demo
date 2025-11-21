# React Native Skia - 高性能2Dグラフィックス完全ガイド

## 📋 目次

1. [React Native Skiaとは](#1-react-native-skiaとは)
2. [技術的原理](#2-技術的原理)
3. [セットアップ](#3-セットアップ)
4. [機能一覧](#4-機能一覧)
5. [各機能の詳細](#5-各機能の詳細)
6. [実践例](#6-実践例)
7. [パフォーマンス最適化](#7-パフォーマンス最適化)
8. [使用例とユースケース](#8-使用例とユースケース)

---

## 1. React Native Skiaとは

**React Native Skia** は、Google製の**Skia 2Dグラフィックスエンジン**をReact Nativeで使えるようにしたライブラリです。

### 主な特徴

- 🎨 **高性能**: ネイティブレベルの描画パフォーマンス
- 🖌️ **豊富な描画機能**: パス、シェイプ、テキスト、画像、グラデーション
- ✨ **高度なエフェクト**: ブラー、シャドウ、カラーフィルター
- 🎭 **Reanimated統合**: 滑らかなアニメーション
- 📱 **クロスプラットフォーム**: iOS/Android/Web（一部）で同一コード
- 🔧 **宣言的API**: Reactコンポーネントで描画

### Skiaの使用例

**Skiaを使っているアプリ:**
- Google Chrome（レンダリングエンジン）
- Android OS（UIレンダリング）
- Flutter（UIフレームワーク）
- Firefox、Sublime Text など

### なぜReact Native Skiaを使うのか？

**React NativeのViewの限界:**
- 複雑な図形の描画が困難
- カスタムシェイプのパフォーマンスが悪い
- 高度なエフェクトが実装できない

**Skiaの解決策:**
- ネイティブレベルの描画パフォーマンス
- Canvas API風の直感的な描画
- 複雑なグラフィックスを簡単に実装

---

## 2. 技術的原理

### アーキテクチャ図

```
┌──────────────────────────────────────────────────┐
│  React Components (JSX)                          │
│  <Canvas>                                        │
│    <Circle cx={50} cy={50} r={25} />            │
│  </Canvas>                                       │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  React Native Skia Bridge                        │
│  - JSI (JavaScript Interface)                    │
│  - Worklets サポート                              │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  Skia Engine (C++)                               │
│  - パス、シェイプの計算                            │
│  - ピクセルレンダリング                            │
│  - エフェクト適用                                 │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  GPU / Metal / OpenGL                            │
│  - 最終的な画面描画                               │
└──────────────────────────────────────────────────┘
```

### JSI統合

Skiaは**JSI (JavaScript Interface)** を使ってC++のSkiaエンジンと直接通信します。

```
従来のBridge:
JavaScript → JSON → Native → 画面描画
（遅い、オーバーヘッドあり）

Skia with JSI:
JavaScript → 直接C++ → 画面描画
（高速、オーバーヘッドなし）
```

---

## 3. セットアップ

### インストール

```bash
npx expo install @shopify/react-native-skia
```

### 基本的な使用

```tsx
import { Canvas, Circle } from '@shopify/react-native-skia';

function App() {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Circle cx={128} cy={128} r={50} color="blue" />
    </Canvas>
  );
}
```

---

## 4. 機能一覧

### 描画要素

1. **基本シェイプ**
   - `Circle` - 円
   - `Rect` - 四角形
   - `RoundedRect` - 角丸四角形
   - `Line` - 線
   - `Points` - 点の集合
   - `Oval` - 楕円

2. **パス**
   - `Path` - カスタムパス
   - `Skia.Path.Make()` - パスの作成

3. **テキスト**
   - `Text` - テキスト描画
   - `Paragraph` - 複数行テキスト
   - `Glyphs` - グリフ（文字）

4. **画像**
   - `Image` - 画像表示
   - `ImageSVG` - SVG描画

5. **グラデーション**
   - `LinearGradient` - 線形グラデーション
   - `RadialGradient` - 放射状グラデーション
   - `SweepGradient` - 角度グラデーション

6. **エフェクト**
   - `Blur` - ブラー
   - `Shadow` - シャドウ
   - `ColorMatrix` - カラーフィルター
   - `DisplacementMap` - 変形マップ

7. **ブレンドモード**
   - `BlendMode` - 描画モード（multiply, screen, overlayなど）

8. **マスク & クリップ**
   - `Mask` - マスク
   - `Group` - グループ化

---

## 5. 各機能の詳細

### 5.1 基本シェイプ

#### Circle (円)

```tsx
import { Canvas, Circle } from '@shopify/react-native-skia';

<Canvas style={{ width: 256, height: 256 }}>
  <Circle cx={128} cy={128} r={50} color="blue" />

  {/* ボーダー付き */}
  <Circle
    cx={128}
    cy={128}
    r={50}
    style="stroke"
    color="red"
    strokeWidth={4}
  />
</Canvas>
```

#### Rect (四角形)

```tsx
import { Canvas, Rect } from '@shopify/react-native-skia';

<Canvas style={{ width: 256, height: 256 }}>
  <Rect x={50} y={50} width={100} height={100} color="green" />
</Canvas>
```

#### RoundedRect (角丸四角形)

```tsx
import { Canvas, RoundedRect } from '@shopify/react-native-skia';

<Canvas style={{ width: 256, height: 256 }}>
  <RoundedRect
    x={50}
    y={50}
    width={100}
    height={100}
    r={10}  // 角丸の半径
    color="purple"
  />
</Canvas>
```

### 5.2 パス

```tsx
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

function PathExample() {
  const path = Skia.Path.Make();
  path.moveTo(50, 50);
  path.lineTo(150, 50);
  path.lineTo(150, 150);
  path.lineTo(50, 150);
  path.close();

  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Path path={path} color="orange" />
    </Canvas>
  );
}
```

#### SVGパス

```tsx
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

const path = Skia.Path.MakeFromSVGString(
  'M 128 0 L 168 80 L 256 93 L 192 155 L 208 244 L 128 202 L 48 244 L 64 155 L 0 93 L 88 80 Z'
);

<Canvas style={{ width: 256, height: 256 }}>
  <Path path={path} color="gold" />
</Canvas>
```

### 5.3 グラデーション

#### Linear Gradient

```tsx
import { Canvas, Rect, LinearGradient, vec } from '@shopify/react-native-skia';

<Canvas style={{ width: 256, height: 256 }}>
  <Rect x={0} y={0} width={256} height={256}>
    <LinearGradient
      start={vec(0, 0)}
      end={vec(256, 256)}
      colors={['#00ff87', '#60efff']}
    />
  </Rect>
</Canvas>
```

#### Radial Gradient

```tsx
import { Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';

<Canvas style={{ width: 256, height: 256 }}>
  <Circle cx={128} cy={128} r={100}>
    <RadialGradient
      c={vec(128, 128)}
      r={100}
      colors={['#ff0080', '#7928ca', '#0070f3']}
    />
  </Circle>
</Canvas>
```

### 5.4 テキスト

```tsx
import { Canvas, Text, useFont } from '@shopify/react-native-skia';

function TextExample() {
  const font = useFont(require('./fonts/Roboto-Bold.ttf'), 32);

  if (!font) {
    return null;
  }

  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Text
        x={50}
        y={100}
        text="Hello Skia!"
        font={font}
        color="blue"
      />
    </Canvas>
  );
}
```

### 5.5 画像

```tsx
import { Canvas, Image, useImage } from '@shopify/react-native-skia';

function ImageExample() {
  const image = useImage(require('./assets/photo.jpg'));

  if (!image) {
    return null;
  }

  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Image
        image={image}
        x={0}
        y={0}
        width={256}
        height={256}
        fit="cover"
      />
    </Canvas>
  );
}
```

### 5.6 エフェクト

#### Blur

```tsx
import { Canvas, Circle, Blur } from '@shopify/react-native-skia';

<Canvas style={{ width: 256, height: 256 }}>
  <Circle cx={128} cy={128} r={50} color="blue">
    <Blur blur={10} />
  </Circle>
</Canvas>
```

#### Shadow

```tsx
import { Canvas, RoundedRect, Shadow } from '@shopify/react-native-skia';

<Canvas style={{ width: 256, height: 256 }}>
  <RoundedRect x={50} y={50} width={150} height={150} r={10} color="white">
    <Shadow dx={4} dy={4} blur={8} color="rgba(0,0,0,0.3)" />
  </RoundedRect>
</Canvas>
```

#### Color Filter

```tsx
import { Canvas, Image, ColorMatrix } from '@shopify/react-native-skia';

// セピア効果
const sepiaMatrix = [
  0.393, 0.769, 0.189, 0, 0,
  0.349, 0.686, 0.168, 0, 0,
  0.272, 0.534, 0.131, 0, 0,
  0, 0, 0, 1, 0,
];

<Canvas style={{ width: 256, height: 256 }}>
  <Image image={image} x={0} y={0} width={256} height={256}>
    <ColorMatrix matrix={sepiaMatrix} />
  </Image>
</Canvas>
```

### 5.7 Reanimated統合

```tsx
import { Canvas, Circle } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

function AnimatedCircle() {
  const r = useSharedValue(20);

  useEffect(() => {
    r.value = withRepeat(
      withTiming(50, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Circle cx={128} cy={128} r={r} color="blue" />
    </Canvas>
  );
}
```

---

## 6. 実践例

### 実例 1: プログレスリング

```tsx
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { useEffect } from 'react';

function ProgressRing({ progress }) {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 1000 });
  }, [progress]);

  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    p.addCircle(128, 128, 50);
    return p;
  });

  const start = useDerivedValue(() => 0);
  const end = useDerivedValue(() => animatedProgress.value);

  return (
    <Canvas style={{ width: 256, height: 256 }}>
      {/* 背景円 */}
      <Path
        path={path}
        color="#e0e0e0"
        style="stroke"
        strokeWidth={8}
        strokeCap="round"
      />

      {/* プログレス */}
      <Path
        path={path}
        color="#3b82f6"
        style="stroke"
        strokeWidth={8}
        strokeCap="round"
        start={start}
        end={end}
      />
    </Canvas>
  );
}
```

### 実例 2: グラフ

```tsx
import { Canvas, Path, Skia, Line, Circle } from '@shopify/react-native-skia';

function LineChart({ data }) {
  const width = 300;
  const height = 200;
  const padding = 20;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const path = Skia.Path.Make();

  data.forEach((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);

    if (index === 0) {
      path.moveTo(x, y);
    } else {
      path.lineTo(x, y);
    }
  });

  return (
    <Canvas style={{ width, height }}>
      {/* グリッド */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Line
          key={i}
          p1={{ x: padding, y: padding + i * ((height - padding * 2) / 4) }}
          p2={{ x: width - padding, y: padding + i * ((height - padding * 2) / 4) }}
          color="#e0e0e0"
          strokeWidth={1}
        />
      ))}

      {/* 折れ線 */}
      <Path
        path={path}
        color="#3b82f6"
        style="stroke"
        strokeWidth={3}
        strokeCap="round"
        strokeJoin="round"
      />

      {/* データポイント */}
      {data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);

        return (
          <Circle key={index} cx={x} cy={y} r={5} color="#3b82f6" />
        );
      })}
    </Canvas>
  );
}

// 使用例
<LineChart data={[10, 25, 18, 40, 35, 50, 45]} />
```

### 実例 3: 波形アニメーション

```tsx
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, useDerivedValue } from 'react-native-reanimated';
import { useEffect } from 'react';

function WaveAnimation() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false
    );
  }, []);

  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    const width = 300;
    const height = 200;
    const amplitude = 30;
    const frequency = 2;

    p.moveTo(0, height / 2);

    for (let x = 0; x <= width; x++) {
      const y = height / 2 + amplitude * Math.sin((x / width) * Math.PI * 2 * frequency + progress.value * Math.PI * 2);
      p.lineTo(x, y);
    }

    p.lineTo(width, height);
    p.lineTo(0, height);
    p.close();

    return p;
  });

  return (
    <Canvas style={{ width: 300, height: 200 }}>
      <Path path={path} color="rgba(59, 130, 246, 0.5)" />
    </Canvas>
  );
}
```

### 実例 4: パーティクルシステム

```tsx
import { Canvas, Circle } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, withRepeat } from 'react-native-reanimated';
import { useEffect } from 'react';

function Particles() {
  const particles = Array.from({ length: 50 }, () => ({
    x: useSharedValue(Math.random() * 300),
    y: useSharedValue(Math.random() * 300),
    r: Math.random() * 5 + 2,
    color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)`,
  }));

  useEffect(() => {
    particles.forEach((particle) => {
      particle.x.value = withRepeat(
        withTiming(Math.random() * 300, { duration: Math.random() * 3000 + 2000 }),
        -1,
        true
      );
      particle.y.value = withRepeat(
        withTiming(Math.random() * 300, { duration: Math.random() * 3000 + 2000 }),
        -1,
        true
      );
    });
  }, []);

  return (
    <Canvas style={{ width: 300, height: 300 }}>
      {particles.map((particle, index) => (
        <Circle
          key={index}
          cx={particle.x}
          cy={particle.y}
          r={particle.r}
          color={particle.color}
        />
      ))}
    </Canvas>
  );
}
```

---

## 7. パフォーマンス最適化

### useDerivedValue の使用

複雑な計算は `useDerivedValue` でメモ化:

```tsx
const path = useDerivedValue(() => {
  const p = Skia.Path.Make();
  // 複雑なパス計算
  return p;
}, [dependencies]);
```

### Canvas のサイズを最小限に

```tsx
// ❌ Bad: 画面全体をCanvasに
<Canvas style={{ flex: 1 }}>
  <Circle cx={50} cy={50} r={25} />
</Canvas>

// ✅ Good: 必要な領域のみ
<Canvas style={{ width: 100, height: 100 }}>
  <Circle cx={50} cy={50} r={25} />
</Canvas>
```

### レイヤーの使用

複雑な描画はレイヤーで分離:

```tsx
import { Canvas, Group, Layer } from '@shopify/react-native-skia';

<Canvas style={{ width: 256, height: 256 }}>
  <Layer>
    {/* 静的な背景 */}
    <Rect x={0} y={0} width={256} height={256} color="white" />
  </Layer>

  <Layer>
    {/* アニメーションする要素 */}
    <Circle cx={cx} cy={cy} r={50} color="blue" />
  </Layer>
</Canvas>
```

---

## 8. 使用例とユースケース

### いつSkiaを使うべきか？

**Skiaを使うべき場合:**
- ✅ カスタムチャート・グラフ
- ✅ データビジュアライゼーション
- ✅ カスタム描画UI（プログレスリング、ゲージなど）
- ✅ 画像エフェクト（フィルター、ブラーなど）
- ✅ アニメーション（パーティクル、波形など）
- ✅ SVGレンダリング
- ✅ ゲーム開発

**Skiaを使わない方が良い場合:**
- ❌ シンプルなUI（Button、Textなど）
- ❌ 標準的なレイアウト
- ❌ リストやスクロールビュー
- ❌ フォーム要素

### 他の描画方法との比較

| | React Native View | SVG | Skia |
|---|-------------------|-----|------|
| パフォーマンス | 普通 | 低 | 非常に高い |
| 複雑な描画 | 困難 | 可能 | 簡単 |
| アニメーション | 可能 | 遅い | 高速 |
| 学習曲線 | 低 | 中 | 中〜高 |
| バンドルサイズ | 小 | 小 | 大（~7MB） |

---

## 📚 参考リンク

- [React Native Skia公式ドキュメント](https://shopify.github.io/react-native-skia/)
- [React Native Skia GitHub](https://github.com/Shopify/react-native-skia)
- [Skia公式サイト](https://skia.org/)
- [William Candillon YouTube](https://www.youtube.com/c/wcandillon) - Skiaチュートリアル

---

**これでReact Native開発で使用する主要ライブラリの解説は完了です！**

各ライブラリの使い分け:
- **スタイリング**: Tamagui または NativeWind
- **アニメーション**: Reanimated 3（複雑）、Moti（シンプル）
- **ジェスチャー**: Gesture Handler
- **カスタム描画**: Skia

全てのライブラリを組み合わせることで、ネイティブアプリに匹敵する高性能なReact Nativeアプリを開発できます！
