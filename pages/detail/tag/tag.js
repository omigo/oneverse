const { getRandomQuote } = require('../../../data/quotes');

Page({
    data: {
        tag: null,
        relatedTags: [],
        quotes: []
    },

    onLoad(options) {
        const { name } = options;

        // TODO: 从服务器获取标签信息
        const tag = {
            name,
            quoteCount: 35,
            followerCount: 218,
            isFollowed: false,
            description: '这是标签的简介，介绍这个标签所代表的主题和内涵。'
        };

        // TODO: 从服务器获取相关标签
        const relatedTags = [
            { name: '修行', quoteCount: 28 },
            { name: '智慧', quoteCount: 42 },
            { name: '禅意', quoteCount: 35 },
            { name: '佛法', quoteCount: 56 }
        ];

        // TODO: 从服务器获取该标签下的偈语列表
        const quotes = Array(5).fill(0).map((_, index) => ({
            id: index + 1,
            ...getRandomQuote(),
            isLiked: false,
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 20),
            source: '佛经'
        }));

        this.setData({ tag, relatedTags, quotes });
    },

    // 处理关注
    handleFollow() {
        const { tag } = this.data;
        tag.isFollowed = !tag.isFollowed;
        tag.followerCount += tag.isFollowed ? 1 : -1;
        this.setData({ tag });

        // TODO: 发送关注请求到服务器
        wx.showToast({
            title: tag.isFollowed ? '已关注' : '已取消关注',
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

    // 导航到相关标签
    navigateToTag(e) {
        const { tag } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/tag/tag?name=${tag.name}`
        });
    },

    onShareAppMessage() {
        const { tag } = this.data;
        return {
            title: `${tag.name} 相关的偈语`,
            path: `/pages/detail/tag/tag?name=${tag.name}`
        };
    }
});