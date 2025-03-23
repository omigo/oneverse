const { getRandomQuote } = require('../../../data/quotes');

Page({
    data: {
        author: null,
        quotes: []
    },

    onLoad(options) {
        const { name } = options;

        // TODO: 从服务器获取作者信息
        const author = {
            name,
            quoteCount: 15,
            followerCount: 128,
            isFollowed: false,
            description: '这是作者的简介，介绍作者的生平、思想等信息。'
        };

        // TODO: 从服务器获取作者的偈语列表
        const quotes = Array(5).fill(0).map((_, index) => ({
            id: index + 1,
            ...getRandomQuote(),
            isLiked: false,
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 20),
            source: '佛经'
        }));

        this.setData({ author, quotes });
    },

    // 处理关注
    handleFollow() {
        const { author } = this.data;
        author.isFollowed = !author.isFollowed;
        author.followerCount += author.isFollowed ? 1 : -1;
        this.setData({ author });

        // TODO: 发送关注请求到服务器
        wx.showToast({
            title: author.isFollowed ? '已关注' : '已取消关注',
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
        const { author } = this.data;
        return {
            title: `${author.name}的偈语`,
            path: `/pages/detail/author/author?name=${author.name}`
        };
    }
}); 