import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'FocusBrowser:history';

export interface HistoryItem {
    url: string;
    timestamp: number;
}

export async function saveHistory(url: string) {
    const entry: HistoryItem = { url, timestamp: Date.now() };

    const existing = await AsyncStorage.getItem(HISTORY_KEY);
    const list: HistoryItem[] = existing ? JSON.parse(existing) : [];

    list.unshift(entry); // 新记录放在最前

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export async function getHistory(): Promise<HistoryItem[]> {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
}

export async function clearHistory(timeframe: number) {
    const list = await getHistory();
    const cutoff = Date.now() - timeframe;
    const filtered = list.filter(item => item.timestamp < cutoff);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

export async function clearAllHistory() {
    await AsyncStorage.removeItem(HISTORY_KEY);
}
