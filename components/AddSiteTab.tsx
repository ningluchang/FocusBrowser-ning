// components/AddSiteTab.tsx
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isGlobalLocked } from '../utils/lockStorage';

const ADD_KEY = 'FocusBrowser:siteConfig';

const AddSiteTab = () => {
    const [locked, setLocked] = useState(false);
    const [site, setSite] = useState('');
    const [sites, setSites] = useState<string[]>([]);

    const saveSites = async (list: string[]) => {
        await AsyncStorage.setItem(ADD_KEY, JSON.stringify(list));
        setSites(list);
    };

    const handleAdd = async () => {
        const value = site.trim().toLowerCase();
        if (!value) return Alert.alert('请输入网址');

        const newList = [...new Set([...sites, value])];
        await saveSites(newList);
        setSite('');
        Alert.alert('添加成功');
    };

    const loadSites = async () => {
        const raw = await AsyncStorage.getItem(ADD_KEY);
        if (raw) setSites(JSON.parse(raw));
    };
    const handleDelete = async (siteToDelete: string) => {
        const newList = sites.filter(site => site !== siteToDelete);
        await AsyncStorage.setItem(ADD_KEY, JSON.stringify(newList));
        setSites(newList);
    };

    useEffect(() => {
        loadSites();
    }, []);

    useEffect(() => {
        const check = async () => {
            const lock = await isGlobalLocked();
            setLocked(lock);
        };

        check();
        const interval = setInterval(check, 60_000);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={{ padding: 12 }}>
            <TextInput
                value={site}
                onChangeText={setSite}
                placeholder="输入网址，例如: abc.com"
                editable={!locked}
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    height: 40,
                    paddingBottom: -8,
                    marginBottom: 10,
                }}
            />
            <Button
                title="添加网站"
                onPress={handleAdd}
                disabled={locked}
            />

            <Text style={{ marginTop: 20, fontWeight: 'bold' }}>已添加：</Text>
            <FlatList
                data={sites}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <View style={styles.itemRow}>
                        <Text>{item}</Text>
                        {!locked && (
                            <TouchableOpacity onPress={() => handleDelete(item)}>
                                <Text style={{ color: 'red', marginLeft: 10 }}>删除</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
});

export default AddSiteTab;
