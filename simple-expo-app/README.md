# シンプルなExpoアプリ

このディレクトリには、Expoを始めるための最もシンプルなサンプルアプリが含まれています。

## 📱 このアプリでできること

- 体重を入力して保存する
- 基本的なReact Hooksの使い方を学ぶ
- React Nativeのコアコンポーネントを理解する

## 🚀 起動方法

### 1. 依存関係をインストール

```bash
npm install
```

### 2. 開発サーバーを起動

```bash
npx expo start
```

### 3. アプリを確認

起動後、以下の方法でアプリを確認できます：

- **スマホで確認**: Expo Goアプリで表示されるQRコードをスキャン
- **iOSシミュレーター**: `i` キーを押す（Mac限定）
- **Androidエミュレーター**: `a` キーを押す
- **Webブラウザ**: `w` キーを押す

## 📚 このアプリで使われている技術

### React Hooks
- `useState`: 状態管理（体重の値を保持）

### React Native コンポーネント
- `View`: コンテナ（HTMLの`<div>`に相当）
- `Text`: テキスト表示（HTMLの`<p>`や`<span>`に相当）
- `TextInput`: テキスト入力フィールド
- `Button`: ボタン
- `StyleSheet`: スタイル定義

### Expo
- `expo-status-bar`: ステータスバーの制御

## 🔍 コードの読み方

### App.js の構造

```javascript
// 1. 必要なものをインポート
import { useState } from 'react';
import { View, Text, ... } from 'react-native';

// 2. メインコンポーネント
export default function App() {
  // 3. 状態管理
  const [weight, setWeight] = useState('70.0');

  // 4. イベントハンドラー
  const handleSave = () => { ... };

  // 5. UIを返す
  return (
    <View>...</View>
  );
}

// 6. スタイル定義
const styles = StyleSheet.create({ ... });
```

## 💡 カスタマイズしてみよう

### 簡単な変更例

1. **タイトルを変更**
   ```javascript
   <Text style={styles.title}>あなたのアプリ名</Text>
   ```

2. **色を変更**
   ```javascript
   card: {
     backgroundColor: '#FF6B6B', // 赤系に変更
     // ...
   }
   ```

3. **初期値を変更**
   ```javascript
   const [weight, setWeight] = useState('65.0'); // 初期値を65kgに
   ```

## 🎓 次のステップ

このシンプルなアプリを理解したら、メインの教材に進みましょう：

1. **[docs/01-curriculum-overview.md](../docs/01-curriculum-overview.md)** - 全体像を把握
2. **[docs/02-tech-architecture.md](../docs/02-tech-architecture.md)** - 技術的な仕組みを理解
3. **[docs/04-minimal-app.md](../docs/04-minimal-app.md)** - 詳しい解説

## 🛠 トラブルシューティング

### `npm install` でエラーが出る
```bash
# キャッシュをクリアして再試行
npm cache clean --force
npm install
```

### QRコードがスキャンできない
- スマホとPCが同じWi-Fiネットワークに接続されているか確認
- ファイアウォールでブロックされていないか確認

### Metro Bundler が起動しない
```bash
# ポートが使用中の場合
npx expo start --clear
```

### エラーメッセージが出る
- エラーメッセージをよく読む
- [debugging-guide.md](../docs/05-debugging-guide.md) を確認
- Google で「expo エラーメッセージ」で検索

## 📖 参考リンク

- [Expo公式ドキュメント](https://docs.expo.dev/)
- [React Native公式ドキュメント](https://reactnative.dev/)
- [React公式ドキュメント](https://react.dev/)

---

**Happy Coding! 🚀**
