import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { getHistory, clearHistory, clearAllHistory, HistoryItem } from '../utils/historyStorage';

const oneHour = 60 * 60 * 1000;
const oneDay = 24 * oneHour;
const sevenDays = 7 * oneDay;
interface HistoryPageProps {
    onSelectUrl: (url: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectUrl }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showOptions, setShowOptions] = useState(false);
    const options = [
        { label: '一小时内', value: 1 * 60 * 60 * 1000 },
        { label: '一天内', value: 24 * 60 * 60 * 1000 },
        { label: '七天内', value: 7 * 24 * 60 * 60 * 1000 },
    ];

    const load = async () => {
        const list = await getHistory();
        setHistory(list);
    };

    useEffect(() => {
        load();
    }, []);

    const handleClear = () => {
        Alert.alert('清除历史记录', '请选择清除范围：', [
            { text: '1小时内', onPress: () => clearRange(oneHour) },
            { text: '今天内', onPress: () => clearRange(oneDay) },
            { text: '7天内', onPress: () => clearRange(sevenDays) },
            { text: '全部清除', onPress: () => clearAll() },
            { text: '取消', style: 'cancel' },
        ]);
    };

    const clearRange = async (duration: number) => {
        await clearHistory(duration);
        await load();
        Alert.alert('清理成功');
    };

    const clearAll = async () => {
        await clearAllHistory();
        await load();
        Alert.alert('历史记录已清空');
    };

    const formatTime = (timestamp: number): string => {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📜 历史记录</Text>

            {history.length === 0 ? (
                <Text style={styles.empty}>暂无记录</Text>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => onSelectUrl(item.url)}>
                            <View style={styles.item}>
                                <Text style={styles.url}>{item.url}</Text>
                                <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
            <Modal
                visible={showOptions}
                transparent
                animationType="slide"
            >
                {/* ✅ 全屏覆盖，空白区域可点击关闭 */}
                <TouchableWithoutFeedback onPress={() => setShowOptions(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                {options.map(item => (
                                    <TouchableOpacity
                                        key={item.label}
                                        onPress={() => {
                                            clearRange(item.value);
                                            setShowOptions(false);
                                        }}
                                        style={styles.optionButton}
                                    >
                                        <Text style={styles.optionText}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}

                                <TouchableOpacity
                                    onPress={() => {
                                        clearAll();
                                        setShowOptions(false);
                                    }}
                                    style={[styles.optionButton, { backgroundColor: '#fdd' }]}
                                >
                                    <Text style={{ fontSize: 16, color: 'black', textAlign: 'center' }}>全部清除</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setShowOptions(false)}
                                    style={styles.optionButton}
                                >
                                    <Text style={styles.optionText}>取消</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowOptions(true)}
            >
                <Text style={styles.fabText}>清除</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
        marginBottom: 21,
    },

    modalContent: {
        backgroundColor: '#fff',
        padding: 14,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingBottom: 0, // ✅ 多一点底部，不遮住按钮
        marginBottom: -1, // ✅ 抬高整体Modal
    },

    optionButton: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },

    optionText: {
        fontSize: 16,
        textAlign: 'center',
    },

    container: {
        flex: 1,
        padding: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    empty: {
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    item: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingBottom: 6,
    },
    url: {
        fontSize: 14,
        color: '#000',
    },
    time: {
        fontSize: 12,
        color: '#666',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#007bff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 30,
        elevation: 6,
    },
    fabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default HistoryPage;
