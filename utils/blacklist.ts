// utils/blacklist.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BlacklistEntry {
    url: string;
    unlockAt: number; // 时间戳（毫秒）
}

const STORAGE_KEY = 'FocusBrowser:blacklist';

export async function getBlacklist(): Promise<BlacklistEntry[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const list = data ? (JSON.parse(data) as BlacklistEntry[]) : [];
    const now = Date.now();
    // 自动过滤已过期的
    const active = list.filter(entry => entry.unlockAt > now);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(active));
    return active;
}

export async function addToBlacklist(
    url: string,
    durationMs: number,
): Promise<void> {
    const now = Date.now();
    const entry: BlacklistEntry = { url, unlockAt: now + durationMs };
    const list = await getBlacklist();
    list.push(entry);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function extractHostname(url: string): string {
    if (!url) return '';

    let hostname = url.trim().toLowerCase();

    // 1. 去掉协议头 (http://, https://, ftp:// 等)
    // 这里的逻辑是找到 "://" 并截取后面的部分
    if (hostname.includes('://')) {
        hostname = hostname.split('://')[1];
    }

    // 2. 去掉路径 (第一个 / 及其后面的内容)
    hostname = hostname.split('/')[0];

    // 3. 去掉参数 (第一个 ? 及其后面的内容)
    hostname = hostname.split('?')[0];

    // 4. 去掉端口号 (例如 :8080)
    // 注意：这里假设域名不包含冒号，IPv6地址可能需要特殊处理，但在普通网站拦截场景下这样足够了
    hostname = hostname.split(':')[0];

    return hostname;
}

export async function isUrlBlocked(targetUrl: string): Promise<boolean> {
    const list = await getBlacklist();
    const now = Date.now();

    // 1. 解析用户正在访问的域名
    // 比如访问: "https://m.baidu.com/news" -> 得到 "m.baidu.com"
    const targetHost = extractHostname(targetUrl);

    if (!targetHost) return false;

    return list.some(entry => {
        // 检查是否过期
        if (entry.unlockAt <= now) return false;

        // 2. 获取黑名单里的主域 (你保证了它是 "baidu.com")
        const blockedDomain = entry.url.toLowerCase();

        // 3. 核心匹配逻辑

        // 情况 A: 完全相等
        // 访问 "baidu.com" === 黑名单 "baidu.com"
        if (targetHost === blockedDomain) {
            return true;
        }

        // 情况 B: 子域名匹配
        // 访问 "m.baidu.com" 结尾是 ".baidu.com"
        // 访问 "www.baidu.com" 结尾是 ".baidu.com"
        // 必须加 "." 主要是为了防止 "mybaidu.com" (假冒网站) 被错误拦截
        if (targetHost.endsWith('.' + blockedDomain)) {
            return true;
        }

        return false;
    });
}