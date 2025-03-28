const { getRandomQuote, fetchQuoteFromAPI } = require('../../data/quotes');

Page({
    data: {
        quotes: [],
        isLoading: true,
        useAPI: false
    },

    onLoad() {
        this.loadInitialQuotes();
    },

    loadInitialQuotes() {
        const quotes = [];
        for (let i = 0; i < 3; i++) {
            quotes.push(this.getQuote());
        }
        this.setData({ quotes, isLoading: false });
    },

    getQuote() {
        const quote = getRandomQuote();
        return {
            ...quote,
            isLoading: false,
            isLiked: false,
            isCollected: false,
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 20)
        };
    },

    onSwiperChange(e) {
        const { current } = e.detail;
        const { quotes } = this.data;

        // 当滑动到倒数第二条时，添加新的内容
        if (current === quotes.length - 2) {
            const newQuotes = [...quotes, this.getQuote()];
            this.setData({ quotes: newQuotes });
        }
    },

    // 切换数据源
    toggleDataSource() {
        this.setData({
            useAPI: !this.data.useAPI,
            quotes: []
        }, () => {
            this.loadInitialQuotes();
        });
    },

    // 处理点赞
    handleLike(e) {
        const { index } = e.currentTarget.dataset;
        const { quotes } = this.data;
        const quote = quotes[index];
        quote.isLiked = !quote.isLiked;
        quote.likes += quote.isLiked ? 1 : -1;
        this.setData({ quotes });
    },

    // 处理收藏
    handleCollect(e) {
        const { index } = e.currentTarget.dataset;
        const { quotes } = this.data;
        const quote = quotes[index];
        quote.isCollected = !quote.isCollected;
        this.setData({ quotes });
    },

    // 处理评论
    handleComment(e) {
        const { index } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/quote/quote?index=${index}`
        });
    },

    // 处理举报
    handleReport(e) {
        const { index } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/report/report?index=${index}`
        });
    },

    // 导航到作者详情
    navigateToAuthor(e) {
        const { author } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/author/author?name=${author}`
        });
    },

    // 导航到出处详情
    navigateToSource(e) {
        const { source } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/source/source?name=${source}`
        });
    },

    // 导航到标签详情
    navigateToTag(e) {
        const { tag } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/tag/tag?name=${tag}`
        });
    },

    // 导航到偈语详情页
    navigateToDetail(e) {
        const quote = e.currentTarget.dataset.quote;
        wx.navigateTo({
            url: `/pages/detail/quote/quote?id=${quote.id}`
        });
    },

    onShareAppMessage(e) {
        const { index } = e.target.dataset;
        const quote = this.data.quotes[index || 0];
        return {
            title: quote.quote,
            path: '/pages/index/index'
        };
    },

    onPullDownRefresh() {
        this.setData({ quotes: [] }, () => {
            this.loadInitialQuotes();
            wx.stopPullDownRefresh();
        });
    }
}); 