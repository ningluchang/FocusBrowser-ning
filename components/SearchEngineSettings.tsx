// components/SearchEngineSettings.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { searchEngines, SearchEngineValue } from '../utils/searchEngines';
import { getDefaultSearchEngine, setDefaultSearchEngine } from '../utils/searchEngineStorage';

const SearchEngineSettings = () => {
    const [selected, setSelected] = useState<SearchEngineValue>('google');

    useEffect(() => {
        getDefaultSearchEngine().then(setSelected);
    }, []);

    const handleChange = async (engine: SearchEngineValue) => {
        await setDefaultSearchEngine(engine);
        setSelected(engine);
        Alert.alert('已设置默认搜索引擎', engine.toUpperCase());
    };

    return (
        <View style={{ padding: 12 }}>
            <Text style={styles.title}>默认搜索引擎设置：</Text>
            {searchEngines.map(engine => (
                <TouchableOpacity
                    key={engine.value}
                    style={[styles.option, selected === engine.value && styles.optionSelected]}
                    onPress={() => handleChange(engine.value as SearchEngineValue)}
                >
                    <Text style={{ color: selected === engine.value ? '#fff' : '#000' }}>{engine.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    option: {
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#eee',
        borderRadius: 5,
    },
    optionSelected: {
        backgroundColor: '#007bff',
    },
});

export default SearchEngineSettings;
