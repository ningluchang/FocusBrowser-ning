// components/BlacklistStatusTab.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getBlacklist, BlacklistEntry } from '../utils/blacklist';

const formatRemainingTime = (ms: number) => {
    if (ms <= 0) return '已过期';

    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60; // 新增秒数计算

    // 根据不同时间范围显示不同精度
    if (days > 0) {
        return `${days}天${hours}小时${minutes}分钟${seconds}秒`;
    }
    if (hours > 0) {
        return `${hours}小时${minutes}分钟${seconds}秒`;
    }
    if (minutes > 0) {
        return `${minutes}分钟${seconds}秒`;
    }
    return `${seconds}秒`; // 仅剩秒数时直接显示
};

const BlacklistStatusTab = () => {
    const [entries, setEntries] = useState<BlacklistEntry[]>([]);
    const [now, setNow] = useState(Date.now());

    const load = async () => {
        const list = await getBlacklist();
        setEntries(list);
    };

    useEffect(() => {
        load(); // 初次加载黑名单列表

        const refreshTimer = setInterval(() => {
            load();
        }, 60_000); // 每分钟更新一次真实数据

        return () => clearInterval(refreshTimer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now());
        }, 1000); // 每秒更新当前时间（只触发render，不刷新数据）

        return () => clearInterval(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔒 当前锁定列表</Text>

            {entries.length === 0 ? (
                <Text style={styles.empty}>暂无锁定网站</Text>
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={(item) => item.url}
                    renderItem={({ item }) => {
                        const remaining = item.unlockAt - now;
                        return (
                            <View style={styles.item}>
                                <Text style={styles.urlText}>{item.url}</Text>
                                <Text style={styles.timeText}>剩余：{formatRemainingTime(remaining)}</Text>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
        flex: 1,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    empty: {
        color: '#666',
        fontSize: 14,
    },
    item: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    urlText: {
        fontSize: 16,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
});

export default BlacklistStatusTab;