Page({
    data: {
        verses: [],
        isLoading: true,
        useAPI: false
    },

    onLoad() {
        this.loadInitialverses();
    },

    loadInitialverses() {
        this.getverse(3)
            .then(verses => {
                this.setData({ verses, isLoading: false });
            })
            .catch(err => {
                console.error('Failed to load initial verses:', err);
            });
    },

    getverse(size) {
        size = size || 1; // 默认获取一条
        return new Promise((resolve, reject) => {
            wx.cloud.database().collection('verses').aggregate()
                .sample({ size })
                .end()
                .then(res => {
                    const verses = res.list.map(verse => ({
                        ...verse,
                        isLoading: false,
                        isLiked: false,
                        isCollected: false
                    }));
                    resolve(verses);
                })
                .catch(err => {
                    reject(err);
                });
        });
    },
    onSwiperChange(e) {
        const { current } = e.detail;
        const { verses } = this.data;

        // 当滑动到倒数第二条时，添加新的内容
        if (current === verses.length - 2) {
            this.getverse(1)
                .then(newverse => {
                    const newverses = [...verses, ...newverse];
                    if (newverses.length > 256) {
                        newverses = newverses.splice(-256);
                    }
                    this.setData({ verses: newverses, isLoading: false });
                })
                .catch(err => {
                    console.error('Failed to load initial verses:', err);
                });
        }
    },

    // 切换数据源
    toggleDataSource() {
        this.setData({
            useAPI: !this.data.useAPI,
            verses: []
        }, () => {
            this.loadInitialverses();
        });
    },

    // 处理点赞
    handleLike(e) {
        const { index } = e.currentTarget.dataset;
        const { verses } = this.data;
        const verse = verses[index];
        verse.isLiked = !verse.isLiked;
        verse.likes += verse.isLiked ? 1 : -1;
        this.setData({ verses });
    },

    // 处理收藏
    handleCollect(e) {
        const { index } = e.currentTarget.dataset;
        const { verses } = this.data;
        const verse = verses[index];
        verse.isCollected = !verse.isCollected;
        this.setData({ verses });
    },

    // 处理评论
    handleComment(e) {
        const { index } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/verse/verse?index=${index}`
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
            url: `/pages/author/author?name=${author}`
        });
    },

    // 导航到出处详情
    navigateToSource(e) {
        const { source } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/source/source?name=${source}`
        });
    },

    // 导航到标签详情
    navigateToTag(e) {
        const { tag } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/tag/tag?name=${tag}`
        });
    },

    // 导航到偈语详情页
    navigateToDetail(e) {
        const verse = e.currentTarget.dataset.verse;
        wx.navigateTo({
            url: `/pages/detail?_id=${verse._id}`
        });
    },

    onShareAppMessage(e) {
        const { index } = e.target.dataset;
        const { verses } = this.data;
        const verse = verses[index || 0];
        // 增加分享数
        verse.shares = (verse.shares || 0) + 1;
        this.setData({ verses });

        return {
            title: verse.verse,
            path: '/pages/index/index'
        };
    },

    onPullDownRefresh() {
        this.setData({ verses: [] }, () => {
            this.loadInitialverses();
            wx.stopPullDownRefresh();
        });
    }
});
