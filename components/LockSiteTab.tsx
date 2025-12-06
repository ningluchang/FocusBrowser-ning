// components/LockSiteTab.tsx

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Button,
    TouchableOpacity,
    Alert,
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToBlacklist } from '../utils/blacklist';

const ADD_KEY = 'FocusBrowser:siteConfig';

const durations = [
    { label: '1 分钟', value: 60 * 1000 },
    { label: '1 周', value: 7 * 24 * 60 * 60 * 1000 },
    { label: '2 周', value: 14 * 24 * 60 * 60 * 1000 },
    { label: '3 周', value: 21 * 24 * 60 * 60 * 1000 },
    { label: '4 周', value: 28 * 24 * 60 * 60 * 1000 },
    { label: '一个月', value: 31 * 24 * 60 * 60 * 1000 },
    { label: '三个月', value: 90 * 24 * 60 * 60 * 1000 },
    { label: '半年', value: 180 * 24 * 60 * 60 * 1000 },
    { label: '一年', value: 365 * 24 * 60 * 60 * 1000 },
];

const LockSiteTab = () => {
    const [duration, setDuration] = useState(durations[1].value); // 默认一小时锁定

    const handleLockAll = async () => {
        const stored = await AsyncStorage.getItem(ADD_KEY);
        const savedSites: string[] = stored ? JSON.parse(stored) : [];

        if (savedSites.length === 0) {
            Alert.alert('没有添加任何网站', '请先在“添加网站”页添加要屏蔽的网址');
            return;
        }

        for (const site of savedSites) {
            await addToBlacklist(site, duration);
        }

        Alert.alert('全部锁定成功', `所有网站已锁定 ${formatDuration(duration)}！`);
    };

    const formatDuration = (ms: number) => {
        if (ms < 60 * 60 * 1000) return `${ms / (60 * 1000)} 分钟`;
        if (ms < 24 * 60 * 60 * 1000) return `${ms / (60 * 60 * 1000)} 小时`;
        return `${ms / (24 * 60 * 60 * 1000)} 天`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>锁定所有已配置网站</Text>

            <Text style={styles.subtitle}>请选择锁定时长：</Text>
            <View style={styles.timeOptions}>
                {durations.map((item) => (
                    <TouchableOpacity
                        key={item.value}
                        style={[
                            styles.timeOption,
                            duration === item.value && styles.selected,
                        ]}
                        onPress={() => setDuration(item.value)}
                    >
                        <Text style={duration === item.value ? styles.selectedText : styles.optionText}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Button title="立即锁定全部" onPress={handleLockAll} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
    },
    title: {
        fontSize: 18,
        marginBottom: 12,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    timeOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    timeOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginRight: 8,
        marginBottom: 8,
    },
    selected: {
        backgroundColor: '#007bff',
    },
    optionText: {
        color: '#333',
    },
    selectedText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default LockSiteTab;