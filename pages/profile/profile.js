Page({
    data: {
        userInfo: {},
        stats: {
            likes: 0,
            collections: 0,
            comments: 0
        },
        follows: {
            authors: [],
            tags: [],
            sources: []
        },
        currentTab: 'authors'
    },

    onLoad() {
        this.loadUserInfo();
        this.loadStats();
        this.loadFollows();
    },

    // 加载用户信息
    loadUserInfo() {
        // TODO: 从本地存储或服务器获取用户信息
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
            this.setData({ userInfo });
        }
    },

    // 加载统计数据
    loadStats() {
        // TODO: 从服务器获取用户统计数据
        this.setData({
            stats: {
                likes: Math.floor(Math.random() * 100),
                collections: Math.floor(Math.random() * 50),
                comments: Math.floor(Math.random() * 30)
            }
        });
    },

    // 加载关注数据
    loadFollows() {
        // TODO: 从服务器获取用户关注数据
        this.setData({
            follows: {
                authors: [
                    { id: 1, name: '慧能', quoteCount: 10 },
                    { id: 2, name: '弘一法师', quoteCount: 8 },
                    { id: 3, name: '六祖坛经', quoteCount: 15 }
                ],
                tags: [
                    { id: 1, name: '禅意', quoteCount: 25 },
                    { id: 2, name: '智慧', quoteCount: 18 },
                    { id: 3, name: '修行', quoteCount: 12 }
                ],
                sources: [
                    { id: 1, name: '金刚经', quoteCount: 30 },
                    { id: 2, name: '心经', quoteCount: 20 },
                    { id: 3, name: '坛经', quoteCount: 15 },
                    { id: 4, name: '法华经', quoteCount: 18 },
                    { id: 5, name: '楞严经', quoteCount: 12 },
                    { id: 6, name: '维摩诘经', quoteCount: 8 }
                ]
            }
        });
    },

    // 选择头像
    onChooseAvatar(e) {
        const { avatarUrl } = e.detail;
        this.setData({
            'userInfo.avatarUrl': avatarUrl
        });
        wx.setStorageSync('userInfo', this.data.userInfo);
    },

    // 获取用户信息
    onGetUserInfo(e) {
        if (e.detail.userInfo) {
            this.setData({
                userInfo: e.detail.userInfo
            });
            wx.setStorageSync('userInfo', e.detail.userInfo);
        }
    },

    // 切换标签
    switchTab(e) {
        const { tab } = e.currentTarget.dataset;
        this.setData({
            currentTab: tab
        });
    },

    // 导航到列表页
    navigateToList(e) {
        const { type } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/list/${type}/${type}`
        });
    },

    // 导航到作者详情
    navigateToAuthor(e) {
        const { author } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/author/author?name=${author.name}`
        });
    },

    // 导航到标签详情
    navigateToTag(e) {
        const { tag } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/tag/tag?name=${tag.name}`
        });
    }
});