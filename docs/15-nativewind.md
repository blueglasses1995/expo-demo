# NativeWind - React NativeでTailwind CSSを使う完全ガイド

## 📋 目次

1. [NativeWindとは](#1-nativewindとは)
2. [技術的原理](#2-技術的原理)
3. [セットアップ](#3-セットアップ)
4. [機能一覧](#4-機能一覧)
5. [各機能の詳細](#5-各機能の詳細)
6. [実践例](#6-実践例)
7. [パフォーマンス最適化](#7-パフォーマンス最適化)
8. [TailwindとNativeWindの違い](#8-tailwindとnativewindの違い)

---

## 1. NativeWindとは

**NativeWind** は、**Tailwind CSS** のユーティリティクラスを React Native で使えるようにするライブラリです。

### 主な特徴

- 🎨 **Tailwind CSS**: Web開発者に馴染みのあるユーティリティファースト
- 🚀 **コンパイル時最適化**: ランタイムオーバーヘッドなし
- 📱 **ユニバーサル**: React Native、Expo、Webで動作
- 🎭 **ダークモード**: `dark:` プレフィックスで簡単に実装
- 📐 **レスポンシブ**: `sm:`, `md:`, `lg:` でブレークポイント対応
- 🔧 **カスタマイズ可能**: `tailwind.config.js` で完全にカスタマイズ

### なぜNativeWindを使うのか？

**Web開発者にとってのメリット:**
- Tailwind CSSの知識をそのまま活用できる
- 学習コストが低い
- コンポーネント間でスタイルを統一しやすい

**React Native開発者にとってのメリット:**
- StyleSheetの記述量を大幅に削減
- クラス名で直感的にスタイリング
- ダークモード対応が簡単

---

## 2. 技術的原理

### アーキテクチャ図

```
┌──────────────────────────────────────────────────┐
│  Developer Code                                   │
│  <View className="flex-1 bg-blue-500 p-4">       │
└──────────────────────────┬───────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────┐
│  NativeWind Compiler (Babel Plugin)              │
│  - className を StyleSheet に変換                 │
│  - 未使用のスタイルを削除                         │
│  - メディアクエリを解析                           │
└──────────────────────────┬───────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                  ▼
┌─────────────────────┐          ┌─────────────────────┐
│  React Native       │          │  Web (React DOM)    │
│  - StyleSheet       │          │  - CSS              │
│  - Platform API     │          │  - className        │
└─────────────────────┘          └─────────────────────┘
```

### コンパイルプロセス

#### Before (開発時のコード):

```tsx
import { View, Text } from 'react-native';

<View className="flex-1 items-center justify-center bg-blue-500 p-4">
  <Text className="text-white text-2xl font-bold">
    Hello World
  </Text>
</View>
```

#### After (コンパイル後):

**React Native:**
```javascript
<View style={[
  styles.flex1,
  styles.itemsCenter,
  styles.justifyCenter,
  styles.bgBlue500,
  styles.p4
]}>
  <Text style={[
    styles.textWhite,
    styles.text2xl,
    styles.fontBold
  ]}>
    Hello World
  </Text>
</View>

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  itemsCenter: { alignItems: 'center' },
  justifyCenter: { justifyContent: 'center' },
  bgBlue500: { backgroundColor: '#3b82f6' },
  p4: { padding: 16 },
  textWhite: { color: '#ffffff' },
  text2xl: { fontSize: 24, lineHeight: 32 },
  fontBold: { fontWeight: '700' },
});
```

**Web:**
```html
<div class="flex-1 items-center justify-center bg-blue-500 p-4">
  <p class="text-white text-2xl font-bold">
    Hello World
  </p>
</div>
```

### NativeWind v2 vs v4

| | NativeWind v2 | NativeWind v4 |
|---|---------------|---------------|
| Tailwind CSS バージョン | v3 | v3.4+ |
| コンパイラ | styled-components/rn | Tailwind CSS エンジン |
| パフォーマンス | 良い | 非常に良い |
| TypeScript | 限定的 | 完全サポート |
| カスタムクラス | 制限あり | 完全サポート |

**推奨: NativeWind v4** (2024年以降)

---

## 3. セットアップ

### Expo プロジェクトでのインストール

#### ステップ 1: パッケージのインストール

```bash
npx expo install nativewind@^4.0.0 tailwindcss
```

#### ステップ 2: Tailwind CSSの初期化

```bash
npx tailwindcss init
```

#### ステップ 3: tailwind.config.js の設定

**tailwind.config.js:**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: NativeWind v4 では `content` は不要
  content: [],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};
```

#### ステップ 4: Babel の設定

**babel.config.js:**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: ['nativewind/babel'],
  };
};
```

#### ステップ 5: Metro の設定

**metro.config.js:**

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: './global.css',
});
```

#### ステップ 6: グローバルCSS

**global.css:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### ステップ 7: TypeScript の型定義

**nativewind-env.d.ts:**

```typescript
/// <reference types="nativewind/types" />
```

**tsconfig.json:**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  },
  "include": ["**/*.ts", "**/*.tsx", "nativewind-env.d.ts"]
}
```

#### ステップ 8: エントリーポイントでCSSをインポート

**App.tsx または app/_layout.tsx:**

```tsx
import './global.css';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-blue-500">
        Hello NativeWind!
      </Text>
    </View>
  );
}
```

---

## 4. 機能一覧

### ユーティリティクラス

1. **レイアウト**
   - Flexbox: `flex`, `flex-row`, `flex-col`, `items-center`, `justify-between`
   - Position: `absolute`, `relative`, `top-0`, `left-4`
   - Display: `hidden`, `flex`
   - Overflow: `overflow-hidden`, `overflow-scroll`

2. **スペーシング**
   - Padding: `p-4`, `px-2`, `py-3`, `pt-1`, `pb-2`, `pl-4`, `pr-4`
   - Margin: `m-4`, `mx-auto`, `my-2`, `mt-6`, `-mx-4`
   - Space: `space-x-2`, `space-y-4`
   - Gap: `gap-4`, `gap-x-2`, `gap-y-3`

3. **サイズ**
   - Width: `w-full`, `w-1/2`, `w-64`, `min-w-0`, `max-w-xs`
   - Height: `h-full`, `h-screen`, `h-32`, `min-h-screen`, `max-h-96`

4. **背景**
   - Color: `bg-blue-500`, `bg-gray-100`, `bg-transparent`
   - Opacity: `bg-opacity-50`, `bg-opacity-75`

5. **テキスト**
   - Size: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
   - Weight: `font-thin`, `font-normal`, `font-bold`, `font-extrabold`
   - Color: `text-gray-900`, `text-blue-500`
   - Align: `text-left`, `text-center`, `text-right`
   - Transform: `uppercase`, `lowercase`, `capitalize`

6. **ボーダー**
   - Width: `border`, `border-2`, `border-t`, `border-b`
   - Color: `border-gray-300`, `border-blue-500`
   - Radius: `rounded`, `rounded-lg`, `rounded-full`, `rounded-t-lg`

7. **シャドウ**
   - `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`

8. **Effects**
   - Opacity: `opacity-0`, `opacity-50`, `opacity-100`

---

## 5. 各機能の詳細

### 5.1 レイアウト

#### Flexbox

```tsx
import { View, Text } from 'react-native';

// 横並び
<View className="flex flex-row items-center justify-between p-4">
  <Text>Left</Text>
  <Text>Center</Text>
  <Text>Right</Text>
</View>

// 縦並び（デフォルト）
<View className="flex flex-col items-center space-y-4">
  <Text>Top</Text>
  <Text>Middle</Text>
  <Text>Bottom</Text>
</View>

// 中央揃え
<View className="flex-1 items-center justify-center">
  <Text>Centered</Text>
</View>
```

#### Position

```tsx
// 相対位置
<View className="relative h-64 bg-gray-200">
  <View className="absolute top-4 right-4 bg-blue-500 p-2 rounded">
    <Text className="text-white">Badge</Text>
  </View>
</View>

// スタック
<View className="relative">
  <Image className="w-full h-48" source={{ uri: '...' }} />
  <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
    <Text className="text-white">Overlay Text</Text>
  </View>
</View>
```

### 5.2 レスポンシブデザイン

```tsx
<View className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
  <Text className="text-base sm:text-lg md:text-xl lg:text-2xl">
    レスポンシブテキスト
  </Text>
</View>
```

ブレークポイントのカスタマイズ:

**tailwind.config.js:**

```javascript
module.exports = {
  theme: {
    screens: {
      sm: '380px',
      md: '420px',
      lg: '680px',
      xl: '960px',
    },
  },
};
```

### 5.3 ダークモード

```tsx
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';

function ThemedComponent() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <Text className="text-gray-900 dark:text-white text-xl">
        現在のテーマ: {colorScheme}
      </Text>

      <Pressable
        onPress={toggleColorScheme}
        className="bg-blue-500 dark:bg-blue-700 p-4 rounded-lg mt-4"
      >
        <Text className="text-white text-center">
          テーマ切り替え
        </Text>
      </Pressable>
    </View>
  );
}
```

### 5.4 カスタムスタイル

#### カスタムカラー

**tailwind.config.js:**

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#93c5fd',
          DEFAULT: '#3b82f6',
          dark: '#1e40af',
        },
        danger: '#ef4444',
        success: '#10b981',
      },
    },
  },
};
```

使用例:

```tsx
<View className="bg-brand p-4">
  <Text className="text-danger">Error</Text>
  <Text className="text-success">Success</Text>
</View>
```

#### カスタムスペーシング

**tailwind.config.js:**

```javascript
module.exports = {
  theme: {
    extend: {
      spacing: {
        13: '3.25rem',    // 52px
        15: '3.75rem',    // 60px
        128: '32rem',     // 512px
      },
    },
  },
};
```

使用例:

```tsx
<View className="p-13 m-15">
  <Text>カスタムスペーシング</Text>
</View>
```

### 5.5 条件付きスタイル

```tsx
import { Pressable, Text } from 'react-native';
import { useState } from 'react';

function ConditionalStyles() {
  const [isActive, setIsActive] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <Pressable
      onPress={() => setIsActive(!isActive)}
      disabled={isDisabled}
      className={`
        p-4 rounded-lg
        ${isActive ? 'bg-blue-500' : 'bg-gray-300'}
        ${isDisabled ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <Text className={`${isActive ? 'text-white' : 'text-gray-900'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </Text>
    </Pressable>
  );
}
```

### 5.6 バリアント

`clsx` または `class-variance-authority` を使うと便利です。

```bash
npm install clsx
```

```tsx
import clsx from 'clsx';
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

function Button({ variant = 'primary', size = 'md', children }: ButtonProps) {
  return (
    <Pressable
      className={clsx(
        'rounded-lg items-center justify-center',
        {
          // Variant
          'bg-blue-500': variant === 'primary',
          'bg-gray-500': variant === 'secondary',
          'bg-red-500': variant === 'danger',

          // Size
          'px-3 py-2': size === 'sm',
          'px-4 py-3': size === 'md',
          'px-6 py-4': size === 'lg',
        }
      )}
    >
      <Text
        className={clsx('text-white', {
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-lg': size === 'lg',
        })}
      >
        {children}
      </Text>
    </Pressable>
  );
}

// 使用例
<Button variant="primary" size="lg">Primary Button</Button>
<Button variant="danger" size="sm">Delete</Button>
```

### 5.7 プラットフォーム固有のスタイル

```tsx
import { Platform } from 'react-native';

<View
  className={`
    p-4
    ${Platform.OS === 'ios' ? 'rounded-3xl' : 'rounded-xl'}
    ${Platform.OS === 'android' ? 'elevation-4' : 'shadow-lg'}
  `}
>
  <Text>プラットフォーム固有のスタイル</Text>
</View>
```

または、カスタムバリアントを定義:

**tailwind.config.js:**

```javascript
module.exports = {
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addVariant }) {
      addVariant('ios', '.ios &');
      addVariant('android', '.android &');
    },
  ],
};
```

使用例:

```tsx
<View className="p-4 ios:rounded-3xl android:rounded-xl">
  <Text>Platform Specific</Text>
</View>
```

---

## 6. 実践例

### 実例 1: プロフィールカード

```tsx
import { View, Text, Image, Pressable } from 'react-native';

function ProfileCard() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 m-4">
      {/* ヘッダー */}
      <View className="flex-row items-center space-x-4 mb-4">
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=3' }}
          className="w-16 h-16 rounded-full"
        />
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            田中太郎
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            @tanaka_taro
          </Text>
        </View>
      </View>

      {/* 説明 */}
      <Text className="text-gray-700 dark:text-gray-300 mb-4">
        React Native と Web 開発が好きなエンジニア。
        東京在住。
      </Text>

      {/* ステータス */}
      <View className="flex-row space-x-4 mb-4">
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            1.2K
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            フォロワー
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            345
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            フォロー中
          </Text>
        </View>
      </View>

      {/* ボタン */}
      <View className="flex-row space-x-2">
        <Pressable className="flex-1 bg-blue-500 py-3 rounded-lg active:bg-blue-600">
          <Text className="text-white text-center font-semibold">
            フォロー
          </Text>
        </Pressable>
        <Pressable className="flex-1 border border-gray-300 dark:border-gray-600 py-3 rounded-lg active:bg-gray-100 dark:active:bg-gray-700">
          <Text className="text-gray-900 dark:text-white text-center font-semibold">
            メッセージ
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

### 実例 2: フォーム

```tsx
import { View, Text, TextInput, Pressable } from 'react-native';
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View className="flex-1 justify-center px-6 bg-gray-50 dark:bg-gray-900">
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        ログイン
      </Text>

      {/* Email Input */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          メールアドレス
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
        />
      </View>

      {/* Password Input */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          パスワード
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
        />
      </View>

      {/* Submit Button */}
      <Pressable className="bg-blue-500 py-4 rounded-lg active:bg-blue-600 mb-4">
        <Text className="text-white text-center font-semibold text-lg">
          ログイン
        </Text>
      </Pressable>

      {/* Forgot Password */}
      <Pressable>
        <Text className="text-blue-500 text-center">
          パスワードをお忘れですか？
        </Text>
      </Pressable>
    </View>
  );
}
```

### 実例 3: リスト

```tsx
import { FlatList, View, Text, Image } from 'react-native';

const DATA = [
  { id: '1', name: '田中太郎', message: '今日は良い天気ですね', time: '10:30' },
  { id: '2', name: '佐藤花子', message: 'ミーティングは明日です', time: '09:15' },
  { id: '3', name: '鈴木一郎', message: '資料を送りました', time: '昨日' },
];

function MessageList() {
  return (
    <FlatList
      data={DATA}
      keyExtractor={(item) => item.id}
      className="bg-white dark:bg-gray-900"
      renderItem={({ item }) => (
        <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <Image
            source={{ uri: `https://i.pravatar.cc/150?img=${item.id}` }}
            className="w-12 h-12 rounded-full mr-4"
          />
          <View className="flex-1">
            <View className="flex-row justify-between mb-1">
              <Text className="font-semibold text-gray-900 dark:text-white">
                {item.name}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {item.time}
              </Text>
            </View>
            <Text
              className="text-gray-600 dark:text-gray-300"
              numberOfLines={1}
            >
              {item.message}
            </Text>
          </View>
        </View>
      )}
    />
  );
}
```

### 実例 4: グリッドレイアウト

```tsx
import { ScrollView, View, Text, Image } from 'react-native';

const PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  uri: `https://picsum.photos/200?random=${i}`,
}));

function PhotoGrid() {
  return (
    <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <View className="flex-row flex-wrap p-2">
        {PHOTOS.map((photo) => (
          <View key={photo.id} className="w-1/3 p-1">
            <Image
              source={{ uri: photo.uri }}
              className="w-full aspect-square rounded-lg"
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
```

---

## 7. パフォーマンス最適化

### 静的スタイルの使用

```tsx
// ❌ Bad: 動的に生成される
<View className={`p-${padding} m-${margin}`} />

// ✅ Good: 静的なクラス名
<View className="p-4 m-2" />
```

### clsxでの条件分岐

```tsx
import clsx from 'clsx';

// ✅ Good
<View
  className={clsx(
    'p-4 rounded-lg',
    isActive && 'bg-blue-500',
    !isActive && 'bg-gray-300'
  )}
/>
```

### メモ化

```tsx
import { memo } from 'react';

const ListItem = memo(({ item }) => (
  <View className="p-4 border-b border-gray-200">
    <Text className="font-semibold">{item.name}</Text>
    <Text className="text-gray-600">{item.description}</Text>
  </View>
));
```

### FlatListの最適化

```tsx
<FlatList
  data={data}
  renderItem={({ item }) => <ListItem item={item} />}
  keyExtractor={(item) => item.id}

  // パフォーマンス最適化
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

## 8. TailwindとNativeWindの違い

### サポートされていない機能

| Tailwind CSS | NativeWind | 理由 |
|--------------|------------|------|
| `hover:` | Web のみ | React Nativeにホバーなし |
| `focus:` | 限定的 | フォーカスの概念が異なる |
| `group-hover:` | ❌ | サポートなし |
| `peer:` | ❌ | サポートなし |
| `before:`, `after:` | ❌ | 疑似要素なし |
| `backdrop-blur` | ❌ | ネイティブサポートなし |

### React Native固有の制限

1. **Transform Origin**: `transform-origin` は使えない
2. **Box Shadow**: `shadow-*` は iOS と Android で見た目が異なる
3. **Text ネスト**: `<Text>` 内でのみネスト可能
4. **%単位**: 一部のプロパティのみサポート

### 代替手段

```tsx
// ❌ Tailwind CSS (Webのみ)
<div className="hover:bg-blue-500">Hover me</div>

// ✅ NativeWind (Pressable を使用)
<Pressable className="active:bg-blue-500">
  <Text>Press me</Text>
</Pressable>
```

---

## 9. Tailwind CSS からの移行

### Tailwind経験者向けの注意点

1. **コンポーネントが異なる**
   ```tsx
   // Web
   <div>, <span>, <p>, <button>

   // React Native
   <View>, <Text>, <Pressable>
   ```

2. **全てのテキストは `<Text>` で囲む**
   ```tsx
   // ❌ Bad
   <View>Hello</View>

   // ✅ Good
   <View>
     <Text>Hello</Text>
   </View>
   ```

3. **デフォルトのスタイルが異なる**
   - `flex-direction`: `column` (Tailwindは `row`)
   - `box-sizing`: 常に `border-box`

---

## 📚 参考リンク

- [NativeWind公式ドキュメント](https://www.nativewind.dev/)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/)
- [NativeWind GitHub](https://github.com/nativewind/nativewind)

---

**Next: [16-reanimated.md](./16-reanimated.md) - React Native Reanimated 3の詳細**
