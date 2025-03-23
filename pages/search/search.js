const { getAllQuotes } = require('../../data/quotes');

Page({
    data: {
        searchText: '',
        currentTab: 'quotes',
        searched: false,
        results: {
            quotes: [],
            authors: [],
            sources: [],
            tags: []
        },
        hasResults: false
    },

    onLoad() {
        // 页面加载时的初始化
    },

    onSearchInput(e) {
        this.setData({
            searchText: e.detail.value
        });
    },

    onSearch() {
        const { searchText } = this.data;
        if (!searchText.trim()) return;

        // 获取所有偈语
        const allQuotes = getAllQuotes();

        // 搜索结果
        const results = {
            quotes: [],
            authors: new Map(),
            sources: new Map(),
            tags: new Map()
        };

        // 搜索偈语
        allQuotes.forEach(quote => {
            if (this.matchSearch(quote.quote, searchText) ||
                this.matchSearch(quote.author, searchText)) {
                results.quotes.push({
                    ...quote,
                    tags: ['禅意', '智慧', '修行'], // 示例标签
                    source: '佛经' // 示例出处
                });

                // 统计作者
                if (!results.authors.has(quote.author)) {
                    results.authors.set(quote.author, {
                        name: quote.author,
                        quoteCount: 1
                    });
                } else {
                    results.authors.get(quote.author).quoteCount++;
                }

                // 统计出处
                const source = '佛经'; // 示例出处
                if (!results.sources.has(source)) {
                    results.sources.set(source, {
                        name: source,
                        quoteCount: 1
                    });
                } else {
                    results.sources.get(source).quoteCount++;
                }

                // 统计标签
                ['禅意', '智慧', '修行'].forEach(tag => {
                    if (!results.tags.has(tag)) {
                        results.tags.set(tag, {
                            name: tag,
                            quoteCount: 1
                        });
                    } else {
                        results.tags.get(tag).quoteCount++;
                    }
                });
            }
        });

        // 转换Map为数组
        const formattedResults = {
            quotes: results.quotes,
            authors: Array.from(results.authors.values()),
            sources: Array.from(results.sources.values()),
            tags: Array.from(results.tags.values())
        };

        this.setData({
            results: formattedResults,
            searched: true,
            hasResults: formattedResults.quotes.length > 0
        });
    },

    matchSearch(text, searchText) {
        return text.toLowerCase().includes(searchText.toLowerCase());
    },

    switchTab(e) {
        const { tab } = e.currentTarget.dataset;
        this.setData({
            currentTab: tab
        });
    },

    navigateToQuote(e) {
        const { quote } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/quote/quote?id=${quote.id}`
        });
    },

    navigateToAuthor(e) {
        const { author } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/author/author?name=${author.name}`
        });
    },

    navigateToSource(e) {
        const { source } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/source/source?name=${source.name}`
        });
    },

    navigateToTag(e) {
        const { tag } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/tag/tag?name=${tag.name}`
        });
    }
}); 