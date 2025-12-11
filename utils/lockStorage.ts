// utils/lockStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCK_END_KEY = 'FocusBrowser:globalLockUntil';

export async function setGlobalLockUntil(timestamp: number) {
    await AsyncStorage.setItem(LOCK_END_KEY, timestamp.toString());
}

export async function getGlobalLockUntil(): Promise<number> {
    const saved = await AsyncStorage.getItem(LOCK_END_KEY);
    return saved ? parseInt(saved, 10) : 0;
}

export async function isGlobalLocked(): Promise<boolean> {
    const ts = await getGlobalLockUntil();
    return Date.now() < ts;
}
