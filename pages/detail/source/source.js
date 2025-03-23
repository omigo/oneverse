const { getRandomQuote } = require('../../../data/quotes');

Page({
    data: {
        source: null,
        quotes: []
    },

    onLoad(options) {
        const { name } = options;

        // TODO: 从服务器获取出处信息
        const source = {
            name,
            quoteCount: 25,
            followerCount: 156,
            isFollowed: false,
            description: '这是出处的简介，介绍这部经典的历史背景、主要内容等信息。'
        };

        // TODO: 从服务器获取该出处的偈语列表
        const quotes = Array(5).fill(0).map((_, index) => ({
            id: index + 1,
            ...getRandomQuote(),
            isLiked: false,
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 20)
        }));

        this.setData({ source, quotes });
    },

    // 处理关注
    handleFollow() {
        const { source } = this.data;
        source.isFollowed = !source.isFollowed;
        source.followerCount += source.isFollowed ? 1 : -1;
        this.setData({ source });

        // TODO: 发送关注请求到服务器
        wx.showToast({
            title: source.isFollowed ? '已关注' : '已取消关注',
            icon: 'success'
        });
    },

    // 导航到偈语详情
    navigateToQuote(e) {
        const { quote } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/quote/quote?id=${quote.id}`
        });
    },

    onShareAppMessage() {
        const { source } = this.data;
        return {
            title: `${source.name}中的偈语`,
            path: `/pages/detail/source/source?name=${source.name}`
        };
    }
}); 