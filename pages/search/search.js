Page({
    data: {
        searchText: '',
        currentTab: 'verses',
        searched: false,
        results: {
            verses: [],
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

        console.log('开始搜索：', searchText);
        // 从云数据库verses集合中查询数据， limit 100
        const db = wx.cloud.database();
        db.collection('verses').where(db.command.or([
            { verse: { $regex: searchText, $options: 'i' } },
            { source: { $regex: searchText, $options: 'i' } },
            { author: { $regex: searchText, $options: 'i' } },
            { tags: db.command.in([searchText]) }
        ])).get().then(res => {
            console.log(res)
            const allverses = res.data;

            // 搜索结果
            const results = {
                verses: [],
                authors: [],
                sources: [],
                tags: []
            };

            // 查询出来后，遍历verse，检查verse、source、author、tags字段是否包含searchText
            // 如果包含，将verse、author、source、tags添加到results中
            // 同时，统计作者、出处、标签的数量
            for (const verse of allverses) {
                if (this.matchSearch(verse.verse, searchText)) {
                    results.verses.push(verse);
                }
                if (this.matchSearch(verse.source, searchText)) {
                    results.sources.push(verse);
                }
                if (this.matchSearch(verse.author, searchText)) {
                    results.authors.push(verse);
                }
                for (const tag of verse.tags) {
                    if (this.matchSearch(tag, searchText)) {
                        results.tags.push(verse);
                        break;
                    }
                }
            }

            // 转换Map为数组
            const formattedResults = {
                verses: results.verses,
                authors: Array.from(results.authors.values()),
                sources: Array.from(results.sources.values()),
                tags: Array.from(results.tags.values())
            };

            this.setData({
                results: formattedResults,
                searched: true,
                hasResults: formattedResults.verses.length > 0
            });
        }).catch(err => {
            console.error('查询云数据库失败：', err);
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

    navigateToverse(e) {
        const { verse } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/verse/verse?id=${verse.id}`
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