# Expo完全ハンズオン教材

React経験者がスマホアプリ開発に挑戦するための実践的なハンズオン教材です。

## 📚 教材の特徴

- ✅ **段階的な学習**: シンプルな状態から始めて、1つずつライブラリを追加
- ✅ **詳細な技術解説**: React、React Native、Expo、ネイティブAPIの関係性を図解
- ✅ **実践的**: 健康管理アプリを実際に作りながら学ぶ
- ✅ **デプロイまで**: App Store / Google Play へのリリース手順も網羅
- ✅ **実務に即した内容**: デバッグ、つまずきポイント、効率的な開発方法
- ✅ **体系的な番号付け**: 全ドキュメントに番号を付けて学習順序を明確化

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

## 📖 ドキュメント構成（番号順）

### 01. はじめに

**[docs/01-curriculum-overview.md](docs/01-curriculum-overview.md)** - カリキュラム全体の概要  
全23ステップの構成、学習の進め方、完成するアプリの機能を説明

**[docs/02-tech-architecture.md](docs/02-tech-architecture.md)** - 技術アーキテクチャ完全解説  
React、React Native、Expo、ネイティブAPIの関係性を5層構造で図解

### 02. セットアップ

**[docs/03-setup-guide.md](docs/03-setup-guide.md)** - 開発環境のセットアップ  
Node.js、Expo CLI、VSCode、エミュレーターのインストールと設定

### 03. 基礎学習

**[docs/04-minimal-app.md](docs/04-minimal-app.md)** - 最小構成のExpoアプリ  
基本的なコンポーネント、スタイリング、技術的な仕組みの詳細解説

### 04. 実践チュートリアル（サンプル）

**[docs/09-camera-tutorial.md](docs/09-camera-tutorial.md)** - カメラ機能の実装  
expo-camera、権限管理、写真撮影、レイヤー構造の解説

**[docs/10-bluetooth-tutorial.md](docs/10-bluetooth-tutorial.md)** - Bluetooth機能の実装  
BLE通信、心拍計連携、GATTプロトコル、データ受信の仕組み

### 05. 開発ガイド

**[docs/05-debugging-guide.md](docs/05-debugging-guide.md)** - デバッグ・開発効率化ガイド  
ログ確認、Expo DevTools、React Native Debugger、エラー解決法

**[docs/06-common-pitfalls.md](docs/06-common-pitfalls.md)** - 実務でつまずきやすいポイント集  
プラットフォーム間の差異、権限エラー、ビルドエラー、よくある問題と解決法

**[docs/07-production-checklist.md](docs/07-production-checklist.md)** - 実務開発者の考慮事項完全ガイド  
パフォーマンス、セキュリティ、UX、テスト、監視など12カテゴリの実務知識

### 06. デプロイ

**[docs/08-deployment-guide.md](docs/08-deployment-guide.md)** - App Store / Google Play リリース手順  
EAS Build、TestFlight、審査対策、OTAアップデート

### 07. リファレンス

**[docs/11-quick-reference.md](docs/11-quick-reference.md)** - クイックリファレンス
よく使うコマンド、コンポーネント、Hooks、設定をすぐに参照

**[docs/12-faq.md](docs/12-faq.md)** - よくある質問（FAQ）
開発中によくある疑問と回答を網羅

**[docs/13-native-modules.md](docs/13-native-modules.md)** - ネイティブコード統合完全ガイド
Swift/KotlinでiOS/Androidネイティブコードを書く方法、Expo Modules API、Config Plugins、2024-2025年のトレンドアーキテクチャ（React Native New Architecture、Expo Router、Monorepoなど）

### 08. UI・アニメーションライブラリ ⭐NEW

**[docs/14-tamagui.md](docs/14-tamagui.md)** - Tamagui完全ガイド
ユニバーサルUIライブラリ、コンパイル時最適化、テーマシステム、50以上のプリビルトコンポーネント、React Native + Web対応

**[docs/15-nativewind.md](docs/15-nativewind.md)** - NativeWind完全ガイド
Tailwind CSSをReact Nativeで使用、ユーティリティファースト、ダークモード、レスポンシブデザイン

**[docs/16-reanimated.md](docs/16-reanimated.md)** - React Native Reanimated 3完全ガイド
高性能アニメーション、UIスレッド実行、Worklets、Layout Animations、60FPS保証

**[docs/17-moti.md](docs/17-moti.md)** - Moti完全ガイド
宣言的アニメーション、Framer Motion風API、Reanimatedベース、シンプルで直感的

**[docs/18-gesture-handler.md](docs/18-gesture-handler.md)** - React Native Gesture Handler完全ガイド
ネイティブジェスチャー処理、タップ・スワイプ・ピンチ・回転、Reanimated統合、遅延ゼロ

**[docs/19-skia.md](docs/19-skia.md)** - React Native Skia完全ガイド
高性能2Dグラフィックス、カスタム描画、エフェクト、データビジュアライゼーション、ゲーム開発

### 09. Monorepo開発 ⭐NEW

**[docs/20-turborepo-nx.md](docs/20-turborepo-nx.md)** - Turborepo & Nx完全ガイド
Monorepoの技術的原理・思想、TurborepoとNxの徹底比較、タスクオーケストレーション、キャッシュ、依存関係グラフ、選択基準

**[docs/21-monorepo-hands-on.md](docs/21-monorepo-hands-on.md)** - Monorepo実践ハンズオン
Web (Next.js)、Mobile (React Native/Expo)、Desktop (Electron) で共通モジュールを使うタスク管理アプリの構築、ステップバイステップ解説

---

## 🚀 3ステップで始める

### Step 1: 開発環境をセットアップ

\`\`\`bash
# Node.js をインストール（v18以上）
node --version

# エディタ（VSCode推奨）をインストール
# https://code.visualstudio.com/

# スマホに Expo Go をインストール
# iOS: App Store
# Android: Google Play
\`\`\`

### Step 2: シンプルなプロジェクトを作成

このリポジトリに含まれるサンプルプロジェクトで試せます：

\`\`\`bash
cd simple-expo-app
npm install
npx expo start
\`\`\`

### Step 3: ドキュメントを順番に読む

1. **[01-curriculum-overview.md](docs/01-curriculum-overview.md)** - 全体像を把握
2. **[02-tech-architecture.md](docs/02-tech-architecture.md)** - 技術的な仕組みを理解
3. **[03-setup-guide.md](docs/03-setup-guide.md)** - 環境構築
4. **[04-minimal-app.md](docs/04-minimal-app.md)** - 最初のアプリを作成
5. 以降、各ステップを順番に進める

**つまずいたら:**
- [05-debugging-guide.md](docs/05-debugging-guide.md) - デバッグ方法を確認
- [06-common-pitfalls.md](docs/06-common-pitfalls.md) - よくある問題を確認
- [12-faq.md](docs/12-faq.md) - FAQを確認

---

## 📚 学習の進め方

### 推奨順序

\`\`\`
Phase 1: 準備・基礎
├─ 01. カリキュラム概要を読む
├─ 02. 技術アーキテクチャを理解
├─ 03. 環境をセットアップ
└─ 04. 最小構成のアプリを作成

Phase 2: 実践
├─ 各ステップのチュートリアルを実践
├─ 09. カメラ機能（サンプル）
└─ 10. Bluetooth機能（サンプル）

Phase 3: 実務スキル
├─ 05. デバッグ手法を学ぶ
├─ 06. よくある問題を把握
└─ 07. 実務の考慮事項を理解

Phase 4: デプロイ
└─ 08. App Store / Google Play にリリース

参考資料（いつでも）
├─ 11. クイックリファレンス
└─ 12. FAQ
\`\`\`

---

## 📊 学習時間の目安

| Phase | 内容 | 所要時間 |
|-------|------|---------|
| Phase 1 | 準備・基礎 | 3〜5時間 |
| Phase 2 | 実践チュートリアル | 15〜20時間 |
| Phase 3 | 実務スキル | 5〜8時間 |
| Phase 4 | デプロイ | 4〜6時間 |
| **合計** | | **27〜39時間** |

週末に集中して取り組めば、**2〜3週間で完走**できます！

---

## 🎉 さあ始めましょう！

**[docs/01-curriculum-overview.md](docs/01-curriculum-overview.md)** を開いて、学習を開始してください。

または、シンプルなサンプルプロジェクトから始める：

\`\`\`bash
cd simple-expo-app
npm install
npx expo start
\`\`\`

**Good luck & Happy Coding! 🚀**
