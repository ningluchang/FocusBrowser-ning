import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
    onBack: () => void;
    title: string;
    children: React.ReactNode;
}

const SettingsContainer = ({ onBack, title, children }: Props) => {
    return (
        <View style={styles.container}>
            {/* 顶部导航 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backText}>← 返回</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
            </View>

            {/* 设置内容主体 */}
            <View style={styles.content}>{children}</View>
        </View>
    );
};

export default SettingsContainer;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingHorizontal: 12,
        backgroundColor: '#f8f8f8',
    },
    backText: {
        fontSize: 18,
        color: '#007bff',
        marginRight: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
});
