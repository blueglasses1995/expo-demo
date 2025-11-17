# Expo完全ハンズオン教材

React経験者がスマホアプリ開発に挑戦するための実践的なハンズオン教材です。

## 📚 教材の特徴

- ✅ **段階的な学習**: シンプルな状態から始めて、1つずつライブラリを追加
- ✅ **詳細な技術解説**: React、React Native、Expo、ネイティブAPIの関係性を図解
- ✅ **実践的**: 健康管理アプリを実際に作りながら学ぶ
- ✅ **デプロイまで**: App Store / Google Play へのリリース手順も網羅
- ✅ **実務に即した内容**: デバッグ、つまずきポイント、効率的な開発方法

## 🎯 完成するアプリ

**Wellness Tracker（健康管理アプリ）**

- 体重・体調記録
- データのグラフ表示
- 食事写真の記録
- 歩数カウンター
- ウォーキングルート記録
- Bluetooth心拍計連携
- リマインダー通知
- クラウド同期

## 📖 ドキュメント構成

### はじめに

- **[EXPO_TUTORIAL_README.md](EXPO_TUTORIAL_README.md)** - カリキュラム全体の概要
- **[docs/tech-architecture.md](docs/tech-architecture.md)** - React Native/Expoの技術アーキテクチャ完全解説

### 基礎編

- **[docs/step-00-setup.md](docs/step-00-setup.md)** - 開発環境のセットアップ
- **[docs/step-01-minimal-app.md](docs/step-01-minimal-app.md)** - 最小構成のExpoアプリ

### 実践編（サンプル）

- **[docs/step-08-camera.md](docs/step-08-camera.md)** - カメラ機能の実装
- **[docs/step-15-bluetooth.md](docs/step-15-bluetooth.md)** - Bluetooth機能の実装

### 開発ガイド

- **[docs/debugging-guide.md](docs/debugging-guide.md)** - デバッグ・開発効率化ガイド
- **[docs/common-pitfalls.md](docs/common-pitfalls.md)** - 実務でつまずきやすいポイント集
- **[docs/production-checklist.md](docs/production-checklist.md)** - 実務開発者の考慮事項完全ガイド ⭐NEW

### デプロイ

- **[docs/deployment-guide.md](docs/deployment-guide.md)** - App Store / Google Play へのリリース手順

## 🚀 学習の進め方

### 1. 開発環境をセットアップ

```bash
# Node.js をインストール（v18以上）
node --version

# エディタ（VSCode推奨）をインストール
# https://code.visualstudio.com/

# スマホに Expo Go をインストール
# iOS: App Store
# Android: Google Play
```

### 2. ドキュメントを順番に読む

1. [EXPO_TUTORIAL_README.md](EXPO_TUTORIAL_README.md) - 全体像を把握
2. [docs/tech-architecture.md](docs/tech-architecture.md) - 技術的な仕組みを理解
3. [docs/step-00-setup.md](docs/step-00-setup.md) - 環境構築
4. [docs/step-01-minimal-app.md](docs/step-01-minimal-app.md) - 最初のアプリを作成
5. 以降、各ステップを順番に進める

### 3. 実際にコードを書く

**コピペせず、手で打つことを推奨**（理解が深まります）

### 4. つまずいたら

- [docs/debugging-guide.md](docs/debugging-guide.md) - デバッグ方法を確認
- [docs/common-pitfalls.md](docs/common-pitfalls.md) - よくある問題を確認
- エラーメッセージをよく読む
- Google / Stack Overflow で検索

## 📚 全23ステップの構成

### Phase 0: 準備編
- **Step 0**: 開発環境のセットアップ ✅

### Phase 1: 基礎編
- **Step 1**: 最小構成のExpoアプリ ✅
- **Step 2**: ナビゲーション（React Navigation）
- **Step 3**: ローカルストレージ（AsyncStorage）

### Phase 2: UI/UX強化編
- **Step 4**: リスト表示（FlatList）
- **Step 5**: フォーム管理（React Hook Form）
- **Step 6**: 日付ピッカー
- **Step 7**: グラフ表示

### Phase 3: ネイティブ機能編
- **Step 8**: カメラ（expo-camera） ✅
- **Step 9**: 画像ピッカー
- **Step 10**: ファイルシステム

### Phase 4: センサー・位置情報編
- **Step 11**: 位置情報（expo-location）
- **Step 12**: 歩数計（expo-sensors）
- **Step 13**: 地図表示（react-native-maps）

### Phase 5: 高度な機能編
- **Step 14**: 通知（expo-notifications）
- **Step 15**: Bluetooth（expo-bluetooth） ✅
- **Step 16**: バックグラウンドタスク
- **Step 17**: 状態管理（Zustand）
- **Step 18**: API連携（React Query）

### Phase 6: 完成・デプロイ編
- **Step 19**: アプリアイコン・スプラッシュスクリーン
- **Step 20**: パフォーマンス最適化
- **Step 21**: テスト（Jest）
- **Step 22**: EAS Build でビルド
- **Step 23**: App Store / Google Play 申請 ✅

## 🛠 前提知識

### 必要
- JavaScript (ES6+)
- React の基礎（コンポーネント、Hooks、Props/State）

### あると望ましい
- TypeScript
- 非同期処理（Promise、async/await）
- REST API の基礎

## 💡 学習のコツ

1. **理解を優先**: なぜそうなるのかを理解する
2. **手を動かす**: コピペではなく自分で打つ
3. **実機でテスト**: エミュレーターだけでなく実機でも確認
4. **エラーを恐れない**: エラーは学びのチャンス
5. **こまめにコミット**: 動く状態を保存しておく

## 🎓 このハンズオンで学べること

### 技術的知識
- React Nativeの仕組み
- Expoの活用方法
- ネイティブAPIとの連携
- クロスプラットフォーム開発

### 実務スキル
- デバッグ手法
- パフォーマンス最適化
- エラー対処法
- アプリのデプロイ

### 設計力
- コンポーネント設計
- 状態管理
- ディレクトリ構成

## 📊 学習時間の目安

| Phase | 内容 | 所要時間 |
|-------|------|---------|
| Phase 0-1 | 環境構築〜基礎 | 3〜5時間 |
| Phase 2 | UI/UX強化 | 4〜6時間 |
| Phase 3-4 | ネイティブ機能 | 6〜8時間 |
| Phase 5 | 高度な機能 | 6〜8時間 |
| Phase 6 | デプロイ | 4〜6時間 |
| **合計** | | **25〜35時間** |

週末に集中して取り組めば、2〜3週間で完走できます！

## 🆘 困ったときは

### 公式ドキュメント
- [Expo公式](https://docs.expo.dev/)
- [React Native公式](https://reactnative.dev/)
- [React公式](https://react.dev/)

### コミュニティ
- [Expo Forums](https://forums.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)
- [GitHub Issues](https://github.com/expo/expo/issues)

### このリポジトリ
- Issues で質問OK
- プルリクエスト歓迎

## 📄 ライセンス

MIT License

自由に使用・改変・配布できます。

---

## 🎉 さあ始めましょう！

**[EXPO_TUTORIAL_README.md](EXPO_TUTORIAL_README.md)** を開いて、学習を開始してください。

Good luck & Happy Coding! 🚀

