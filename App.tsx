import React, { useRef, useState } from 'react';
import {
    SafeAreaView,
    View,
    TextInput,
    Button,
    StyleSheet,
    StatusBar,
    Platform,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { addToBlacklist, isUrlBlocked } from './utils/blacklist';
import BlacklistConfig from './components/BlacklistConfig';
import AddSiteTab from './components/AddSiteTab';
import LockSiteTab from './components/LockSiteTab';
import BlacklistStatusTab from './components/BlacklistStatusTab';


const App = () => {
    const [url, setUrl] = useState<string>(''); // 当前加载的 URL
    const [inputUrl, setInputUrl] = useState<string>(''); // 地址栏内容
    const webViewRef = useRef<WebView>(null);
    const [showBlocked, setShowBlocked] = useState(false);
    const allowUrlRef = useRef<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [tabIndex, setTabIndex] = useState<'add' | 'lock' | 'status'>('add');

    const handleLoad = async () => {
        let formattedUrl = inputUrl.trim();
        if (!formattedUrl.startsWith('http')) {
            formattedUrl = 'https://' + formattedUrl;
        }

        const shouldBlock = await isUrlBlocked(formattedUrl);
        if (shouldBlock) {
            setShowBlocked(true);
            setUrl(''); // 清空当前加载页
            allowUrlRef.current = null;
            return;
        }

        setShowBlocked(false);
        allowUrlRef.current = formattedUrl; // 标记为允许加载
        setUrl(formattedUrl);
    };

    const goBack = () => {
        webViewRef.current?.goBack();
    };

    const goForward = () => {
        webViewRef.current?.goForward();
    };

    const reload = () => {
        webViewRef.current?.reload();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="white"
                translucent={false}
            />

            {/* 地址栏 */}
            <View style={styles.searchBarContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="请输入网址"
                    value={inputUrl}
                    onChangeText={setInputUrl}
                    onSubmitEditing={handleLoad}
                    returnKeyType="go"
                />
                <Button title="跳转" onPress={handleLoad} />
            </View>

            {/* 内容区域 */}
            <View style={styles.content}>
                {showSettings ? (
                    <>
                        {/* Tab 切换头部按钮 */}
                        <View style={styles.tabHeader}>
                            <TouchableOpacity
                                style={[styles.tabButton, tabIndex === 'add' && styles.tabButtonActive]}
                                onPress={() => setTabIndex('add')}
                            >
                                <Text>➕ 添加网站</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, tabIndex === 'lock' && styles.tabButtonActive]}
                                onPress={() => setTabIndex('lock')}
                            >
                                <Text>🔒 锁定全部</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, tabIndex === 'status' && styles.tabButtonActive]}
                                onPress={() => setTabIndex('status')}
                            >
                                <Text>📋 当前锁定</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Tab 实际页面内容 */}
                        {tabIndex === 'add' && <AddSiteTab />}
                        {tabIndex === 'lock' && <LockSiteTab />}
                        {tabIndex === 'status' && <BlacklistStatusTab />}
                    </>
                ) : url && !showBlocked ? (
                    <WebView
                        ref={webViewRef}
                        source={{ uri: url }}
                        style={styles.webview}
                        onShouldStartLoadWithRequest={(request) => {
                            const allowed = allowUrlRef.current;
                            const isSafe = !!allowed && request.url.startsWith(allowed);
                            return isSafe;
                        }}
                    />
                ) : showBlocked ? (
                    <View style={styles.blockedContainer}>
                        <Text style={styles.blockedTitle}>⚠️ 网站已被锁定</Text>
                        <Text style={styles.blockedText}>你在设置中锁定了此网站</Text>
                        <Text style={styles.blockedText}>请关掉当前标签页</Text>
                    </View>
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>欢迎使用自律浏览器</Text>
                        <Text style={styles.placeholderText}>请输入网址进行访问</Text>
                    </View>
                )}
            </View>

            {/* 底部工具栏 */}
            <View style={styles.toolbar}>
                <TouchableOpacity onPress={goBack}>
                    <Text style={styles.toolButton}>◀ 返回</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goForward}>
                    <Text style={styles.toolButton}>▶ 前进</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={reload}>
                    <Text style={styles.toolButton}>↻ 刷新</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowSettings(prev => !prev)}>
                    <Text style={styles.toolButton}>⚙ 设置</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    tabHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabButtonText: {
        fontSize: 16,
    },
    tabButtonActive: {
        backgroundColor: '#fff',
        borderBottomWidth: 2,
        borderColor: '#007bff',
    },
    blockedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fffbe6',
    },
    blockedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#c00',
        marginBottom: 12,
    },
    blockedText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 6,
    },
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    },
    searchBarContainer: {
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 40,
        marginRight: 8,
    },
    content: {
        flex: 1,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 16,
        color: '#777',
        marginBottom: 8,
    },
    webview: {
        flex: 1,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f8f8f8',
    },
    toolButton: {
        fontSize: 16,
        color: '#333',
    },
});

export default App;
