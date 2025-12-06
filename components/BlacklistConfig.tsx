// components/BlacklistConfig.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    StyleSheet,
} from 'react-native';
import { addToBlacklist } from '../utils/blacklist';

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

const BlacklistConfig = () => {
    const [site, setSite] = useState('');
    const [selectedTime, setSelectedTime] = useState(durations[0].value);

    const handleAdd = async () => {
        if (!site.trim()) {
            Alert.alert('请输入有效域名');
            return;
        }

        await addToBlacklist(site.trim(), selectedTime);
        Alert.alert('添加成功', `${site.trim()} 已锁定`);
        setSite('');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>添加黑名单网址</Text>

            <TextInput
                style={styles.input}
                placeholder="例如: example.com"
                value={site}
                onChangeText={setSite}
            />

            <Text style={styles.subtitle}>选择锁定时长</Text>
            <View style={styles.timeOptions}>
                {durations.map((item) => (
                    <Text
                        key={item.value}
                        style={[
                            styles.timeOption,
                            selectedTime === item.value && styles.selected,
                        ]}
                        onPress={() => setSelectedTime(item.value)}
                    >
                        {item.label}
                    </Text>
                ))}
            </View>

            <Button title="添加到黑名单" onPress={handleAdd} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 16,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 6,
        paddingHorizontal: 10,
        height: 40,
        marginTop: 12,
    },
    timeOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        marginVertical: 10,
    },
    timeOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        backgroundColor: '#eee',
        marginTop: 5,
    },
    selected: {
        backgroundColor: '#007bff',
        color: 'white',
        fontWeight: 'bold',
    },
});

export default BlacklistConfig;