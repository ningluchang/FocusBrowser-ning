import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEARCH_ENGINE_KEY, SearchEngineValue } from './searchEngines';

export async function setDefaultSearchEngine(value: SearchEngineValue) {
    await AsyncStorage.setItem(SEARCH_ENGINE_KEY, value);
}

export async function getDefaultSearchEngine(): Promise<SearchEngineValue> {
    const saved = await AsyncStorage.getItem(SEARCH_ENGINE_KEY);
    return (saved as SearchEngineValue) || 'bing'; // 默认用 Bing
}
