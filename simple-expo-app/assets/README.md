# Assets ディレクトリ

このディレクトリには、アプリで使用する画像やアイコンなどのアセットファイルを配置します。

## 必要なファイル（任意）

アプリを完全にビルドする場合は、以下のファイルが必要です：

- **icon.png** (1024x1024px): アプリアイコン
- **splash.png** (1284x2778px): スプラッシュ画面
- **adaptive-icon.png** (1024x1024px): Android用アダプティブアイコン
- **favicon.png** (48x48px): Web版のファビコン

## 開発中の注意

Expo Goでの開発中は、これらのファイルがなくてもアプリは正常に動作します。デフォルトのExpoアイコンが使用されます。

## アイコンの作成方法

### オンラインツールを使う
- [Figma](https://www.figma.com/) - 無料のデザインツール
- [Canva](https://www.canva.com/) - 簡単なグラフィックデザイン
- [App Icon Generator](https://appicon.co/) - アイコン生成ツール

### Expoの自動生成
```bash
# プロジェクトルートで実行
npx expo install expo-asset
```

## 詳細情報

アプリアイコンとスプラッシュスクリーンの詳細については、以下を参照してください：
- [Expo公式ドキュメント: App Icons](https://docs.expo.dev/develop/user-interface/app-icons/)
- [Expo公式ドキュメント: Splash Screens](https://docs.expo.dev/develop/user-interface/splash-screen/)
