# Expoアプリのデプロイ完全ガイド

## 🎯 このガイドの目的

開発したExpoアプリを**実際にユーザーに届ける**までの全手順を解説します。

- Expo Goでのテスト配布
- EAS Buildでのビルド
- App Store / Google Play へのリリース
- OTA（Over-The-Air）アップデート

---

## 📋 デプロイの選択肢

### 1. Expo Go（開発・社内テスト用）

**対象:** 開発中、チーム内でのテスト

**方法:**
```bash
npx expo start
# → QRコードをスキャン
```

**メリット:**
- ✅ 超高速（ビルド不要）
- ✅ 無料

**デメリット:**
- ❌ Expo Go がインストールされている必要がある
- ❌ カスタムネイティブコードは動かない
- ❌ 一般ユーザーには配布できない

---

### 2. Development Build（社内テスト用）

**対象:** Expo Goで動かない機能を含むアプリのテスト

**方法:**
```bash
npx eas build --profile development --platform ios
```

**メリット:**
- ✅ カスタムネイティブコードが動く
- ✅ TestFlightやInternal Testingで配布可能

**デメリット:**
- ❌ ビルドに時間がかかる（10〜30分）
- ❌ Expoアカウント必要

---

### 3. Preview Build（ベータテスト用）

**対象:** 外部テスター、ベータ版ユーザー

**方法:**
```bash
npx eas build --profile preview --platform ios
```

**配布方法:**
- **iOS:** TestFlight
- **Android:** Google Play Internal Testing

---

### 4. Production Build（本番リリース）

**対象:** App Store / Google Play での公開

**方法:**
```bash
npx eas build --profile production --platform all
```

---

## 🚀 EAS Build の使い方

### EASとは

**Expo Application Services (EAS)** は、Expoの公式ビルド・デプロイサービスです。

- クラウド上でビルド（Mac不要でiOSビルド可能）
- 証明書の自動管理
- OTAアップデート

### セットアップ

#### 1. Expoアカウント作成

https://expo.dev/ → Sign Up

#### 2. EAS CLI インストール

```bash
npm install -g eas-cli
```

#### 3. ログイン

```bash
eas login
```

メールアドレスとパスワードを入力。

#### 4. プロジェクトの設定

```bash
cd wellness-tracker
eas build:configure
```

これで `eas.json` が作成されます：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

---

## 📱 iOS アプリのビルドとリリース

### 事前準備

#### 1. Apple Developer Program 登録（年間 $99）

https://developer.apple.com/programs/

#### 2. App Store Connect でアプリを登録

1. https://appstoreconnect.apple.com/ にログイン
2. 「マイApp」→「+」→「新規App」
3. 必要情報を入力：
   - プラットフォーム: iOS
   - 名前: Wellness Tracker
   - 言語: 日本語
   - バンドルID: com.yourcompany.wellnesstracker
   - SKU: wellness-tracker-001

#### 3. app.json の設定

```json
{
  "expo": {
    "name": "Wellness Tracker",
    "slug": "wellness-tracker",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.wellnesstracker",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "写真撮影に使用します",
        "NSPhotoLibraryUsageDescription": "写真を保存・選択します",
        "NSLocationWhenInUseUsageDescription": "ウォーキングルートを記録します"
      }
    }
  }
}
```

### ビルド

```bash
eas build --platform ios
```

初回は以下の質問が表示されます：

```
? What would you like your iOS bundle identifier to be?
→ com.yourcompany.wellnesstracker

? Generate a new Apple Distribution Certificate?
→ Yes

? Generate a new Apple Provisioning Profile?
→ Yes
```

EASが自動的に証明書を作成・管理してくれます。

ビルドが完了すると（約20〜30分）：
```
✔ Build finished
   https://expo.dev/accounts/yourname/projects/wellness-tracker/builds/xxx
```

### TestFlight で配布（ベータテスト）

#### 1. .ipa ファイルをダウンロード

EASのビルドページからダウンロード。

#### 2. App Store Connect にアップロード

**方法1: Transporter アプリ（Mac）**
1. App Store から「Transporter」をダウンロード
2. .ipa ファイルをドラッグ＆ドロップ
3. 「配信」をクリック

**方法2: EAS Submit（推奨）**
```bash
eas submit --platform ios
```

自動的にApp Store Connectにアップロードされます。

#### 3. TestFlight でテスターを招待

1. App Store Connect → TestFlight
2. 処理が完了するまで待つ（10〜30分）
3. 「内部テスト」または「外部テスト」を選択
4. テスターのメールアドレスを追加
5. テスターにメールが届く → TestFlight アプリからインストール

### App Store リリース

#### 1. アプリ情報を入力

App Store Connect → アプリ → App Store

必要な情報：
- **スクリーンショット**（必須）
  - iPhone 6.7"、6.5"、5.5" の3サイズ
  - 各サイズ最低3枚
- **説明文**
  - 簡潔な説明（170文字以内）
  - 詳細な説明（4000文字以内）
- **キーワード**（100文字以内、カンマ区切り）
- **サポートURL**
- **プライバシーポリシーURL**（必須）
- **カテゴリ**（ヘルスケア＆フィットネスなど）
- **年齢制限**

#### 2. ビルドを選択

「ビルド」セクション → TestFlightでアップロードしたビルドを選択

#### 3. 価格設定

無料 or 有料を選択

#### 4. 審査に提出

「審査に提出」ボタンをクリック。

**審査期間:** 通常24〜48時間（最大1週間）

#### 5. リリース

審査が通ると「リリース準備完了」になります。
「このバージョンをリリース」をクリック → 数時間でApp Storeに公開。

---

## 🤖 Android アプリのビルドとリリース

### 事前準備

#### 1. Google Play Console アカウント作成（$25 買い切り）

https://play.google.com/console

#### 2. アプリを作成

1. Google Play Console にログイン
2. 「アプリを作成」
3. 必要情報を入力：
   - アプリ名: Wellness Tracker
   - デフォルトの言語: 日本語
   - アプリまたはゲーム: アプリ
   - 無料または有料: 無料

#### 3. app.json の設定

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.wellnesstracker",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

### ビルド

```bash
eas build --platform android
```

初回の質問：
```
? What would you like your Android package name to be?
→ com.yourcompany.wellnesstracker

? Generate a new Android Keystore?
→ Yes
```

EASが自動的にKeystoreを作成・管理します。

ビルド完了後、.aab（App Bundle）ファイルが生成されます。

### Google Play にアップロード

#### EAS Submit（推奨）

```bash
eas submit --platform android
```

初回のみ、Google Play のサービスアカウントキーが必要：

1. Google Play Console → 設定 → API アクセス
2. 「サービスアカウントを作成」
3. JSONキーをダウンロード
4. EASにアップロード

#### 手動アップロード

1. Google Play Console → アプリ → リリース → 制作
2. 「新しいリリースを作成」
3. .aab ファイルをアップロード

### 内部テスト

1. 「内部テスト」トラックを選択
2. テスターリストを作成
3. メールアドレスを追加
4. リリースを公開
5. テスターに共有リンクを送る

### 本番リリース

#### 1. ストア掲載情報を入力

- **アプリ名**
- **簡単な説明**（80文字）
- **詳細な説明**（4000文字）
- **スクリーンショット**
  - スマートフォン: 2〜8枚
  - 7インチタブレット: 2枚（任意）
  - 10インチタブレット: 2枚（任意）
- **アイコン**（512x512 PNG）
- **フィーチャーグラフィック**（1024x500）

#### 2. コンテンツのレーティング

質問票に回答 → 年齢制限が自動決定

#### 3. ターゲット層と内容

アプリのカテゴリ、対象年齢を設定

#### 4. プライバシーポリシー

URLを設定（必須）

#### 5. 本番トラックで公開

「制作」→「本番」→「新しいリリースを作成」

**審査期間:** 通常数時間〜数日

---

## 🔄 OTA（Over-The-Air）アップデート

### OTAとは

**アプリストアを経由せずに**、JavaScriptコードの更新をユーザーに配信する仕組み。

**使えるケース:**
- ✅ JavaScriptコードの変更
- ✅ 画像・アセットの追加/変更
- ✅ バグフィックス

**使えないケース:**
- ❌ ネイティブコード（Swift/Kotlin）の変更
- ❌ 依存ライブラリのネイティブ部分の変更
- ❌ app.json の変更（バージョン番号、権限など）

### EAS Update の使い方

#### 1. セットアップ

```bash
eas update:configure
```

#### 2. アップデートを公開

```bash
# コードを修正
# ...

# アップデートを公開
eas update --branch production --message "Fix login bug"
```

#### 3. ユーザーに配信される

アプリを次回起動したとき、自動的にアップデートがダウンロードされます。

#### チャンネル管理

```bash
# プレビュー版
eas update --branch preview --message "New feature preview"

# 本番版
eas update --branch production --message "Bug fixes"
```

### app.json の設定

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[your-project-id]",
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

---

## 📊 バージョン管理

### バージョン番号の付け方

**セマンティックバージョニング:** `major.minor.patch`

```
1.0.0 → 1.0.1 → 1.1.0 → 2.0.0
```

- **major**: 破壊的変更（大幅な仕様変更）
- **minor**: 新機能追加（後方互換性あり）
- **patch**: バグ修正

### iOS

```json
{
  "expo": {
    "version": "1.2.3",  // ユーザーに見えるバージョン
    "ios": {
      "buildNumber": "10"  // ビルドごとに増やす（整数）
    }
  }
}
```

### Android

```json
{
  "expo": {
    "version": "1.2.3",  // ユーザーに見えるバージョン
    "android": {
      "versionCode": 10  // ビルドごとに増やす（整数）
    }
  }
}
```

**重要:** `versionCode` / `buildNumber` は必ず増やす必要があります。

---

## 🎨 アプリアイコン・スプラッシュスクリーン

### アプリアイコン

#### サイズ要件

- **icon.png**: 1024x1024 (iOS/Android共通)
- **adaptive-icon.png**: 1024x1024 (Android用、透過PNG)

#### 作成方法

1. デザインツールで1024x1024のアイコンを作成
2. `assets/icon.png` に配置
3. `assets/adaptive-icon.png` に配置（Android用）

#### app.json に設定

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

### スプラッシュスクリーン

アプリ起動時に表示される画面。

#### サイズ

1284x2778 (最大iPhone サイズ)

#### app.json に設定

```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FFFFFF"
    }
  }
}
```

---

## ✅ リリース前チェックリスト

### 技術面

- [ ] iOS/Androidの実機でテスト済み
- [ ] すべての権限が正しく動作する
- [ ] オフライン時の動作確認
- [ ] メモリリークがない
- [ ] クラッシュしない
- [ ] パフォーマンスが良好（60fps）

### UI/UX

- [ ] すべての画面サイズで表示確認
- [ ] ダークモード対応（任意）
- [ ] エラーメッセージが分かりやすい
- [ ] ローディング表示がある
- [ ] 戻るボタン（Android）が正しく動く

### 法的・規約

- [ ] プライバシーポリシー作成
- [ ] 利用規約作成
- [ ] App Store Review Guidelines 確認
- [ ] Google Play Developer Policy 確認
- [ ] 個人情報の取り扱いが適切

### ストア掲載

- [ ] スクリーンショット作成（各サイズ）
- [ ] アプリ説明文（魅力的に）
- [ ] キーワード選定（SEO対策）
- [ ] カテゴリ選択
- [ ] 価格設定

---

## 🐛 審査リジェクト対策

### よくあるリジェクト理由

#### 1. 権限の説明が不十分

```json
// ❌ ダメ
"NSCameraUsageDescription": "カメラを使用します"

// ✅ 良い
"NSCameraUsageDescription": "食事の写真を記録するためにカメラを使用します"
```

#### 2. クラッシュする

→ TestFlightで十分にテストする

#### 3. 機能が不完全

→ すべての機能が動作することを確認

#### 4. プライバシーポリシーがない

→ 必ず作成してURLを設定

#### 5. 未成年保護

→ 年齢制限、ペアレンタルコントロール対応

---

## 📈 リリース後

### アナリティクス

```bash
npx expo install expo-analytics-amplitude
# または
npx expo install @react-native-firebase/analytics
```

### クラッシュレポート

```bash
npx expo install sentry-expo
```

### アプリ内フィードバック

ユーザーからのフィードバックを受け付ける仕組みを用意。

---

## 🎓 まとめ

### デプロイの流れ

```
1. 開発
   ↓
2. Expo Goでテスト
   ↓
3. Development Build でテスト
   ↓
4. TestFlight/Internal Testing でベータテスト
   ↓
5. ストア情報を入力
   ↓
6. Production Build
   ↓
7. 審査に提出
   ↓
8. リリース 🎉
   ↓
9. OTA で継続的に改善
```

### コスト

- **Apple Developer Program**: $99/年
- **Google Play Console**: $25（買い切り）
- **EAS Build**: 無料枠あり、有料プランは$29/月〜

---

## 📚 参考リンク

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)

---

**お疲れ様でした！世界中のユーザーにアプリを届けましょう 🚀**

