export const searchEngines = [
    {
        name: 'Google',
        value: 'google',
        url: (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    },
    {
        name: 'Baidu',
        value: 'baidu',
        url: (query: string) => `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
    },
];

export type SearchEngineValue = 'google' | 'baidu';
export const SEARCH_ENGINE_KEY = 'FocusBrowser:searchEngine';
