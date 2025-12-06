// components/AddSiteTab.tsx
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADD_KEY = 'FocusBrowser:siteConfig';

const AddSiteTab = () => {
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

    useEffect(() => {
        loadSites();
    }, []);

    return (
        <View style={{ padding: 12 }}>
            <TextInput
                value={site}
                onChangeText={setSite}
                placeholder="输入网址，例如: abc.com"
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    height: 40,
                    marginBottom: 10,
                }}
            />
            <Button title="添加网站" onPress={handleAdd} />

            <Text style={{ marginTop: 20, fontWeight: 'bold' }}>已添加：</Text>
            <FlatList
                data={sites}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <Text style={{ paddingVertical: 4, color: '#333' }}>{item}</Text>
                )}
            />
        </View>
    );
};

export default AddSiteTab;