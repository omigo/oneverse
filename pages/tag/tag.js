const { getRandomVerse } = require('../../../data/verses');

Page({
    data: {
        tag: null,
        relatedTags: [],
        verses: []
    },

    onLoad(options) {
        const { name } = options;

        // TODO: 从服务器获取标签信息
        const tag = {
            name,
            verseCount: 35,
            followerCount: 218,
            isFollowed: false,
            description: '这是标签的简介，介绍这个标签所代表的主题和内涵。'
        };

        // TODO: 从服务器获取相关标签
        const relatedTags = [
            { name: '修行', verseCount: 28 },
            { name: '智慧', verseCount: 42 },
            { name: '禅意', verseCount: 35 },
            { name: '佛法', verseCount: 56 }
        ];

        // TODO: 从服务器获取该标签下的偈语列表
        const verses = Array(5).fill(0).map((_, index) => ({
            id: index + 1,
            ...getRandomVerse(),
            isLiked: false,
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 20),
            source: '佛经'
        }));

        this.setData({ tag, relatedTags, verses });
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
    navigateToVerse(e) {
        const { verse } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/verse/verse?id=${verse.id}`
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