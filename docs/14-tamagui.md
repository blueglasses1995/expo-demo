# Tamagui - ユニバーサルUIライブラリ完全ガイド

## 📋 目次

1. [Tamaguiとは](#1-tamaguiとは)
2. [技術的原理](#2-技術的原理)
3. [セットアップ](#3-セットアップ)
4. [機能一覧](#4-機能一覧)
5. [各機能の詳細](#5-各機能の詳細)
6. [実践例](#6-実践例)
7. [パフォーマンス最適化](#7-パフォーマンス最適化)
8. [他のライブラリとの比較](#8-他のライブラリとの比較)

---

## 1. Tamaguiとは

**Tamagui** は、React Native と Web で**同じコード**を使える**ユニバーサルUIライブラリ**です。

### 主な特徴

- 🚀 **超高速**: コンパイル時に最適化され、ランタイムオーバーヘッドがほぼゼロ
- 🎨 **型安全**: TypeScriptで完全に型付けされたスタイリング
- 📱 **ユニバーサル**: React Native、Web、Next.jsで同じコードが動く
- 🎭 **テーマ対応**: ダークモード、カスタムテーマを簡単に実装
- ⚡ **ビルトインアニメーション**: Reanimated 3統合で滑らかなアニメーション
- 📦 **UI コンポーネント**: 50以上のプリビルトコンポーネント

### 他のUIライブラリとの違い

| | Tamagui | React Native Paper | NativeBase |
|---|---------|-------------------|------------|
| コンパイル時最適化 | ✅ | ❌ | ❌ |
| Web対応 | ✅ | ✅ | ✅ |
| アニメーション | Reanimated統合 | Animated API | Animated API |
| バンドルサイズ | 小さい | 中程度 | 大きい |
| カスタマイズ性 | 非常に高い | 中程度 | 高い |

---

## 2. 技術的原理

### アーキテクチャ図

```
┌──────────────────────────────────────────────────┐
│  Developer Code (JSX)                            │
│  <Button size="$4" theme="blue">Click</Button>   │
└──────────────────────────┬───────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────┐
│  Tamagui Compiler (Babel/Webpack Plugin)         │
│  - トークンを CSS/StyleSheet に変換               │
│  - 未使用のスタイルを削除                         │
│  - メディアクエリを最適化                         │
└──────────────────────────┬───────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                  ▼
┌─────────────────────┐          ┌─────────────────────┐
│  React Native       │          │  Web (React DOM)    │
│  - StyleSheet API   │          │  - CSS-in-JS        │
│  - Animated/        │          │  - className        │
│    Reanimated       │          │  - style attribute  │
└─────────────────────┘          └─────────────────────┘
```

### コンパイル時最適化の仕組み

#### Before (開発時のコード):

```tsx
import { Button } from 'tamagui';

<Button size="$4" backgroundColor="$blue10" pressStyle={{ scale: 0.95 }}>
  Click Me
</Button>
```

#### After (コンパイル後):

**React Native:**
```javascript
<Pressable
  style={[styles._button_base, styles._size_4, styles._bg_blue10]}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
>
  <Text style={styles._text}>Click Me</Text>
</Pressable>

const styles = StyleSheet.create({
  _button_base: { borderRadius: 8, ... },
  _size_4: { paddingVertical: 12, paddingHorizontal: 16 },
  _bg_blue10: { backgroundColor: '#0070f3' }
});
```

**Web:**
```html
<button class="btn _size_4 _bg_blue10">Click Me</button>

<style>
.btn { border-radius: 8px; ... }
._size_4 { padding: 12px 16px; }
._bg_blue10 { background-color: #0070f3; }
._bg_blue10:hover { background-color: #0060d3; }
</style>
```

### デザイントークンシステム

Tamaguiは**デザイントークン**（`$変数名`）を使ってスタイルを管理します。

```typescript
// tokens.ts
export const tokens = createTokens({
  color: {
    blue1: '#e6f4ff',
    blue2: '#bae7ff',
    blue10: '#0070f3',
    blue11: '#0060d3',
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
  },
  size: {
    1: 20,
    2: 24,
    3: 28,
    4: 32,
  },
  radius: {
    1: 4,
    2: 8,
    3: 12,
  },
});
```

使用例:
```tsx
<View
  padding="$4"           // → 16px
  backgroundColor="$blue10"  // → #0070f3
  borderRadius="$3"      // → 12px
/>
```

### テーマシステム

```typescript
// config.ts
export const config = createTamagui({
  tokens,
  themes: {
    light: {
      background: '#ffffff',
      color: '#000000',
      primary: '$blue10',
    },
    dark: {
      background: '#000000',
      color: '#ffffff',
      primary: '$blue8',
    },
  },
});
```

テーマの切り替え:
```tsx
import { Theme } from 'tamagui';

function App() {
  return (
    <Theme name="dark">
      <Button>ダークモードのボタン</Button>
    </Theme>
  );
}
```

---

## 3. セットアップ

### Expo プロジェクトでのインストール

```bash
npx create-tamagui-app@latest my-app --template expo-router
```

または既存プロジェクトに追加:

```bash
npm install tamagui @tamagui/config
npx tamagui add
```

### 設定ファイル

**tamagui.config.ts:**

```typescript
import { config } from '@tamagui/config/v3';
import { createTamagui } from 'tamagui';

const appConfig = createTamagui(config);

export type AppConfig = typeof appConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;
```

**app/_layout.tsx (Expo Router):**

```tsx
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <Slot />
    </TamaguiProvider>
  );
}
```

### Babel プラグインの設定

**babel.config.js:**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
          logTimings: true,
        },
      ],
    ],
  };
};
```

---

## 4. 機能一覧

### コアコンセプト

1. **Stacks (レイアウト)**
   - `XStack` - 横並び（flexDirection: row）
   - `YStack` - 縦並び（flexDirection: column）
   - `ZStack` - 重ね合わせ（position: relative/absolute）

2. **スタイリングプロパティ**
   - トークンベースのプロパティ（`$変数名`）
   - ショートハンド（`px`, `py`, `m`, `mt` など）
   - レスポンシブ（`$sm`, `$md`, `$lg`）
   - バリアント（`size`, `variant`, `theme`）

3. **インタラクションステート**
   - `hoverStyle` - ホバー時のスタイル
   - `pressStyle` - プレス時のスタイル
   - `focusStyle` - フォーカス時のスタイル
   - `disabledStyle` - 無効時のスタイル

4. **アニメーション**
   - `animation` プロパティ
   - `enterStyle` / `exitStyle`
   - Reanimated 3統合

5. **テーマ**
   - ライト/ダークモード
   - カスタムテーマ
   - ネストしたテーマ
   - サブテーマ（`blue`, `red`, `green` など）

6. **メディアクエリ**
   - レスポンシブデザイン
   - `$sm`, `$md`, `$lg`, `$xl`
   - カスタムブレークポイント

### UIコンポーネント一覧

#### レイアウト
- `XStack`, `YStack`, `ZStack`
- `ScrollView`
- `Square`, `Circle`

#### 基本要素
- `Text`
- `Paragraph`, `Heading`, `H1`〜`H6`
- `Image`
- `Separator`

#### インタラクティブ
- `Button`
- `Input`, `TextArea`
- `Switch`
- `Slider`
- `Checkbox`, `RadioGroup`
- `Select`

#### フィードバック
- `Dialog` (モーダル)
- `Popover`
- `Tooltip`
- `Sheet` (ボトムシート)
- `AlertDialog`
- `Toast`

#### ナビゲーション
- `Tabs`
- `Accordion`

#### 表示
- `Card`
- `Avatar`
- `Badge`
- `Progress`
- `Spinner`

---

## 5. 各機能の詳細

### 5.1 Stacks (レイアウト)

#### XStack (横並び)

```tsx
import { XStack, Text } from 'tamagui';

<XStack
  space="$4"              // 子要素間のスペース
  padding="$4"            // パディング
  backgroundColor="$blue2"
  borderRadius="$3"
  alignItems="center"     // 垂直方向の配置
  justifyContent="space-between"  // 水平方向の配置
>
  <Text>Left</Text>
  <Text>Center</Text>
  <Text>Right</Text>
</XStack>
```

#### YStack (縦並び)

```tsx
<YStack
  space="$3"
  padding="$4"
  width={300}
>
  <Text fontSize="$6" fontWeight="bold">Title</Text>
  <Text color="$gray10">Description</Text>
  <Button>Action</Button>
</YStack>
```

#### ZStack (重ね合わせ)

```tsx
<ZStack width={200} height={200}>
  <Image
    source={{ uri: 'https://picsum.photos/200' }}
    width="100%"
    height="100%"
  />
  <YStack
    position="absolute"
    bottom="$4"
    left="$4"
    right="$4"
    backgroundColor="rgba(0,0,0,0.7)"
    padding="$3"
    borderRadius="$2"
  >
    <Text color="white">Overlay Text</Text>
  </YStack>
</ZStack>
```

### 5.2 スタイリングプロパティ

#### トークンベース

```tsx
<YStack
  // スペース
  padding="$4"           // 16px
  paddingTop="$2"        // 8px
  margin="$3"            // 12px

  // サイズ
  width="$20"            // トークンから
  height={200}           // 数値
  maxWidth="100%"        // パーセンテージ

  // 色
  backgroundColor="$blue10"
  borderColor="$gray5"

  // ボーダー
  borderWidth={1}
  borderRadius="$3"      // 12px
  borderTopLeftRadius="$4"

  // シャドウ
  shadowColor="$shadowColor"
  shadowRadius={10}
  shadowOffset={{ width: 0, height: 2 }}
  shadowOpacity={0.1}
  elevation={3}  // Android
/>
```

#### ショートハンド

```tsx
<YStack
  p="$4"         // padding
  pt="$2"        // paddingTop
  pb="$2"        // paddingBottom
  px="$4"        // paddingHorizontal
  py="$2"        // paddingVertical

  m="$3"         // margin
  mt="$2"        // marginTop
  mx="$4"        // marginHorizontal
  my="$2"        // marginVertical

  w={300}        // width
  h={200}        // height
  mw="100%"      // maxWidth
  mh={500}       // maxHeight

  bg="$blue10"   // backgroundColor
  bc="$gray5"    // borderColor
  br="$3"        // borderRadius
/>
```

#### レスポンシブデザイン

```tsx
<YStack
  // モバイル
  width="100%"
  padding="$3"

  // タブレット以上
  $gtSm={{
    width: 600,
    padding: "$5",
  }}

  // デスクトップ
  $gtMd={{
    width: 800,
    padding: "$6",
  }}
>
  <Text
    fontSize="$5"
    $gtSm={{ fontSize: "$6" }}
    $gtMd={{ fontSize: "$7" }}
  >
    レスポンシブテキスト
  </Text>
</YStack>
```

メディアクエリの定義:

```typescript
// tamagui.config.ts
export default createTamagui({
  media: {
    sm: { maxWidth: 660 },
    md: { maxWidth: 960 },
    lg: { maxWidth: 1280 },
    gtSm: { minWidth: 660 + 1 },
    gtMd: { minWidth: 960 + 1 },
    gtLg: { minWidth: 1280 + 1 },
  },
});
```

### 5.3 インタラクションステート

```tsx
<Button
  // 通常のスタイル
  backgroundColor="$blue10"
  color="white"

  // ホバー時（Webのみ）
  hoverStyle={{
    backgroundColor: '$blue11',
  }}

  // プレス時
  pressStyle={{
    backgroundColor: '$blue9',
    scale: 0.95,
  }}

  // フォーカス時
  focusStyle={{
    borderColor: '$blue10',
    borderWidth: 2,
  }}

  // 無効時
  disabled={false}
  disabledStyle={{
    backgroundColor: '$gray5',
    opacity: 0.5,
  }}
>
  Interactive Button
</Button>
```

### 5.4 アニメーション

#### 基本的なアニメーション

```tsx
import { useState } from 'react';
import { Button, YStack } from 'tamagui';

function AnimatedBox() {
  const [visible, setVisible] = useState(true);

  return (
    <YStack space="$4">
      <Button onPress={() => setVisible(!visible)}>
        Toggle
      </Button>

      {visible && (
        <YStack
          animation="bouncy"
          enterStyle={{
            opacity: 0,
            scale: 0.5,
            y: -20,
          }}
          exitStyle={{
            opacity: 0,
            scale: 0.5,
            y: -20,
          }}
          opacity={1}
          scale={1}
          y={0}
          backgroundColor="$blue10"
          padding="$4"
          borderRadius="$3"
        >
          <Text color="white">Animated Content</Text>
        </YStack>
      )}
    </YStack>
  );
}
```

#### アニメーション設定

```typescript
// tamagui.config.ts
import { createAnimations } from '@tamagui/animations-react-native';

const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  slow: {
    type: 'timing',
    duration: 500,
  },
});

export default createTamagui({
  animations,
  // ...
});
```

使用例:

```tsx
<YStack
  animation="quick"
  pressStyle={{
    scale: 0.9,
  }}
>
  <Text>Press me!</Text>
</YStack>
```

### 5.5 テーマシステム

#### テーマの定義

```typescript
// tamagui.config.ts
export default createTamagui({
  themes: {
    light: {
      background: '#ffffff',
      backgroundHover: '#f5f5f5',
      backgroundPress: '#eeeeee',
      backgroundFocus: '#e0e0e0',
      color: '#000000',
      colorHover: '#111111',
      primary: '#0070f3',
      secondary: '#666666',
      success: '#10b981',
      error: '#ef4444',
    },
    dark: {
      background: '#000000',
      backgroundHover: '#1a1a1a',
      backgroundPress: '#2a2a2a',
      backgroundFocus: '#3a3a3a',
      color: '#ffffff',
      colorHover: '#eeeeee',
      primary: '#3b82f6',
      secondary: '#999999',
      success: '#10b981',
      error: '#ef4444',
    },
    // サブテーマ
    blue: {
      background: '#e6f4ff',
      color: '#0070f3',
      primary: '#0070f3',
    },
    red: {
      background: '#fff1f0',
      color: '#ff4d4f',
      primary: '#ff4d4f',
    },
  },
});
```

#### テーマの使用

```tsx
import { Theme, Button, YStack } from 'tamagui';
import { useState } from 'react';

function ThemedApp() {
  const [theme, setTheme] = useState('light');

  return (
    <Theme name={theme}>
      <YStack flex={1} backgroundColor="$background" padding="$4">
        <Button
          onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          テーマ切り替え: {theme}
        </Button>

        <Theme name="blue">
          <YStack
            backgroundColor="$background"
            padding="$4"
            borderRadius="$3"
            marginTop="$4"
          >
            <Text color="$color">青テーマ</Text>
            <Button theme="blue">Blue Button</Button>
          </YStack>
        </Theme>
      </YStack>
    </Theme>
  );
}
```

### 5.6 フォーム要素

#### Input

```tsx
import { Input, Label, YStack } from 'tamagui';

<YStack space="$3">
  <Label htmlFor="name">Name</Label>
  <Input
    id="name"
    placeholder="Enter your name"
    size="$4"
    borderWidth={1}
    borderColor="$gray5"
    focusStyle={{
      borderColor: '$blue10',
      borderWidth: 2,
    }}
  />
</YStack>
```

#### Switch

```tsx
import { Switch, XStack, Label } from 'tamagui';
import { useState } from 'react';

function SwitchExample() {
  const [checked, setChecked] = useState(false);

  return (
    <XStack space="$3" alignItems="center">
      <Switch
        id="notifications"
        size="$4"
        checked={checked}
        onCheckedChange={setChecked}
      >
        <Switch.Thumb animation="quick" />
      </Switch>
      <Label htmlFor="notifications">
        通知を有効にする
      </Label>
    </XStack>
  );
}
```

#### Select

```tsx
import { Select, YStack } from 'tamagui';
import { useState } from 'react';

function SelectExample() {
  const [value, setValue] = useState('apple');

  return (
    <Select value={value} onValueChange={setValue}>
      <Select.Trigger width={220}>
        <Select.Value placeholder="選択してください" />
      </Select.Trigger>

      <Select.Content>
        <Select.Viewport>
          <Select.Item index={0} value="apple">
            <Select.ItemText>りんご</Select.ItemText>
          </Select.Item>
          <Select.Item index={1} value="banana">
            <Select.ItemText>バナナ</Select.ItemText>
          </Select.Item>
          <Select.Item index={2} value="orange">
            <Select.ItemText>オレンジ</Select.ItemText>
          </Select.Item>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
}
```

---

## 6. 実践例

### 実例 1: プロフィールカード

```tsx
import { YStack, XStack, Avatar, Text, Button, Card } from 'tamagui';

function ProfileCard() {
  return (
    <Card
      elevate
      size="$4"
      bordered
      animation="bouncy"
      scale={1}
      hoverStyle={{ scale: 1.02 }}
      pressStyle={{ scale: 0.98 }}
    >
      <Card.Header padded>
        <XStack space="$4" alignItems="center">
          <Avatar circular size="$6">
            <Avatar.Image src="https://i.pravatar.cc/150?img=3" />
            <Avatar.Fallback backgroundColor="$blue10" />
          </Avatar>

          <YStack flex={1}>
            <Text fontSize="$6" fontWeight="bold">
              田中太郎
            </Text>
            <Text fontSize="$3" color="$gray10">
              @tanaka_taro
            </Text>
          </YStack>
        </XStack>
      </Card.Header>

      <Card.Footer padded>
        <XStack flex={1} space="$2">
          <Button flex={1} theme="blue">
            フォロー
          </Button>
          <Button flex={1} variant="outlined">
            メッセージ
          </Button>
        </XStack>
      </Card.Footer>
    </Card>
  );
}
```

### 実例 2: 設定画面

```tsx
import { YStack, XStack, Switch, Text, Separator } from 'tamagui';
import { useState } from 'react';

function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const SettingItem = ({ label, value, onValueChange }) => (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      padding="$4"
      pressStyle={{ backgroundColor: '$backgroundPress' }}
    >
      <Text fontSize="$4">{label}</Text>
      <Switch size="$3" checked={value} onCheckedChange={onValueChange}>
        <Switch.Thumb animation="quick" />
      </Switch>
    </XStack>
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <Text fontSize="$7" fontWeight="bold" padding="$4">
        設定
      </Text>

      <YStack backgroundColor="$backgroundHover" borderRadius="$4" margin="$4">
        <SettingItem
          label="プッシュ通知"
          value={notifications}
          onValueChange={setNotifications}
        />
        <Separator />
        <SettingItem
          label="ダークモード"
          value={darkMode}
          onValueChange={setDarkMode}
        />
        <Separator />
        <SettingItem
          label="生体認証"
          value={biometric}
          onValueChange={setBiometric}
        />
      </YStack>
    </YStack>
  );
}
```

### 実例 3: ボトムシート

```tsx
import { Button, Sheet, YStack, Text } from 'tamagui';
import { useState } from 'react';

function BottomSheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setOpen(true)}>
        シートを開く
      </Button>

      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80, 50]}
        dismissOnSnapToBottom
        animation="bouncy"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Sheet.Frame padding="$4" space="$4">
          <Sheet.Handle />

          <YStack space="$3">
            <Text fontSize="$6" fontWeight="bold">
              オプション
            </Text>

            <Button>オプション 1</Button>
            <Button>オプション 2</Button>
            <Button>オプション 3</Button>

            <Button
              theme="red"
              onPress={() => setOpen(false)}
            >
              キャンセル
            </Button>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
```

---

## 7. パフォーマンス最適化

### コンパイル時最適化を有効にする

**babel.config.js:**

```javascript
module.exports = {
  plugins: [
    [
      '@tamagui/babel-plugin',
      {
        components: ['tamagui'],
        config: './tamagui.config.ts',

        // 最適化オプション
        logTimings: true,
        disableExtraction: process.env.NODE_ENV === 'development',
      },
    ],
  ],
};
```

### バンドルサイズの削減

```typescript
// 使わないコンポーネントをインポートしない
// ❌ Bad
import { Button, Input, Select, Dialog, ... } from 'tamagui';

// ✅ Good
import { Button } from '@tamagui/button';
import { Input } from '@tamagui/input';
```

### メモ化

```tsx
import { memo } from 'react';
import { YStack, Text } from 'tamagui';

const ExpensiveComponent = memo(({ data }) => {
  return (
    <YStack>
      {data.map(item => (
        <Text key={item.id}>{item.name}</Text>
      ))}
    </YStack>
  );
});
```

### リストの最適化

```tsx
import { YStack } from 'tamagui';
import { FlashList } from '@shopify/flash-list';

function OptimizedList({ data }) {
  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <YStack padding="$4" borderBottomWidth={1} borderColor="$gray3">
          <Text>{item.name}</Text>
        </YStack>
      )}
      estimatedItemSize={60}
    />
  );
}
```

---

## 8. 他のライブラリとの比較

### Tamagui vs NativeWind

| | Tamagui | NativeWind |
|---|---------|------------|
| アプローチ | コンポーネントベース | ユーティリティクラス |
| 学習曲線 | 中程度 | 低（Tailwind経験者） |
| コンパイル時最適化 | ✅ | ✅ |
| アニメーション | ビルトイン | 別途必要 |
| UIコンポーネント | 50+ | なし |
| TypeScript | 完全型安全 | クラス名は文字列 |
| カスタマイズ性 | 非常に高い | 高い |

### Tamagui vs React Native Paper

| | Tamagui | React Native Paper |
|---|---------|-------------------|
| デザインシステム | カスタマイズ可能 | Material Design |
| Web対応 | ✅ | ✅ |
| パフォーマンス | 非常に高速 | 普通 |
| バンドルサイズ | 小さい | 中程度 |
| 学習曲線 | 中程度 | 低 |

### いつTamaguiを使うべきか？

**使うべき場合:**
- ✅ React NativeとWebの両方をサポートしたい
- ✅ 最高のパフォーマンスが必要
- ✅ 完全にカスタマイズ可能なデザインシステムが欲しい
- ✅ 型安全なスタイリングが欲しい
- ✅ ダークモード、テーマ対応が必要

**使わない方が良い場合:**
- ❌ シンプルな単一プラットフォームアプリ
- ❌ Material Designに厳密に従いたい
- ❌ 学習コストを最小限にしたい

---

## 📚 参考リンク

- [Tamagui公式ドキュメント](https://tamagui.dev/)
- [Tamagui GitHub](https://github.com/tamagui/tamagui)
- [Tamagui UI Kit](https://tamagui.dev/ui/intro)
- [Tamagui Starter](https://github.com/tamagui/starters)

---

**Next: [15-nativewind.md](./15-nativewind.md) - NativeWindの詳細**
