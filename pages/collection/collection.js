Page({
    data: {
        verses: [],
        verseCount: 0,
        isLoading: true
    },

    onLoad() {
        this.loadCollectionData();
    },

    // 加载收藏数据
    loadCollectionData() {
        const db = wx.cloud.database();
        const _ = db.command;
        const $ = db.command.aggregate;

        // 获取用户ID
        const userInfo = wx.getStorageSync('userInfo');
        if (!userInfo || !userInfo._id) {
            wx.showToast({
                title: '请先登录',
                icon: 'none'
            });
            this.setData({ isLoading: false });
            return;
        }

        // 使用聚合操作获取收藏的偈语
        Promise.all([
            // 获取收藏总数
            db.collection('collections')
                .where({
                    user_id: userInfo._id
                })
                .count(),
            
            // 获取收藏的偈语
            db.collection('collections')
                .aggregate()
                .match({
                    user_id: userInfo._id
                })
                .lookup({
                    from: 'verses',
                    localField: 'verse_id',
                    foreignField: '_id',
                    as: 'verse'
                })
                .unwind('$verse')
                .replaceRoot({
                    newRoot: '$verse'
                })
                .sort({
                    createTime: -1
                })
                .limit(10)
                .end()
        ])
        .then(([countRes, versesRes]) => {
            // 处理偈语列表
            const verses = versesRes.list.map(verse => ({
                ...verse,
                isLiked: false, // TODO: 获取点赞状态
                likes: verse.likes || 0,
                comments: verse.comments || 0
            }));

            this.setData({ 
                verses,
                verseCount: countRes.total,
                isLoading: false
            });
        })
        .catch(err => {
            console.error('加载收藏数据失败：', err);
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            });
            this.setData({ isLoading: false });
        });
    },

    // 导航到偈语详情
    navigateToverse(e) {
        const { verse } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/detail?_id=${verse._id}`
        });
    },

    onShareAppMessage() {
        return {
            title: '我收藏的偈语',
            path: '/pages/collection/collection'
        };
    }
}); 