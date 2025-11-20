# 12. よくある質問（FAQ）

## 🎯 このガイドの目的

Expo/React Native開発でよくある質問と回答をまとめました。

---

## 📋 カテゴリ

1. [基本的な質問](#基本的な質問)
2. [開発環境](#開発環境)
3. [ビルド・デプロイ](#ビルドデプロイ)
4. [トラブルシューティング](#トラブルシューティング)
5. [パフォーマンス](#パフォーマンス)
6. [料金・ライセンス](#料金ライセンス)

---

## 基本的な質問

### Q: ExpoとReact Nativeの違いは？

**A:** Expoは React Native の上に構築された開発環境・ツールセットです。

| 項目 | Expo | React Native |
|------|------|--------------|
| **セットアップ** | 簡単（5分） | 複雑（Xcode/Android Studio必要） |
| **ネイティブコード** | 不要 | 必要な場合あり |
| **ライブラリ** | 50個以上のモジュール標準搭載 | 自分で探す必要あり |
| **ビルド** | クラウドで実行可能 | ローカルで実行 |
| **OTAアップデート** | 標準対応 | 自分で実装 |

**結論:** 初心者やMVP開発にはExpoが圧倒的に楽です。

---

### Q: Expoでできないことは？

**A:** 以下が必要な場合は制限があります（ただし Expo Modules API で解決可能）:

❌ **できないこと（Expo Go内）:**
- カスタムネイティブモジュール（独自のSwift/Kotlinコード）
- 一部のサードパーティライブラリ（react-native-firebaseなど）

✅ **解決方法:**
- **Development Build**を使う（`npx expo prebuild`）
- Expo Modules APIでカスタムモジュールを書く

**実質的には、ほぼ何でもできます**（2024年現在）。

---

### Q: React NativeはWebViewですか？

**A:** いいえ、**完全に違います**。

❌ **WebView系（Cordova, Ionic）:**
```
HTML/CSS → WebView（ブラウザ） → 表示
```

✅ **React Native:**
```
JSX → ネイティブUIコンポーネント → 表示
iOS: UIView, UILabel, UIButton
Android: View, TextView, Button
```

React Nativeは**本物のネイティブアプリ**です。

---

### Q: TypeScriptは使えますか？

**A:** はい、**標準でサポート**されています。

```bash
# TypeScriptプロジェクト作成
npx create-expo-app my-app --template

# 既存プロジェクトでTypeScript有効化
# .tsxファイルを作成するだけで自動認識
```

---

### Q: Webアプリとしても動きますか？

**A:** はい、**同じコードでWeb対応**できます。

```bash
npx expo start --web
```

ただし、カメラ・位置情報などの一部ネイティブ機能はWeb非対応です。

---

## 開発環境

### Q: Macがないと開発できませんか？

**A:** Androidアプリなら**WindowsでもLinuxでもOK**です。

| プラットフォーム | 必要な環境 |
|-----------------|-----------|
| **Android** | Windows / Mac / Linux |
| **iOS** | Mac必須 |

iOSアプリを作りたい場合は、Macが必要です（またはEAS Buildでクラウドビルド）。

---

### Q: 実機がなくても開発できますか？

**A:** はい、**エミュレーターで開発可能**です。

**iOS Simulator（Macのみ）:**
```bash
npx expo start
# → i キーを押す
```

**Android Emulator:**
```bash
npx expo start
# → a キーを押す
```

ただし、**実機テストは必須**です（カメラ、位置情報、パフォーマンスなど）。

---

### Q: VSCodeの推奨設定は？

**A:** 以下の拡張機能をインストール:

```
1. ES7+ React/Redux/React-Native snippets
2. Prettier - Code formatter
3. ESLint
4. React Native Tools
```

settings.json:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

---

## ビルド・デプロイ

### Q: Expo Goで配布できますか？

**A:** いいえ、**Expo Goは開発用**です。

配布方法:
1. **TestFlight（iOS）** / **Internal Testing（Android）**: ベータテスト用
2. **App Store / Google Play**: 一般配布

---

### Q: EAS Buildは無料ですか？

**A:** 無料枠があります（2024年現在）。

| プラン | 価格 | ビルド回数/月 |
|--------|------|--------------|
| **Free** | $0 | 30回 |
| **Production** | $29/月 | 無制限 |

個人開発・小規模チームなら無料枠で十分です。

---

### Q: ビルドに時間がかかります

**A:** 初回ビルドは**20〜40分**かかります。

**高速化の方法:**
- キャッシュを活用（2回目以降は10分程度）
- ローカルビルド（`npx expo run:ios`）
- 変更が少ないときはOTAアップデート

---

### Q: App Storeの審査期間は？

**A:** 通常**24〜48時間**です。

- 最短: 数時間
- 平均: 1〜2日
- 最長: 1週間（リジェクトされた場合など）

---

## トラブルシューティング

### Q: "Metro Bundler error" が出ます

**A:** キャッシュをクリアしてください。

```bash
# 方法1
npx expo start -c

# 方法2
rm -rf node_modules
npm install

# 方法3 (Mac/Linux)
watchman watch-del-all
```

---

### Q: QRコードをスキャンしても接続できません

**A:** PCとスマホが**同じWi-Fiに接続**されていますか？

**解決策:**
1. 同じWi-Fiに接続
2. ファイアウォールを確認
3. Tunnelモードを使う:
   ```bash
   npx expo start --tunnel
   ```

---

### Q: iOSで動くのにAndroidで動きません（またはその逆）

**A:** プラットフォーム固有の問題です。

**確認事項:**
- 権限設定（app.json）
- Platform.OS で条件分岐
- 両方の実機/エミュレーターでテスト

```jsx
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS専用コード
} else {
  // Android専用コード
}
```

---

### Q: 画像が表示されません

**A:** よくある原因:

```jsx
// ❌ パスが間違っている
<Image source={require('../images/logo.png')} />

// ✅ 正しいパス
<Image source={require('./assets/logo.png')} />

// ❌ ネットワーク画像にサイズ指定なし
<Image source={{ uri: 'https://...' }} />

// ✅ サイズ指定
<Image
  source={{ uri: 'https://...' }}
  style={{ width: 200, height: 200 }}
/>
```

---

### Q: アプリがクラッシュします

**A:** デバッグ手順:

1. **エラーメッセージを読む**
   - 赤い画面のエラーをよく読む

2. **ログを確認**
   ```bash
   # Android
   adb logcat

   # iOS
   npx react-native log-ios
   ```

3. **クラッシュレポートツール導入**
   ```bash
   npx expo install sentry-expo
   ```

---

## パフォーマンス

### Q: アプリが重いです

**A:** チェック項目:

1. **FlatList を使っているか**（ScrollViewは重い）
2. **画像が最適化されているか**（大きすぎませんか？）
3. **不要な再レンダリングがないか**（React.memo使用）
4. **メモリリークがないか**（useEffectのクリーンアップ）

```jsx
// ❌ 重い
<ScrollView>
  {data.map(item => <Item key={item.id} item={item} />)}
</ScrollView>

// ✅ 軽い
<FlatList
  data={data}
  renderItem={({ item }) => <Item item={item} />}
  keyExtractor={(item) => item.id}
/>
```

---

### Q: 起動が遅いです

**A:** 最適化方法:

1. **遅延読み込み**
   ```jsx
   const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
   ```

2. **初期データを減らす**
   - 必要最小限だけ取得

3. **スプラッシュスクリーンを活用**
   - 初期化中はスプラッシュを表示

---

### Q: スクロールがカクつきます

**A:** FlatListの最適化:

```jsx
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  // 最適化
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

## 料金・ライセンス

### Q: Expoは無料ですか？

**A:** はい、**基本的に無料**です。

| 項目 | 無料プラン | 有料プラン |
|------|-----------|-----------|
| **Expo SDK** | ✅ 無料 | - |
| **開発** | ✅ 無料 | - |
| **EAS Build** | 月30回まで無料 | $29/月〜 |
| **OTAアップデート** | ✅ 無料 | - |

---

### Q: App Store / Google Play の費用は？

**A:**

| ストア | 初期費用 | 年会費 |
|--------|---------|--------|
| **App Store（iOS）** | $99 | $99/年 |
| **Google Play（Android）** | $25 | なし（買い切り） |

---

### Q: React Nativeのライセンスは？

**A:** **MITライセンス**（商用利用可能）。

- ✅ 商用アプリ作成OK
- ✅ 販売OK
- ✅ 改変OK
- ✅ ライセンス表示不要（推奨はされる）

---

## その他

### Q: どのくらいで習得できますか？

**A:** React経験者なら:

- **基礎**: 1週間
- **実用レベル**: 1ヶ月
- **プロダクション投入**: 2〜3ヶ月

このチュートリアルを完走すれば、**実用レベル**に到達できます。

---

### Q: 就職・転職に有利ですか？

**A:** はい、**需要は高い**です（2024年現在）。

**求人例:**
- スタートアップ: React Nativeエンジニア
- 大手企業: クロスプラットフォームアプリ開発
- フリーランス: 単価80〜150万円/月

---

### Q: どんなアプリが作られていますか？

**A:** 有名アプリの例:

- **Instagram** (一部)
- **Facebook** (一部)
- **Discord**
- **Shopify**
- **Coinbase**
- **Bloomberg**

大規模アプリでも使われています。

---

### Q: Flutter と比較してどうですか？

**A:** どちらも優れていますが:

| 項目 | React Native | Flutter |
|------|--------------|---------|
| **言語** | JavaScript/TypeScript | Dart |
| **学習コスト** | React経験者は低い | Dartから学ぶ |
| **UI** | ネイティブ | 独自レンダリング |
| **パフォーマンス** | ほぼネイティブ並み | ネイティブ並み |
| **エコシステム** | npm（巨大） | pub.dev（成長中） |
| **求人** | 多い | 増加中 |

**結論:** React経験者ならReact Native、ゼロから始めるならどちらでも。

---

### Q: 最新情報はどこで得られますか？

**A:** 公式ソース:

- [Expo Blog](https://blog.expo.dev/)
- [React Native Blog](https://reactnative.dev/blog)
- [Expo Twitter](https://twitter.com/expo)
- [React Native Community](https://github.com/react-native-community)

---

## 🎓 まとめ

このFAQで解決しない場合:

1. **公式ドキュメント**を確認
2. **Stack Overflow**で検索
3. **Expo Forums**で質問
4. **GitHub Issues**を確認

ほとんどの問題は、すでに誰かが解決しています！

---

**Happy Coding! 🚀**

