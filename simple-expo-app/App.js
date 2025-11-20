import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [weight, setWeight] = useState('70.0');
  const [displayWeight, setDisplayWeight] = useState('70.0');

  const handleSave = () => {
    setDisplayWeight(weight);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>体重記録アプリ</Text>
      <Text style={styles.subtitle}>シンプルなExpoアプリのサンプル</Text>

      <View style={styles.card}>
        <Text style={styles.label}>現在の体重</Text>
        <Text style={styles.weightDisplay}>{displayWeight} kg</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>体重を入力</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="70.0"
        />
        <Button title="保存" onPress={handleSave} />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>このアプリについて</Text>
        <Text style={styles.infoText}>
          これはExpoを使った最もシンプルなアプリです。
        </Text>
        <Text style={styles.infoText}>
          • useState: 状態管理{'\n'}
          • TextInput: テキスト入力{'\n'}
          • Button: ボタン{'\n'}
          • StyleSheet: スタイリング
        </Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  weightDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 300,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});
