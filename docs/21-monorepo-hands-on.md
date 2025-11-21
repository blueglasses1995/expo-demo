# Monorepo実践ハンズオン - Web/Mobile/Desktop統合プロジェクト

## 📋 このハンズオンで作るもの

**「タスク管理アプリ」を4つのプラットフォームで作成:**
- 🌐 **Web** (Next.js)
- 📱 **Mobile** (React Native/Expo) - iOS/Android
- 🖥️ **Desktop** (Electron)

**共通モジュール:**
- UI コンポーネント
- ビジネスロジック
- APIクライアント
- 型定義

---

## 🎯 学習目標

- [ ] Turborepo でマルチプラットフォーム Monorepo を構築
- [ ] 共通UIコンポーネントを作成して全プラットフォームで共有
- [ ] ビジネスロジックを分離して再利用
- [ ] プラットフォーム固有のコードを適切に管理
- [ ] ビルドとデプロイのワークフロー構築

---

## 📖 目次

1. [プロジェクト初期化](#1-プロジェクト初期化)
2. [共通ライブラリの作成](#2-共通ライブラリの作成)
3. [Webアプリの作成](#3-webアプリの作成)
4. [Mobileアプリの作成](#4-mobileアプリの作成)
5. [Desktopアプリの作成](#5-desktopアプリの作成)
6. [ビルドとデプロイ](#6-ビルドとデプロイ)
7. [トラブルシューティング](#7-トラブルシューティング)

---

## 1. プロジェクト初期化

### ステップ 1.1: プロジェクト作成

```bash
# プロジェクトディレクトリを作成
mkdir task-manager-monorepo
cd task-manager-monorepo

# package.json を作成
npm init -y

# pnpm を使用（推奨）
npm install -g pnpm
```

### ステップ 1.2: Workspace 設定

**pnpm-workspace.yaml:**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**package.json:**

```json
{
  "name": "task-manager-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.0.0"
}
```

### ステップ 1.3: Turborepo 設定

**turbo.json:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**", "android/app/build/**", "ios/build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### ステップ 1.4: ディレクトリ構造を作成

```bash
# ディレクトリを作成
mkdir -p apps packages
mkdir -p packages/{ui,utils,types,api-client}
mkdir -p apps/{web,mobile,desktop}

# .gitignore を作成
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Turbo
.turbo/

# Build outputs
dist/
build/
.next/

# Environment
.env*.local

# OS
.DS_Store
*.log

# IDE
.vscode/
.idea/

# Mobile
*.jks
*.p8
*.p12
*.key
*.mobileprovision
.expo/
android/app/build/
ios/Pods/
EOF
```

---

## 2. 共通ライブラリの作成

### ステップ 2.1: 型定義パッケージ

**packages/types/package.json:**

```json
{
  "name": "@task-manager/types",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**packages/types/tsconfig.json:**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**packages/types/src/index.ts:**

```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: Task['priority'];
  tags?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
  completed?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

### ステップ 2.2: ユーティリティパッケージ

**packages/utils/package.json:**

```json
{
  "name": "@task-manager/utils",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@task-manager/types": "*"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**packages/utils/src/index.ts:**

```typescript
import type { Task } from '@task-manager/types';

/**
 * 日付をフォーマット
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * タスクが期限切れかチェック
 */
export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.completed) return false;
  return new Date(task.dueDate) < new Date();
}

/**
 * タスクを優先度でソート
 */
export function sortByPriority(tasks: Task[]): Task[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * タスクをフィルタリング
 */
export function filterTasks(
  tasks: Task[],
  filter: {
    completed?: boolean;
    priority?: Task['priority'];
    tag?: string;
  }
): Task[] {
  return tasks.filter((task) => {
    if (filter.completed !== undefined && task.completed !== filter.completed) {
      return false;
    }
    if (filter.priority && task.priority !== filter.priority) {
      return false;
    }
    if (filter.tag && !task.tags?.includes(filter.tag)) {
      return false;
    }
    return true;
  });
}

/**
 * UUID生成（簡易版）
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * タスクの進捗率を計算
 */
export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}
```

**packages/utils/tsconfig.json:**

```json
{
  "extends": "../types/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

### ステップ 2.3: APIクライアント

**packages/api-client/package.json:**

```json
{
  "name": "@task-manager/api-client",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@task-manager/types": "*"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**packages/api-client/src/index.ts:**

```typescript
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  ApiResponse,
} from '@task-manager/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getTasks(): Promise<ApiResponse<Task[]>> {
    return this.request<Task[]>('/tasks');
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(input: CreateTaskInput): Promise<ApiResponse<Task>> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateTask(input: UpdateTaskInput): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleTask(id: string): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
```

### ステップ 2.4: UIコンポーネント（共通）

**packages/ui/package.json:**

```json
{
  "name": "@task-manager/ui",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@task-manager/types": "*",
    "@task-manager/utils": "*"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "react": "^18.0.0"
  }
}
```

**packages/ui/src/hooks/useTasks.ts:**

```typescript
import { useState, useEffect } from 'react';
import type { Task } from '@task-manager/types';
import { apiClient } from '@task-manager/api-client';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const response = await apiClient.getTasks();
    if (response.error) {
      setError(response.error);
    } else {
      setTasks(response.data);
    }
    setLoading(false);
  };

  const addTask = async (input: CreateTaskInput) => {
    const response = await apiClient.createTask(input);
    if (response.error) {
      setError(response.error);
      return null;
    }
    setTasks([...tasks, response.data]);
    return response.data;
  };

  const updateTask = async (input: UpdateTaskInput) => {
    const response = await apiClient.updateTask(input);
    if (response.error) {
      setError(response.error);
      return null;
    }
    setTasks(tasks.map((t) => (t.id === input.id ? response.data : t)));
    return response.data;
  };

  const deleteTask = async (id: string) => {
    const response = await apiClient.deleteTask(id);
    if (response.error) {
      setError(response.error);
      return false;
    }
    setTasks(tasks.filter((t) => t.id !== id));
    return true;
  };

  const toggleTask = async (id: string) => {
    const response = await apiClient.toggleTask(id);
    if (response.error) {
      setError(response.error);
      return null;
    }
    setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
    return response.data;
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    reload: loadTasks,
  };
}
```

**packages/ui/src/index.ts:**

```typescript
export * from './hooks/useTasks';
```

### ステップ 2.5: パッケージをビルド

```bash
# ルートディレクトリで実行
pnpm install

# すべてのパッケージをビルド
pnpm build
```

---

## 3. Webアプリの作成

### ステップ 3.1: Next.js アプリを作成

```bash
cd apps
npx create-next-app@latest web --typescript --app --no-src-dir
cd ..
```

### ステップ 3.2: 依存関係を追加

**apps/web/package.json:**

```json
{
  "name": "@task-manager/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    "@task-manager/types": "*",
    "@task-manager/utils": "*",
    "@task-manager/api-client": "*",
    "@task-manager/ui": "*",
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
```

### ステップ 3.3: Next.js 設定

**apps/web/next.config.js:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@task-manager/types',
    '@task-manager/utils',
    '@task-manager/api-client',
    '@task-manager/ui',
  ],
};

module.exports = nextConfig;
```

### ステップ 3.4: ページを作成

**apps/web/app/page.tsx:**

```tsx
'use client';

import { useState } from 'react';
import { useTasks } from '@task-manager/ui';
import { formatDate, sortByPriority, calculateProgress } from '@task-manager/utils';
import type { Task, CreateTaskInput } from '@task-manager/types';

export default function Home() {
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks();
  const [newTask, setNewTask] = useState<CreateTaskInput>({
    title: '',
    priority: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    await addTask(newTask);
    setNewTask({ title: '', priority: 'medium' });
  };

  const sortedTasks = sortByPriority(tasks);
  const progress = calculateProgress(tasks);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Task Manager - Web</h1>

        {/* Progress */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title..."
              className="flex-1 px-4 py-2 border rounded"
            />
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })
              }
              className="px-4 py-2 border rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-4">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-6 rounded-lg shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <h3
                    className={`text-lg font-semibold ${
                      task.completed ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-gray-600 mt-1">{task.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span className="capitalize">{task.priority}</span>
                    {task.dueDate && <span>Due: {formatDate(new Date(task.dueDate))}</span>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No tasks yet. Add one above!
          </div>
        )}
      </div>
    </main>
  );
}
```

---

## 4. Mobileアプリの作成

### ステップ 4.1: React Native (Expo) アプリを作成

```bash
cd apps
npx create-expo-app mobile --template blank-typescript
cd ..
```

### ステップ 4.2: 依存関係を追加

**apps/mobile/package.json:**

```json
{
  "name": "@task-manager/mobile",
  "version": "1.0.0",
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "dev": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "echo 'Mobile build requires EAS'",
    "clean": "rm -rf .expo node_modules"
  },
  "dependencies": {
    "@task-manager/types": "*",
    "@task-manager/utils": "*",
    "@task-manager/api-client": "*",
    "@task-manager/ui": "*",
    "expo": "~49.0.0",
    "expo-status-bar": "~1.6.0",
    "react": "18.2.0",
    "react-native": "0.72.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.14",
    "typescript": "^5.1.3"
  }
}
```

### ステップ 4.3: Metro 設定

**apps/mobile/metro.config.js:**

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Monorepo のルートディレクトリを取得
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo のパッケージを監視
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// パッケージを解決
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
```

### ステップ 4.4: App.tsx を作成

**apps/mobile/App.tsx:**

```tsx
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTasks } from '@task-manager/ui';
import { formatDate, sortByPriority, calculateProgress } from '@task-manager/utils';
import type { Task, CreateTaskInput } from '@task-manager/types';

export default function App() {
  const { tasks, loading, error, addTask, toggleTask, deleteTask } = useTasks();
  const [newTask, setNewTask] = useState<CreateTaskInput>({
    title: '',
    priority: 'medium',
  });

  const handleSubmit = async () => {
    if (!newTask.title.trim()) return;
    await addTask(newTask);
    setNewTask({ title: '', priority: 'medium' });
  };

  const sortedTasks = sortByPriority(tasks);
  const progress = calculateProgress(tasks);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text style={styles.title}>Task Manager - Mobile</Text>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Add Task */}
      <View style={styles.addTaskContainer}>
        <TextInput
          style={styles.input}
          value={newTask.title}
          onChangeText={(text) => setNewTask({ ...newTask, title: text })}
          placeholder="Task title..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity
              style={styles.taskContent}
              onPress={() => toggleTask(item.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  item.completed && styles.checkboxChecked,
                ]}
              />
              <View style={styles.taskInfo}>
                <Text
                  style={[
                    styles.taskTitle,
                    item.completed && styles.taskTitleCompleted,
                  ]}
                >
                  {item.title}
                </Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskPriority}>{item.priority}</Text>
                  {item.dueDate && (
                    <Text style={styles.taskDue}>
                      Due: {formatDate(new Date(item.dueDate))}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTask(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks yet. Add one above!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  progressContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontWeight: '600',
  },
  progressPercent: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  addTaskContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  taskItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  taskPriority: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  taskDue: {
    fontSize: 12,
    color: '#6b7280',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 48,
  },
  error: {
    color: '#ef4444',
    fontSize: 16,
  },
});
```

---

## 5. Desktopアプリの作成

### ステップ 5.1: Electron アプリのセットアップ

```bash
mkdir -p apps/desktop
cd apps/desktop
npm init -y
```

**apps/desktop/package.json:**

```json
{
  "name": "@task-manager/desktop",
  "version": "1.0.0",
  "main": "dist/main.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:react\" \"wait-on http://localhost:3000 && electron .\"",
    "dev:react": "vite",
    "build": "tsc && vite build && electron-builder",
    "clean": "rm -rf dist build"
  },
  "dependencies": {
    "@task-manager/types": "*",
    "@task-manager/utils": "*",
    "@task-manager/api-client": "*",
    "@task-manager/ui": "*",
    "electron-is-dev": "^2.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "concurrently": "^8.0.0",
    "electron": "^25.0.0",
    "electron-builder": "^24.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.0.0",
    "wait-on": "^7.0.0"
  },
  "build": {
    "appId": "com.task-manager.desktop",
    "files": ["dist/**/*"],
    "directories": {
      "output": "build"
    }
  }
}
```

### ステップ 5.2: Electron Main Process

**apps/desktop/src/main.ts:**

```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

**省略: apps/desktop/src/App.tsx は apps/web/app/page.tsx と同様の内容**

### ステップ 5.3: Vite 設定

**apps/desktop/vite.config.ts:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
  },
});
```

---

## 6. ビルドとデプロイ

### ステップ 6.1: すべてをビルド

```bash
# ルートディレクトリで実行
pnpm build
```

実行順序:
1. `packages/types` → ビルド
2. `packages/utils` → ビルド（types に依存）
3. `packages/api-client` → ビルド（types に依存）
4. `packages/ui` → ビルド（types, utils に依存）
5. `apps/web` → ビルド（全パッケージに依存）
6. `apps/mobile` → スキップ（EAS Build が必要）
7. `apps/desktop` → ビルド（全パッケージに依存）

### ステップ 6.2: 開発モード

```bash
# すべてを並列で起動
pnpm dev
```

または個別に:

```bash
# Web
cd apps/web && pnpm dev

# Mobile
cd apps/mobile && pnpm start

# Desktop
cd apps/desktop && pnpm dev
```

---

## 7. トラブルシューティング

### 問題 1: パッケージが見つからない

**エラー:**
```
Module not found: Can't resolve '@task-manager/ui'
```

**解決策:**
```bash
# ルートで再インストール
pnpm install

# パッケージを再ビルド
pnpm build
```

### 問題 2: Mobileアプリでモジュール解決エラー

**エラー:**
```
Unable to resolve module @task-manager/types
```

**解決策:**
```bash
# Metro キャッシュをクリア
cd apps/mobile
npx expo start --clear

# または
rm -rf .expo node_modules
pnpm install
```

### 問題 3: TypeScript型エラー

**解決策:**
```bash
# TypeScript設定を確認
# apps/*/tsconfig.json で "composite": true を確認

# 型情報を再生成
cd packages/types
pnpm build
```

---

## 🎉 完成！

これで以下が完成しました:

✅ **共通ライブラリ** - 型定義、ユーティリティ、APIクライアント、UI
✅ **Webアプリ** - Next.js
✅ **Mobileアプリ** - React Native (Expo)
✅ **Desktopアプリ** - Electron

全てのアプリで同じビジネスロジックとUIを共有しています！

**次のステップ:**
- CI/CDパイプラインの構築
- Storybookでコンポーネントカタログ作成
- E2Eテストの追加（Playwright, Detox）
- 本番デプロイ（Vercel, EAS, など）
