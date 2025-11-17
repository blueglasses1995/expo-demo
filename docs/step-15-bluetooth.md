# Step 15: Bluetooth機能（expo-bluetooth）

## 🎯 このステップのゴール

- Bluetooth LE（Low Energy）デバイスとの接続
- 心拍計からデータを受信
- BLEプロトコルの基礎理解
- **技術解説**: BLEスタックとReact Nativeの連携

所要時間: 2時間

---

## 📘 Bluetooth LE とは

### BLE（Bluetooth Low Energy）の特徴

**従来のBluetooth（Classic）との違い:**

| 項目 | Classic Bluetooth | Bluetooth LE |
|------|-------------------|--------------|
| **用途** | 音楽、ファイル転送 | センサーデータ |
| **消費電力** | 高い | 超低消費電力 |
| **データ転送** | 連続的 | 断続的 |
| **接続速度** | 遅い | 速い |
| **通信距離** | 10〜100m | 10〜50m |
| **例** | ヘッドホン、キーボード | 心拍計、温度計、スマートウォッチ |

### BLEの用途

- 心拍計、血圧計
- フィットネストラッカー
- スマートウォッチ
- 温度・湿度センサー
- スマートロック
- ビーコン（iBeacon）

---

## 📦 ライブラリのインストール

**注意:** 2024年1月時点で、`expo-bluetooth` は実験的機能です。
実際のプロジェクトでは `react-native-ble-plx` を使うことが多いです。

```bash
# react-native-ble-plx を使う（推奨）
npx expo install react-native-ble-plx
```

---

## 🔬 技術解説: BLEのレイヤー構造

### 全体像

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: あなたのコード (JavaScript)                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  import { BleManager } from 'react-native-ble-plx'; │
│  await manager.startDeviceScan(...)                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Layer 3: React Native (react-native-ble-plx)       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  JavaScript API:                                    │
│  - startDeviceScan() → スキャン開始                  │
│  - connectToDevice() → 接続                         │
│  - discoverAllServicesAndCharacteristics()          │
│  - monitorCharacteristicForService() → データ受信    │
│                                                     │
│  ↕ (Bridge/JSI)                                     │
│                                                     │
│  Native Module:                                     │
│  - BleModule.m (iOS)                                │
│  - BleModule.kt (Android)                           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Layer 5: ネイティブBLEスタック                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  iOS: Core Bluetooth                                │
│  ┌───────────────────────────────────────────┐     │
│  │ CBCentralManager (中央管理)                │     │
│  │   ├─ scanForPeripherals() (スキャン)       │     │
│  │   └─ connect() (接続)                      │     │
│  │                                           │     │
│  │ CBPeripheral (周辺機器)                    │     │
│  │   ├─ discoverServices() (サービス検索)     │     │
│  │   └─ discoverCharacteristics() (特性検索)  │     │
│  │                                           │     │
│  │ CBCharacteristic (特性)                    │     │
│  │   ├─ readValue() (読み取り)                │     │
│  │   └─ setNotifyValue() (通知購読)           │     │
│  └───────────────────────────────────────────┘     │
│                                                     │
│  Android: Bluetooth LE API                          │
│  ┌───────────────────────────────────────────┐     │
│  │ BluetoothAdapter                          │     │
│  │   └─ startLeScan() (スキャン)              │     │
│  │                                           │     │
│  │ BluetoothGatt (GATT クライアント)          │     │
│  │   ├─ connect() (接続)                      │     │
│  │   ├─ discoverServices() (サービス検索)     │     │
│  │   └─ setCharacteristicNotification()      │     │
│  │                                           │     │
│  │ BluetoothGattCharacteristic (特性)        │     │
│  │   ├─ readValue() (読み取り)                │     │
│  │   └─ writeValue() (書き込み)               │     │
│  └───────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Bluetooth チップ (ハードウェア)                      │
│  📡 Bluetooth 無線通信                              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  BLEデバイス（心拍計、センサーなど）                   │
│  💓 実際のハードウェア                               │
└─────────────────────────────────────────────────────┘
```

---

## 🧠 BLE プロトコルの基礎

### GATT (Generic Attribute Profile) 構造

BLEデバイスはこの階層構造でデータを公開します：

```
デバイス (Device)
  └─ サービス (Service) ← 機能のカテゴリ
       └─ キャラクタリスティック (Characteristic) ← 実際のデータ
            └─ ディスクリプタ (Descriptor) ← 補足情報
```

### 例: 心拍計の構造

```
心拍計デバイス "Polar H10"
  │
  ├─ サービス: Heart Rate Service (UUID: 0x180D)
  │    │
  │    └─ キャラクタリスティック: Heart Rate Measurement (UUID: 0x2A37)
  │         ├─ 値: 72 bpm (心拍数)
  │         └─ 権限: Read, Notify
  │
  └─ サービス: Battery Service (UUID: 0x180F)
       │
       └─ キャラクタリスティック: Battery Level (UUID: 0x2A19)
            ├─ 値: 85% (バッテリー残量)
            └─ 権限: Read
```

### UUID とは

**Universally Unique Identifier** = 全世界でユニークなID

**標準UUID（Bluetooth SIG定義）:**
- Heart Rate Service: `0000180D-0000-1000-8000-00805f9b34fb`
- Heart Rate Measurement: `00002A37-0000-1000-8000-00805f9b34fb`

**カスタムUUID（独自デバイス）:**
- `A1B2C3D4-E5F6-7890-ABCD-EF1234567890`

---

## 📝 実装: 心拍計と接続

### 1. 権限設定

#### app.json

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSBluetoothAlwaysUsageDescription": "心拍計との接続に使用します",
        "NSBluetoothPeripheralUsageDescription": "心拍計との接続に使用します"
      }
    },
    "android": {
      "permissions": [
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_SCAN",
        "BLUETOOTH_CONNECT",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

**なぜ位置情報の権限が必要？（Android）**

Bluetooth でデバイスをスキャンすると、デバイスの位置が推定できてしまうため、
Androidではプライバシー保護の観点から位置情報の権限が必須です。

### 2. BLEマネージャーのセットアップ

```javascript
// services/BleService.js
import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

class BleService {
  constructor() {
    this.manager = new BleManager();
  }

  // 権限要求（Android）
  async requestPermissions() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;  // iOSは自動
  }

  // Bluetoothが有効かチェック
  async checkBluetoothState() {
    const state = await this.manager.state();
    console.log('Bluetooth state:', state);
    // "PoweredOn" なら使える
    return state === 'PoweredOn';
  }
}

export default new BleService();
```

### 3. デバイスのスキャン

```javascript
// screens/HeartRateScreen.js
import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import BleService from '../services/BleService';

export default function HeartRateScreen() {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    // 権限チェック
    BleService.requestPermissions();

    return () => {
      // クリーンアップ: スキャン停止
      BleService.manager.stopDeviceScan();
    };
  }, []);

  const startScan = () => {
    setDevices([]);
    setScanning(true);

    // スキャン開始（10秒後に自動停止）
    BleService.manager.startDeviceScan(
      null,  // すべてのサービスをスキャン
      null,  // オプション
      (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setScanning(false);
          return;
        }

        // 重複除去
        setDevices(prevDevices => {
          if (prevDevices.find(d => d.id === device.id)) {
            return prevDevices;
          }
          return [...prevDevices, device];
        });
      }
    );

    // 10秒後に停止
    setTimeout(() => {
      BleService.manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={startScan}
        disabled={scanning}
      >
        <Text style={styles.buttonText}>
          {scanning ? 'スキャン中...' : 'デバイスをスキャン'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.deviceItem}
            onPress={() => connectToDevice(item)}
          >
            <Text style={styles.deviceName}>
              {item.name || '名前なし'}
            </Text>
            <Text style={styles.deviceId}>{item.id}</Text>
            <Text style={styles.rssi}>信号強度: {item.rssi} dBm</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scanButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  rssi: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
```

### 4. デバイスに接続

```javascript
const [connectedDevice, setConnectedDevice] = useState(null);

const connectToDevice = async (device) => {
  try {
    console.log('Connecting to', device.name);

    // 接続
    const connected = await device.connect();
    console.log('Connected!');

    // サービスとキャラクタリスティックを検索
    await connected.discoverAllServicesAndCharacteristics();
    console.log('Services discovered');

    setConnectedDevice(connected);

    // 心拍数の監視を開始
    monitorHeartRate(connected);
  } catch (error) {
    console.error('Connection error:', error);
  }
};
```

### 5. 心拍数データの受信

```javascript
const [heartRate, setHeartRate] = useState(null);

const monitorHeartRate = (device) => {
  // Heart Rate Service の UUID
  const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
  const HEART_RATE_CHARACTERISTIC = '00002a37-0000-1000-8000-00805f9b34fb';

  device.monitorCharacteristicForService(
    HEART_RATE_SERVICE,
    HEART_RATE_CHARACTERISTIC,
    (error, characteristic) => {
      if (error) {
        console.error('Monitor error:', error);
        return;
      }

      // データをデコード
      const rawData = characteristic.value;  // Base64エンコードされたデータ
      const heartRateValue = parseHeartRate(rawData);

      console.log('Heart rate:', heartRateValue);
      setHeartRate(heartRateValue);
    }
  );
};

// Base64 → バイト配列 → 心拍数
const parseHeartRate = (base64Data) => {
  // Base64デコード
  const rawData = atob(base64Data);

  // 最初のバイトがフラグ
  const flags = rawData.charCodeAt(0);

  // 2バイト目が心拍数
  const heartRate = rawData.charCodeAt(1);

  return heartRate;
};
```

---

## 🔬 技術深掘り: データの流れ

### 心拍数通知の流れ

```
1. 心拍計が心拍数を測定
   ↓
2. BLEチップがデータをパケット化
   例: [0x00, 0x48] (72 bpm)
   ↓
3. GATT サーバーが Characteristic を更新
   ↓
4. 通知（Notification）を送信
   ↓
5. スマホのBluetooth チップが受信
   ↓
6. OS (iOS/Android) が通知を処理
   ↓ コールバック
7. Native Module (react-native-ble-plx)
   ↓ Base64エンコードしてブリッジ経由
8. JavaScript側にデータが届く
   ↓
9. monitorCharacteristicForService のコールバック実行
   characteristic.value = "AIg=" (Base64)
   ↓
10. デコード
    "AIg=" → [0x00, 0x48] → 72 bpm
    ↓
11. setState(72)
    ↓
12. UIが更新される
```

### Base64 エンコーディング

**なぜBase64？**

ブリッジを経由する際、バイナリデータ（`[0x00, 0x48]`）を
JSON文字列に変換する必要があるため、Base64エンコードされます。

```javascript
// Native側（Swift）
let data = Data([0x00, 0x48])
let base64 = data.base64EncodedString()  // "AIg="

// JavaScript側
const base64 = "AIg=";
const decoded = atob(base64);  // "\x00H"
const heartRate = decoded.charCodeAt(1);  // 72
```

---

## 🎨 UIの実装

### リアルタイム心拍数表示

```javascript
export default function HeartRateMonitor() {
  const [heartRate, setHeartRate] = useState(null);
  const [connectedDevice, setConnectedDevice] = useState(null);

  return (
    <View style={styles.container}>
      {connectedDevice ? (
        <View style={styles.monitorContainer}>
          <Text style={styles.deviceName}>{connectedDevice.name}</Text>

          <View style={styles.heartRateDisplay}>
            <Text style={styles.heartRateValue}>
              {heartRate || '--'}
            </Text>
            <Text style={styles.bpmLabel}>bpm</Text>
          </View>

          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={() => {
              connectedDevice.cancelConnection();
              setConnectedDevice(null);
            }}
          >
            <Text style={styles.buttonText}>切断</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text>デバイスを接続してください</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  monitorContainer: {
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  heartRateDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heartRateValue: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  bpmLabel: {
    fontSize: 24,
    color: '#666',
  },
  disconnectButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## ⚠️ よくある問題と解決法

### 問題1: スキャンしてもデバイスが見つからない

**原因と解決策:**

1. **権限がない**
   ```javascript
   const hasPermissions = await BleService.requestPermissions();
   if (!hasPermissions) {
     Alert.alert('権限が必要です');
   }
   ```

2. **Bluetoothがオフ**
   ```javascript
   const state = await BleService.manager.state();
   if (state !== 'PoweredOn') {
     Alert.alert('Bluetoothをオンにしてください');
   }
   ```

3. **デバイスがアドバタイズしていない**
   - 心拍計のペアリングモードを確認
   - デバイスの電源ON

### 問題2: 接続が切れる

**原因:**
- デバイスが範囲外
- バッテリー切れ
- 他のアプリと競合

**解決策:**
```javascript
device.onDisconnected((error, device) => {
  console.log('Disconnected:', device.name);
  // 再接続ロジック
  setTimeout(() => {
    reconnect(device);
  }, 2000);
});
```

### 問題3: データが読めない

**原因:** UUIDが間違っている

**解決策:** デバイスのドキュメントを確認
```javascript
// すべてのサービスを列挙
const services = await device.services();
services.forEach(async (service) => {
  console.log('Service:', service.uuid);

  const characteristics = await service.characteristics();
  characteristics.forEach((char) => {
    console.log('  Characteristic:', char.uuid, char.isReadable, char.isNotifiable);
  });
});
```

---

## 🆚 React Native vs ネイティブ

### React Native (react-native-ble-plx)

```javascript
// スキャン
manager.startDeviceScan(null, null, (error, device) => {
  console.log(device.name);
});

// 接続
const connected = await device.connect();

// データ受信
device.monitorCharacteristicForService(
  serviceUUID,
  characteristicUUID,
  (error, characteristic) => {
    const value = atob(characteristic.value);
  }
);
```

### iOS (Swift)

```swift
// スキャン
centralManager.scanForPeripherals(
    withServices: nil,
    options: nil
)

func centralManager(_ central: CBCentralManager,
                    didDiscover peripheral: CBPeripheral,
                    advertisementData: [String : Any],
                    rssi RSSI: NSNumber) {
    print(peripheral.name)
}

// 接続
centralManager.connect(peripheral, options: nil)

// データ受信
peripheral.setNotifyValue(true, for: characteristic)

func peripheral(_ peripheral: CBPeripheral,
                didUpdateValueFor characteristic: CBCharacteristic,
                error: Error?) {
    let data = characteristic.value
}
```

### Android (Kotlin)

```kotlin
// スキャン
bluetoothAdapter.bluetoothLeScanner.startScan(scanCallback)

val scanCallback = object : ScanCallback() {
    override fun onScanResult(callbackType: Int, result: ScanResult) {
        println(result.device.name)
    }
}

// 接続
val gatt = device.connectGatt(context, false, gattCallback)

// データ受信
gatt.setCharacteristicNotification(characteristic, true)

val gattCallback = object : BluetoothGattCallback() {
    override fun onCharacteristicChanged(
        gatt: BluetoothGatt,
        characteristic: BluetoothGattCharacteristic
    ) {
        val value = characteristic.value
    }
}
```

→ React Nativeなら1つのコードでiOS/Android両対応！

---

## 🎓 まとめ

### BLE 通信の流れ

```
1. 権限要求
   ↓
2. デバイススキャン
   ↓
3. 接続
   ↓
4. サービス/特性の検索
   ↓
5. 通知購読
   ↓
6. データ受信（リアルタイム）
```

### 技術スタック

```
あなたのコード (JavaScript)
  ↓
react-native-ble-plx (Bridge)
  ↓
iOS: Core Bluetooth / Android: Bluetooth LE API
  ↓
Bluetooth チップ (ハードウェア)
  ↓
BLEデバイス（心拍計など）
```

### 重要なポイント

1. **権限管理は複雑**
   - iOS: Info.plist に説明
   - Android: 複数の権限 + 位置情報

2. **非同期処理**
   - スキャン、接続、データ受信はすべて非同期
   - async/await またはコールバック

3. **UUIDの理解**
   - 標準UUID（Bluetooth SIG）
   - カスタムUUID（独自デバイス）

4. **データのデコード**
   - Base64 → バイト配列 → 意味のある値

---

## 🚀 次のステップ

これで高度なネイティブ機能の実装方法を理解しました！

次は **Step 16: バックグラウンドタスク** で、
アプリがバックグラウンドにいても動作する機能を学びます。

---

**お疲れ様でした！Bluetoothデバイスと通信できるようになりました 📡**

