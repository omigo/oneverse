Page({
    data: {
        tag: null,
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
        this.loadTagData(name);
    },

    // 加载标签数据
    loadTagData(tagName) {
        const db = wx.cloud.database();
        const $ = db.command.aggregate;

        // 使用聚合操作获取统计数据
        Promise.all([
            // 获取统计数据
            db.collection('verses')
                .aggregate()
                .match({
                    tags: tagName
                })
                .group({
                    _id: null,
                    verseCount: $.sum(1),
                    totalLikes: $.sum($.ifNull(['$likes', 0])),
                    totalCollections: $.sum($.ifNull(['$collections', 0])),
                    description: $.first('$tag_description')
                })
                .end(),
            
            // 获取热门偈语
            db.collection('verses')
                .aggregate()
                .match({
                    tags: tagName
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
                    title: '标签不存在',
                    icon: 'none'
                });
                return;
            }

            const stats = statsRes.list[0];
            
            // 构建标签信息
            const tag = {
                name: tagName,
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
                tag,
                verses,
                isLoading: false
            });
        })
        .catch(err => {
            console.error('加载标签数据失败：', err);
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
        const { tag } = this.data;
        if (!tag) return {};
        return {
            title: `#${tag.name}# 相关的偈语`,
            path: `/pages/tag/tag?name=${tag.name}`
        };
    }
});