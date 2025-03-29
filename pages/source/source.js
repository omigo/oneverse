Page({
    data: {
        source: null,
        verses: [],
        isLoading: true
    },

    onLoad(options) {
        const { name } = options;
        if (!name) {
            wx.showToast({
                title: '参数错误',
                icon: 'none'
            });
            return;
        }
        this.loadSourceData(name);
    },

    // 加载出处数据
    loadSourceData(sourceName) {
        const db = wx.cloud.database();
        const $ = db.command.aggregate;

        // 使用聚合操作获取统计数据
        Promise.all([
            // 获取统计数据
            db.collection('verses')
                .aggregate()
                .match({
                    source: sourceName
                })
                .group({
                    _id: null,
                    verseCount: $.sum(1),
                    totalLikes: $.sum($.ifNull(['$likes', 0])),
                    totalCollections: $.sum($.ifNull(['$collections', 0])),
                    description: $.first('$source_description')
                })
                .end(),
            
            // 获取热门偈语
            db.collection('verses')
                .aggregate()
                .match({
                    source: sourceName
                })
                .sort({
                    likes: -1
                })
                .limit(10)
                .end()
        ])
        .then(([statsRes, versesRes]) => {
            if (!statsRes.list.length) {
                wx.showToast({
                    title: '出处不存在',
                    icon: 'none'
                });
                return;
            }

            const stats = statsRes.list[0];
            
            // 构建出处信息
            const source = {
                name: sourceName,
                verseCount: stats.verseCount,
                totalLikes: stats.totalLikes,
                totalCollections: stats.totalCollections,
                description: stats.description || ''
            };

            // 处理偈语列表
            const verses = versesRes.list.map(verse => ({
                ...verse,
                isLiked: false,
                likes: verse.likes || 0,
                comments: verse.comments || 0
            }));

            this.setData({ 
                source,
                verses,
                isLoading: false
            });
        })
        .catch(err => {
            console.error('加载出处数据失败：', err);
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
        const { source } = this.data;
        if (!source) return {};
        return {
            title: `${source.name}中的偈语`,
            path: `/pages/source/source?name=${source.name}`
        };
    }
}); 