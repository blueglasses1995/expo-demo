# Turborepo & Nx - Monorepo完全ガイド

## 📋 目次

1. [Monorepoとは](#1-monorepoとは)
2. [TurborepoとNxの比較](#2-turborepoとnxの比較)
3. [Turborepo完全解説](#3-turborepo完全解説)
4. [Nx完全解説](#4-nx完全解説)
5. [どちらを選ぶべきか](#5-どちらを選ぶべきか)
6. [ベストプラクティス](#6-ベストプラクティス)

---

## 1. Monorepoとは

### Monorepoの定義

**Monorepo (モノレポ)** = 複数のプロジェクトやパッケージを**1つのリポジトリ**で管理する開発手法

```
Monorepo:
my-project/
├── apps/
│   ├── web/          # Next.js アプリ
│   ├── mobile/       # React Native アプリ
│   └── desktop/      # Electron アプリ
├── packages/
│   ├── ui/           # 共通UIコンポーネント
│   ├── utils/        # 共通ユーティリティ
│   └── api-client/   # APIクライアント
└── package.json

vs

Polyrepo (複数リポジトリ):
web-app/          # 独立したリポジトリ
mobile-app/       # 独立したリポジトリ
shared-ui/        # 独立したリポジトリ
shared-utils/     # 独立したリポジトリ
```

### Monorepoのメリット

| メリット | 説明 |
|---------|------|
| **コード共有** | コンポーネント、ユーティリティ、型定義を簡単に共有 |
| **一貫性** | 依存関係のバージョンを統一管理 |
| **リファクタリング** | 複数プロジェクトを同時に変更可能 |
| **開発効率** | コードジャンプ、検索が1つのリポジトリで完結 |
| **CI/CD** | ビルド・テストを一元管理、変更部分のみビルド |
| **型安全性** | TypeScriptの型情報を共有 |

### Monorepoのデメリット

| デメリット | 対策 |
|-----------|------|
| **大きいリポジトリ** | Sparse Checkout、Shallow Clone |
| **ビルド時間** | キャッシュ、並列ビルド（Turborepo/Nx） |
| **権限管理** | CODEOWNERS、ブランチ保護 |
| **学習曲線** | ドキュメント整備、ツール統一 |

### 採用企業

- **Google**: 20億行以上のコードを1つのリポジトリで管理
- **Facebook/Meta**: React、React Native、Jest などを Monorepo で管理
- **Microsoft**: TypeScript、VS Code
- **Vercel**: Next.js、Turborepo
- **Nx**: Nx自身

---

## 2. TurborepoとNxの比較

### クイック比較表

| | Turborepo | Nx |
|---|-----------|-----|
| **開発元** | Vercel | Nrwl (現 Nx) |
| **初版リリース** | 2021年 | 2017年 |
| **主な言語** | Go | TypeScript/Node.js |
| **哲学** | シンプル、高速 | 統合、強力 |
| **学習曲線** | 低い | 中〜高 |
| **設定** | 最小限 | 詳細に設定可能 |
| **キャッシュ** | ✅ ローカル + リモート | ✅ ローカル + リモート |
| **タスクオーケストレーション** | ✅ | ✅ 強力 |
| **コード生成** | ❌ | ✅ Generators |
| **依存関係グラフ** | 基本的 | 高度（可視化あり） |
| **プラグインエコシステム** | 限定的 | 豊富 |
| **React Native対応** | ✅ | ✅ |
| **バンドルサイズ** | 小さい | 大きい |

### 思想の違い

#### Turborepoの思想

```
"シンプルで高速なビルドツール"
- 最小限の設定
- Goで書かれた高速なコア
- 既存のツール（npm/yarn/pnpm）と協調
- Remote Caching に注力
```

**ターゲット:**
- すでに動いているプロジェクトに追加したい
- 設定ファイルを最小限にしたい
- ビルドの高速化が主目的

#### Nxの思想

```
"統合開発環境としてのMonorepo"
- フルスタック開発をサポート
- コード生成（Generators）
- プラグインエコシステム
- 依存関係の深い理解
```

**ターゲット:**
- 新規プロジェクトを始める
- コード生成を活用したい
- エンタープライズ開発

---

## 3. Turborepo完全解説

### 3.1 技術的原理

#### アーキテクチャ

```
┌──────────────────────────────────────────────────┐
│  turbo.json (設定ファイル)                        │
│  - パイプライン定義                               │
│  - 依存関係                                       │
│  - キャッシュ設定                                 │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  Turborepo Core (Go)                             │
│  - タスクグラフ構築                               │
│  - 並列実行スケジューリング                       │
│  - キャッシュ管理                                 │
└──────────────────────┬───────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐
│  Local Cache        │    │  Remote Cache       │
│  (.turbo/)          │    │  (Vercel)           │
└─────────────────────┘    └─────────────────────┘
```

#### タスクグラフ

Turborepoは**タスクの依存関係グラフ**を構築し、並列実行を最適化します。

```javascript
// turbo.json
{
  "pipeline": {
    "build": {
      // build は他のパッケージの build に依存
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      // test は同じパッケージの build に依存
      "dependsOn": ["build"]
    },
    "lint": {
      // lint は他に依存しない（並列実行可能）
      "dependsOn": []
    }
  }
}
```

**実行例:**

```
パッケージ構成:
@myapp/ui -> @myapp/web が依存

turbo run build を実行すると:
1. @myapp/ui の build を実行
2. @myapp/ui が完了したら @myapp/web の build を実行
（並列化可能な部分は自動で並列実行）
```

#### キャッシュの仕組み

```
1. タスク実行前にハッシュを計算:
   - ソースコード
   - 依存関係（package.json）
   - 環境変数
   - turbo.json の設定

2. ハッシュでキャッシュを検索:
   - ローカルキャッシュ (.turbo/)
   - リモートキャッシュ (Vercel)

3. ヒットしたらキャッシュから復元
   ミスしたら実行してキャッシュに保存
```

### 3.2 機能一覧

#### コア機能

1. **タスクパイプライン**
   - 依存関係の自動解決
   - 並列実行
   - トポロジカルソート

2. **キャッシング**
   - ローカルキャッシュ
   - リモートキャッシュ（Vercel）
   - 増分ビルド

3. **フィルタリング**
   - 変更されたパッケージのみビルド
   - 特定のパッケージを指定

4. **Watch モード**
   - ファイル変更を監視して自動再ビルド

#### セットアップ

```bash
# 既存プロジェクトに追加
npm install turbo --save-dev

# グローバルインストール
npm install turbo --global
```

**turbo.json:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

#### パイプライン設定の詳細

**dependsOn:**

```json
{
  "build": {
    // ^ = 依存パッケージのタスク
    "dependsOn": ["^build"],

    // タスク名のみ = 同じパッケージ内のタスク
    "dependsOn": ["codegen"],

    // 複数指定
    "dependsOn": ["^build", "codegen"]
  }
}
```

**outputs:**

```json
{
  "build": {
    // キャッシュする出力ファイル
    "outputs": [
      "dist/**",
      ".next/**",
      "build/**",
      "!**/*.map"  // 除外
    ]
  }
}
```

**inputs:**

```json
{
  "test": {
    // このファイルが変更されたときのみ再実行
    "inputs": [
      "src/**/*.ts",
      "src/**/*.tsx",
      "test/**/*.test.ts"
    ]
  }
}
```

**env:**

```json
{
  "build": {
    // これらの環境変数がキャッシュキーに含まれる
    "env": ["NODE_ENV", "API_URL"],

    // すべての環境変数を含める
    "passThroughEnv": ["*"]
  }
}
```

#### コマンド

```bash
# すべてのパッケージで build を実行
turbo run build

# 複数のタスクを実行
turbo run build test lint

# 特定のパッケージのみ
turbo run build --filter=@myapp/web

# 変更されたパッケージのみ
turbo run build --filter=[HEAD^1]

# 依存するパッケージも含める
turbo run build --filter=@myapp/web...

# キャッシュをスキップ
turbo run build --force

# ドライラン
turbo run build --dry-run

# グラフを表示
turbo run build --graph
```

#### リモートキャッシュ

**Vercel との連携:**

```bash
# Vercel にログイン
npx turbo login

# リモートキャッシュを有効化
npx turbo link
```

**カスタムリモートキャッシュ:**

```json
{
  "remoteCache": {
    "signature": true
  }
}
```

```bash
# 環境変数で設定
TURBO_API="https://my-cache-server.com"
TURBO_TOKEN="my-secret-token"
TURBO_TEAM="my-team"
```

### 3.3 実践例

#### 基本的な Monorepo 構成

```
my-turborepo/
├── apps/
│   ├── web/                 # Next.js
│   │   ├── package.json
│   │   └── ...
│   └── mobile/              # React Native
│       ├── package.json
│       └── ...
├── packages/
│   ├── ui/                  # 共通UIコンポーネント
│   │   ├── package.json
│   │   └── src/
│   ├── utils/               # 共通ユーティリティ
│   │   ├── package.json
│   │   └── src/
│   └── tsconfig/            # 共通TypeScript設定
│       └── package.json
├── package.json             # ルート
├── turbo.json
└── pnpm-workspace.yaml
```

**ルート package.json:**

```json
{
  "name": "my-turborepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

**packages/ui/package.json:**

```json
{
  "name": "@myapp/ui",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src/"
  }
}
```

**apps/web/package.json:**

```json
{
  "name": "@myapp/web",
  "version": "0.0.0",
  "dependencies": {
    "@myapp/ui": "*",
    "@myapp/utils": "*",
    "next": "latest",
    "react": "latest"
  },
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start"
  }
}
```

---

## 4. Nx完全解説

### 4.1 技術的原理

#### アーキテクチャ

```
┌──────────────────────────────────────────────────┐
│  nx.json / workspace.json                        │
│  - プロジェクト定義                               │
│  - タスク設定                                     │
│  - キャッシュ設定                                 │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  Nx Core (TypeScript/Node.js)                    │
│  - プロジェクトグラフ構築                         │
│  - 依存関係分析                                   │
│  - タスクオーケストレーション                     │
│  - プラグインシステム                             │
└──────────────────────┬───────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐
│  Computation Cache  │    │  Nx Cloud           │
│  (.nx/cache/)       │    │  (リモートキャッシュ)│
└─────────────────────┘    └─────────────────────┘
```

#### プロジェクトグラフ

Nxは**プロジェクトグラフ**を構築し、依存関係を完全に理解します。

```bash
# グラフを可視化
npx nx graph
```

**出力例:**

```
@myapp/web → @myapp/ui → @myapp/utils
@myapp/mobile → @myapp/ui → @myapp/utils
```

#### Affected Analysis

変更されたファイルから影響を受けるプロジェクトを自動検出:

```bash
# 変更されたプロジェクトのみビルド
npx nx affected:build

# 変更されたプロジェクトのみテスト
npx nx affected:test
```

### 4.2 機能一覧

#### コア機能

1. **タスク実行**
   - 並列実行
   - 依存関係の自動解決
   - Affected Analysis

2. **キャッシング**
   - コンピュテーションキャッシュ
   - リモートキャッシュ（Nx Cloud）
   - 分散タスク実行

3. **コード生成（Generators）**
   - プロジェクト生成
   - コンポーネント生成
   - カスタムジェネレーター

4. **プラグインシステム**
   - React、Next.js、React Native、Node.js など
   - カスタムプラグイン作成可能

5. **モジュール境界ルール**
   - プロジェクト間の依存関係を制御
   - アーキテクチャ違反を検出

#### セットアップ

```bash
# 新規作成
npx create-nx-workspace@latest my-workspace

# 既存プロジェクトに追加
npx nx@latest init
```

**nx.json:**

```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist"]
    }
  },
  "namedInputs": {
    "default": ["{projectRoot}/**/*"],
    "production": ["!{projectRoot}/**/*.spec.ts"]
  }
}
```

#### コマンド

```bash
# プロジェクトでタスクを実行
npx nx build my-app

# すべてのプロジェクトで実行
npx nx run-many --target=build --all

# 並列実行数を指定
npx nx run-many --target=build --all --parallel=3

# 変更されたプロジェクトのみ
npx nx affected:build

# グラフを表示
npx nx graph

# 依存関係を確認
npx nx graph --affected
```

#### Generators（コード生成）

```bash
# React アプリを生成
npx nx g @nx/react:app my-app

# React ライブラリを生成
npx nx g @nx/react:lib my-lib

# コンポーネントを生成
npx nx g @nx/react:component Button --project=my-lib

# React Native アプリを生成
npx nx g @nx/react-native:app my-mobile-app
```

**カスタムジェネレーター:**

```typescript
// tools/generators/my-generator/index.ts
import { Tree, formatFiles, installPackagesTask } from '@nx/devkit';

export default async function (tree: Tree, schema: any) {
  // コード生成ロジック
  tree.write(
    `libs/${schema.name}/src/index.ts`,
    `export const hello = () => 'Hello from ${schema.name}';`
  );

  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}
```

使用:

```bash
npx nx g my-generator my-new-lib
```

#### モジュール境界ルール

**.eslintrc.json:**

```json
{
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "scope:web",
                "onlyDependOnLibsWithTags": ["scope:shared"]
              },
              {
                "sourceTag": "scope:mobile",
                "onlyDependOnLibsWithTags": ["scope:shared"]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

**project.json:**

```json
{
  "name": "web",
  "tags": ["scope:web", "type:app"]
}
```

これにより、`scope:web` のプロジェクトは `scope:shared` のライブラリのみに依存できます。

#### Nx Cloud

```bash
# Nx Cloud に接続
npx nx connect-to-nx-cloud

# 分散タスク実行
npx nx affected:build --parallel=10
```

**nx.json:**

```json
{
  "nxCloudAccessToken": "YOUR_TOKEN",
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "cacheableOperations": ["build", "test", "lint"],
        "accessToken": "YOUR_TOKEN"
      }
    }
  }
}
```

### 4.3 実践例

#### フルスタック Monorepo 構成

```
my-nx-workspace/
├── apps/
│   ├── web/                     # Next.js
│   ├── mobile/                  # React Native
│   ├── api/                     # Express API
│   └── desktop/                 # Electron
├── libs/
│   ├── shared/
│   │   ├── ui/                  # 共通UIコンポーネント
│   │   ├── utils/               # 共通ユーティリティ
│   │   └── types/               # 共通型定義
│   ├── web/
│   │   └── features/            # Web専用機能
│   └── mobile/
│       └── features/            # Mobile専用機能
├── tools/
│   └── generators/              # カスタムジェネレーター
├── nx.json
└── package.json
```

**libs/shared/ui/project.json:**

```json
{
  "name": "shared-ui",
  "sourceRoot": "libs/shared/ui/src",
  "projectType": "library",
  "tags": ["scope:shared", "type:ui"],
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/shared/ui",
        "tsConfig": "libs/shared/ui/tsconfig.lib.json",
        "packageJson": "libs/shared/ui/package.json",
        "main": "libs/shared/ui/src/index.ts"
      }
    },
    "test": {
      "executor": "@nx/jest:jest",
      "options": {
        "jestConfig": "libs/shared/ui/jest.config.ts"
      }
    }
  }
}
```

---

## 5. どちらを選ぶべきか

### シナリオ別推奨

#### Turborepo を選ぶべき場合

✅ **こんな人におすすめ:**
- シンプルな設定が好き
- 既存のプロジェクトに追加したい
- Next.js や React がメイン
- Vercel を使っている
- 学習コストを最小限にしたい

**ユースケース:**
- スタートアップの Web + Mobile アプリ
- Next.js マルチサイト運営
- シンプルな共通ライブラリ管理

#### Nx を選ぶべき場合

✅ **こんな人におすすめ:**
- エンタープライズ開発
- コード生成を活用したい
- 複雑な依存関係を管理したい
- モジュール境界を厳密に制御したい
- Angular、Node.js も使う

**ユースケース:**
- 大規模エンタープライズアプリ
- マイクロサービスアーキテクチャ
- 多様な技術スタックの統合

### 機能比較（詳細）

| 機能 | Turborepo | Nx |
|------|-----------|-----|
| **並列実行** | ✅ 自動 | ✅ 自動 |
| **キャッシュ** | ✅ 高速 | ✅ 高速 |
| **Affected分析** | 基本的 | ✅ 高度 |
| **コード生成** | ❌ | ✅ 強力 |
| **依存関係グラフ** | テキスト | ✅ ビジュアル |
| **プラグイン** | 限定的 | ✅ 豊富 |
| **モジュール境界** | ❌ | ✅ |
| **学習コスト** | 低 | 中〜高 |
| **設定の複雑さ** | シンプル | 詳細 |
| **パフォーマンス** | 非常に高速 | 高速 |
| **React Native** | ✅ | ✅ 専用プラグイン |
| **Electron** | ✅ | ✅ 専用プラグイン |

---

## 6. ベストプラクティス

### 共通のベストプラクティス

#### 1. パッケージ命名規則

```json
{
  "name": "@myapp/ui",           // ✅ Good: スコープ付き
  "name": "ui"                   // ❌ Bad: スコープなし
}
```

#### 2. 依存関係の管理

```json
// ルート package.json
{
  "devDependencies": {
    // 全プロジェクトで共通の開発依存
    "typescript": "5.0.0",
    "eslint": "8.0.0"
  }
}

// apps/web/package.json
{
  "dependencies": {
    // アプリ固有の依存のみ
    "next": "14.0.0",
    "@myapp/ui": "*"
  }
}
```

#### 3. TypeScript 設定の共有

```
packages/
└── tsconfig/
    ├── base.json      # 基本設定
    ├── react.json     # React用
    └── node.json      # Node.js用
```

**tsconfig/base.json:**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**apps/web/tsconfig.json:**

```json
{
  "extends": "@myapp/tsconfig/react.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

#### 4. 環境変数の管理

```bash
# ルート .env
DATABASE_URL=postgresql://localhost:5432/mydb

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Turborepo:

```json
{
  "pipeline": {
    "build": {
      "env": ["NEXT_PUBLIC_API_URL"]
    }
  }
}
```

#### 5. CI/CD 最適化

**GitHub Actions (Turborepo):**

```yaml
name: CI
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npx turbo run build --filter=[HEAD^1]
        env:
          TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
          TURBO_TEAM: ${{ secrets.TURBO_TEAM }}
```

**GitHub Actions (Nx):**

```yaml
name: CI
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - uses: nrwl/nx-set-shas@v3

      - name: Install dependencies
        run: npm install

      - name: Run affected
        run: npx nx affected:build
```

---

## 📚 参考リンク

### Turborepo
- [公式ドキュメント](https://turbo.build/repo/docs)
- [GitHub](https://github.com/vercel/turbo)
- [Examples](https://github.com/vercel/turbo/tree/main/examples)

### Nx
- [公式ドキュメント](https://nx.dev/)
- [GitHub](https://github.com/nrwl/nx)
- [Interactive Tutorial](https://nx.dev/getting-started/tutorials)

---

**Next: [21-monorepo-hands-on.md](./21-monorepo-hands-on.md) - Monorepo実践ハンズオン**
