import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, StatusBar, Platform, Text, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { addToBlacklist, isUrlBlocked, getBlacklist } from './utils/blacklist';
import { formatDuration } from './utils/time_fmt';
import BlacklistConfig from './components/BlacklistConfig';
import AddSiteTab from './components/AddSiteTab';
import LockSiteTab from './components/LockSiteTab';
import BlacklistStatusTab from './components/BlacklistStatusTab';
import SearchEngineSettings from './components/SearchEngineSettings';
import { getDefaultSearchEngine } from './utils/searchEngineStorage';
import { searchEngines } from './utils/searchEngines';
import { encouragements } from './utils/encouragements';
import { saveHistory } from './utils/historyStorage';
import HistoryPage from './components/HistoryPage';
import SettingsContainer from './components/SettingsContainer';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Orientation from 'react-native-orientation-locker';

const App = () => {
    const [url, setUrl] = useState<string>(''); // 当前加载的 URL
    const [inputUrl, setInputUrl] = useState<string>(''); // 地址栏内容
    const webViewRef = useRef<WebView>(null);
    const [showBlocked, setShowBlocked] = useState(false);
    const allowUrlRef = useRef<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    type TabIndex = 'add' | 'lock' | 'status' | 'search' | 'history';
    const [tabIndex, setTabIndex] = useState<TabIndex>('add');
    const [blockedSiteInfo, setBlockedSiteInfo] = useState<{
        site: string;
        remainingMs: number;
    } | null>(null);
    const [progress, setProgress] = useState(0);
    const [encourage, setEncourage] = useState('');
    const [isInSettings, setIsInSettings] = useState(false);
    const [settingsPage, setSettingsPage] = useState<string>(''); // '' 表示主设置页
    const [canGoBack, setCanGoBack] = useState(false);
    const [blockedDomains, setBlockedDomains] = useState<string[]>([]);

    function isLikelyUrl(input: string): boolean {
        if (input.includes(' ')) return false; // 空格 -> 明显是关键词
        if (/^[a-zA-Z]+:\/\//.test(input)) return true; // http:// https://
        if (/\.[a-z]{2,}$/.test(input)) return true; // abc.com
        return false;
    }

    const handleLoad = async () => {
        let input = inputUrl.trim();
        if (!input) return;

        let targetUrl = '';
        const engineName = await getDefaultSearchEngine();
        const engine = searchEngines.find(e => e.value === engineName) || searchEngines[0];

        if (isLikelyUrl(input)) {
            if (!input.startsWith('http')) {
                input = `https://${input}`;
            }
            targetUrl = input;
        } else {
            // 如果输入的是关键词：使用搜索引擎
            targetUrl = engine.url(input);
        }

        const matched = await isUrlBlocked(targetUrl);
        if (matched) {
            setShowBlocked(true);
            setBlockedSiteInfo({
                site: matched.url,
                remainingMs: matched.unlockAt - Date.now(),
            });
            setEncourage(encouragements[Math.floor(Math.random() * encouragements.length)]);

            allowUrlRef.current = null;
            return;
        }

        allowUrlRef.current = targetUrl;
        setShowBlocked(false);
        setBlockedSiteInfo(null);
        setUrl(targetUrl);
    };

    const renderSettingsPage = () => {
        // 主设置菜单页面
        if (settingsPage === '') {
            return (
                <SettingsContainer
                    title="设置"
                    onBack={() => setIsInSettings(false)}
                >
                    <View>
                        {[
                            { label: '📥 添加网站', id: 'add' },
                            { label: '🔒 锁定全部', id: 'lock' },
                            { label: '🧭 当前锁定', id: 'status' },
                            { label: '🔍 搜索引擎', id: 'search' },
                            { label: '📜 历史记录', id: 'history' },
                        ].map(item => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setSettingsPage(item.id)}
                                style={{ paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' }}
                            >
                                <Text style={{ fontSize: 16 }}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </SettingsContainer>
            );
        }

        // 子页面设置
        const back = () => setSettingsPage('');
        if (settingsPage === 'add')
            return (
                <SettingsContainer
                    onBack={back}
                    title="添加网站"
                >
                    <AddSiteTab />
                </SettingsContainer>
            );
        if (settingsPage === 'lock')
            return (
                <SettingsContainer
                    onBack={back}
                    title="锁定全部"
                >
                    <LockSiteTab />
                </SettingsContainer>
            );
        if (settingsPage === 'status')
            return (
                <SettingsContainer
                    onBack={back}
                    title="当前锁定"
                >
                    <BlacklistStatusTab />
                </SettingsContainer>
            );
        if (settingsPage === 'search')
            return (
                <SettingsContainer
                    onBack={back}
                    title="搜索设置"
                >
                    <SearchEngineSettings />
                </SettingsContainer>
            );
        if (settingsPage === 'history')
            return (
                <SettingsContainer
                    onBack={back}
                    title="浏览历史"
                >
                    <HistoryPage
                        onSelectUrl={url => {
                            setIsInSettings(false);
                            setSettingsPage('');
                            handleLoadUrlFromHistory(url); // ✅ 真正跳转
                        }}
                    />
                </SettingsContainer>
            );

        return null;
    };

    const handleLoadUrlFromHistory = async (targetUrl: string) => {
        const matched = await isUrlBlocked(targetUrl);
        if (matched) {
            setShowBlocked(true);
            setBlockedSiteInfo({
                site: matched.url,
                remainingMs: matched.unlockAt - Date.now(),
            });
            allowUrlRef.current = null;
            return;
        }

        setShowBlocked(false);
        setBlockedSiteInfo(null);
        allowUrlRef.current = targetUrl;
        setUrl(targetUrl);
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
    useEffect(() => {
        if (!showBlocked || !blockedSiteInfo) return;

        const interval = setInterval(() => {
            setBlockedSiteInfo(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    remainingMs: Math.max(prev.remainingMs - 1000, 0),
                };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [showBlocked, blockedSiteInfo]);
    const handleBack = () => {
        // 如果在提示页面
        if (showBlocked) {
            setShowBlocked(false);
            return true;
        }

        // 如果在设置页
        if (showSettings) {
            if (tabIndex !== 'add') {
                setTabIndex('add');
                return true;
            }
            setShowSettings(false);
            return true;
        }
        // ✅ 网页加载中处理：先取消加载
        if (webViewRef.current && progress < 1) {
            webViewRef.current.stopLoading(); // ✅ 取消当前加载请求
            setUrl(''); // 或者 goBack，如果你有追踪历史功能
            return true;
        }

        // ✅ 新加的网页内后退逻辑
        if (webViewRef.current && canGoBack) {
            webViewRef.current.goBack();
            return true;
        }

        // 如果当前有网页
        if (url) {
            setUrl('');
            return true;
        }

        return false; // 系统决定要不要退出App
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isInSettings) {
                if (settingsPage !== '') {
                    setSettingsPage('');
                } else {
                    setIsInSettings(false);
                }
                return true;
            }
            const handled = handleBack();
            return handled;
        });

        return () => backHandler.remove();
    }, [showBlocked, showSettings, tabIndex, url]);

    useEffect(() => {
        const loadBlockList = async () => {
            const list = await getBlacklist();
            setBlockedDomains(list.map(item => item.url));
        };
        loadBlockList();
    }, []);

    useEffect(() => {
        Orientation.unlockAllOrientations();

        return () => {
            Orientation.lockToPortrait(); // 回到竖屏
        };
    }, []);


    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="white"
                    translucent={false}
                />

                {/* 地址栏 */}
                <View style={styles.searchBarContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            value={inputUrl}
                            onChangeText={setInputUrl}
                            placeholder="请输入网址或搜索关键词"
                            returnKeyType="go"
                            onSubmitEditing={handleLoad}
                        />

                        {/* 内嵌的清除按钮 */}
                        {inputUrl.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setInputUrl('')}
                                style={styles.clearIcon}
                            >
                                <Text style={styles.clearIconText}>✖</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* 外部的“前往”按钮 */}
                    <TouchableOpacity
                        onPress={handleLoad}
                        style={styles.searchButton}
                    >
                        <Text style={styles.searchButtonText}>前往</Text>
                    </TouchableOpacity>
                </View>
                {/* ✅ 加进度条组件在搜索框下 */}
                {progress < 1 && (
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                    </View>
                )}

                {/* 内容区域 */}
                <View style={styles.content}>
                    {isInSettings ? (
                        renderSettingsPage()
                    ) : url && !showBlocked ? (
                        <WebView
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            allowsFullscreenVideo={true} // ✅ 支持视频全屏（核心！）
                            mediaPlaybackRequiresUserAction={false} // ✅ 自动播放优化（可选）
                            allowsInlineMediaPlayback={true} // ✅ 支持 HTML 视频标签
                            originWhitelist={['*']} // 可加载所有外域网页
                            ref={webViewRef}
                            source={{ uri: url }}
                            style={styles.webview}
                            onLoadProgress={({ nativeEvent }) => {
                                setProgress(nativeEvent.progress);
                            }}
                            onShouldStartLoadWithRequest={request => {
                                const url = request.url;
                                const matched = blockedDomains.find(domain => url.includes(domain.replace(/^www\./, '')));

                                if (matched) {
                                    setUrl('about:blank');
                                    setShowBlocked(true);
                                    setBlockedSiteInfo({
                                        site: matched,
                                        remainingMs: 999999,
                                    });
                                    setEncourage(encouragements[Math.floor(Math.random() * encouragements.length)]);
                                    return false;
                                }

                                return true;
                            }}
                            onLoadEnd={() => {
                                if (url) {
                                    saveHistory(url);
                                }
                            }}
                            onNavigationStateChange={navState => {
                                setCanGoBack(navState.canGoBack);
                                if (navState.url.includes('fullscreen') && navState.url.includes('video')) {
                                    Orientation.lockToLandscape(); // 横屏
                                }
                            }}
                        />
                    ) : showBlocked ? (
                        <View style={styles.blockedContainer}>
                            <Text style={styles.blockedTitle}>⚠️ 网站已被锁定</Text>

                            {blockedSiteInfo && (
                                <>
                                    <Text style={styles.blockedText}>你试图访问：{blockedSiteInfo.site}</Text>
                                    <Text style={styles.blockedText}>剩余时间：{formatDuration(blockedSiteInfo.remainingMs)}</Text>
                                    <Text style={styles.blockedText}>请关闭此页面，回归专注</Text>
                                </>
                            )}

                            <Text style={styles.encourageText}>{encourage}</Text>
                        </View>
                    ) : (
                        <View style={styles.placeholder}>
                            <Text style={styles.placeholderText}>请输入网址进行访问</Text>
                        </View>
                    )}
                </View>

                {/* 底部工具栏 */}
                <View style={styles.toolbar}>
                    <TouchableOpacity onPress={handleBack}>
                        <Text>◀ 返回</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={goForward}>
                        <Text style={styles.toolButton}>▶ 前进</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={reload}>
                        <Text style={styles.toolButton}>↻ 刷新</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setIsInSettings(true);
                            setSettingsPage(''); // 主设置页
                        }}
                    >
                        <Text>⚙ 设置</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    encourageText: {
        fontSize: 16,
        marginTop: 12,
        paddingHorizontal: 20,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#444',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },

    inputWrapper: {
        flex: 1,
        position: 'relative',
    },

    textInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10, // 右边多点距离留给 ❌
        backgroundColor: '#fff',
        paddingBottom: -8,
    },

    clearIcon: {
        position: 'absolute',
        right: 10,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        paddingHorizontal: 6,
    },

    clearIconText: {
        fontSize: 16,
        color: '#888',
    },

    searchButton: {
        marginLeft: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: '#007bff',
        borderRadius: 6,
    },

    searchButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    progressBarContainer: {
        height: 3,
        backgroundColor: '#eee',
    },
    progressBar: {
        height: 3,
        backgroundColor: '#007bff',
        // transition: 'width 0.2s',
    },
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
