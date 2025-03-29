Page({
    data: {
        verses: [],
        isLoading: true,
    },

    onLoad() {
        this.loadInitialverses();
    },

    loadInitialverses() {
        this.getVerses(3)
            .then(verses => {
                this.setData({ verses, isLoading: false });
            })
            .catch(err => {
                console.error('Failed to load initial verses:', err);
            });
    },

    getVerses(size) {
        size = size || 1; // 默认获取一条
        return new Promise((resolve, reject) => {
            const db = wx.cloud.database();
            const _ = db.command;
            
            // 先获取偈语
            db.collection('verses').aggregate()
                .sample({ size })
                .end()
                .then(res => {
                    const verses = res.list;
                    
                    // 获取当前用户的点赞和收藏记录
                    return Promise.all([
                        db.collection('likes').where({
                            verse_id: _.in(verses.map(v => v._id))
                        }).get(),
                        db.collection('collections').where({
                            verse_id: _.in(verses.map(v => v._id))
                        }).get()
                    ]).then(([likesRes, collectionsRes]) => {
                        // 处理点赞和收藏状态
                        const likedVerses = new Set(likesRes.data.map(l => l.verse_id));
                        const collectedVerses = new Set(collectionsRes.data.map(c => c.verse_id));
                        
                        return verses.map(verse => ({
                            ...verse,
                            isLoading: false,
                            isLiked: likedVerses.has(verse._id),
                            isCollected: collectedVerses.has(verse._id)
                        }));
                    });
                })
                .then(verses => {
                    resolve(verses);
                })
                .catch(err => {
                    reject(err);
                });
        });
    },
    onSwiperChange(e) {
        const { current, source } = e.detail;
        const { verses } = this.data;
        console.log(current, source, verses.length);
        console.log(verses[current].verse);

        // 上滑查看下一条
        if (current >= verses.length-1) {
            this.getVerses(1)
                .then(newverse => {
                    let newverses = [...verses, ...newverse];
                    if (newverses.length > 256) {
                        newverses = newverses.slice(-256); // 使用slice替代splice
                    }
                    this.setData({ verses: newverses, isLoading: false });
                })
                .catch(err => {
                    console.error('Failed to load new verse:', err);
                });
        }
    },

    // 处理点赞
    handleLike(e) {
        const { index } = e.currentTarget.dataset;
        const { verses } = this.data;
        const verse = verses[index];
        verse.isLiked = !verse.isLiked;
        verse.likes += verse.isLiked ? 1 : -1;
        this.setData({ verses });

        const db = wx.cloud.database();
        
        if (verse.isLiked) {
            // 添加点赞记录
            db.collection('likes').add({
                data: {
                    verse_id: verse._id,
                    create_time: db.serverDate()
                }
            }).then(() => {
                console.log('点赞成功');
            }).catch(err => {
                console.error('点赞失败:', err);
                // 如果保存失败，回滚点赞状态
                verse.isLiked = false;
                verse.likes -= 1;
                this.setData({ verses });
            });
        } else {
            // 取消点赞，删除记录
            db.collection('likes').where({
                verse_id: verse._id
            }).remove().then(() => {
                console.log('取消点赞成功');
            }).catch(err => {
                console.error('取消点赞失败:', err);
                // 如果删除失败，恢复点赞状态
                verse.isLiked = true;
                verse.likes += 1;
                this.setData({ verses });
            });
        }
    },

    // 处理收藏
    handleCollect(e) {
        const { index } = e.currentTarget.dataset;
        const { verses } = this.data;
        const verse = verses[index];
        verse.isCollected = !verse.isCollected;
        this.setData({ verses });
        
        const db = wx.cloud.database();
        
        if (verse.isCollected) {
            // 添加收藏记录
            db.collection('collections').add({
                data: {
                    verse_id: verse._id,
                    create_time: db.serverDate()
                }
            }).then(() => {
                console.log('收藏成功');
            }).catch(err => {
                console.error('收藏失败:', err);
                // 如果保存失败，回滚收藏状态
                verse.isCollected = false;
                this.setData({ verses });
            });
        } else {
            // 取消收藏，删除记录
            db.collection('collections').where({
                verse_id: verse._id
            }).remove().then(() => {
                console.log('取消收藏成功');
            }).catch(err => {
                console.error('取消收藏失败:', err);
                // 如果删除失败，恢复收藏状态
                verse.isCollected = true;
                this.setData({ verses });
            });
        }
    },

    // 处理评论
    handleComment(e) {
        const { index } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/verse/verse?index=${index}`
        });
    },

    // 处理举报
    handleReport(e) {
        const { index } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/report/report?index=${index}`
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
            url: `/pages/detail/detail?_id=${verse._id}`
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
