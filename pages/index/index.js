Page({
    data: {
        verses: [],
        isLoading: true,
        currentIndex: 0,
        touchStartY: 0,
        touchMoveY: 0,
        touchEndY: 0,
        minSwipeDistance: 50, // 最小滑动距离
        preloadCount: 10,
        openid: null, // 添加openid字段
    },

    onLoad() {
        this.getOpenId();
        this.loadInitialverses();
    },

    // 获取用户openid
    getOpenId() {
        return new Promise((resolve, reject) => {
            wx.cloud.callFunction({
                name: 'getOpenId'
            }).then(res => {
                console.log('获取openid成功：', res.result.openid);
                this.setData({
                    openid: res.result.openid
                });
                resolve(res.result.openid);
            }).catch(err => {
                console.error('获取openid失败：', err);
                reject(err);
            });
        });
    },

    loadInitialverses() {
        this.getVerses(this.data.preloadCount)
            .then(verses => {
                this.setData({ 
                    verses, 
                    isLoading: false,
                });
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
                    const verses = res.list.map(x => {
                        x.collections = x.collections || 0;
                        x.likes = x.likes || 0;
                        return x
                    });
                    
                    // 获取当前用户的点赞和收藏记录
                    return Promise.all([
                        db.collection('likes').where({
                            _openid: this.data.openid,
                            verse_id: _.in(verses.map(v => v._id))
                        }).get(),
                        db.collection('collections').where({
                            _openid: this.data.openid,
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

    // 触摸开始事件
    handleTouchStart(e) {
        this.setData({
            touchStartY: e.touches[0].clientY
        });
    },

    // 触摸移动事件
    handleTouchMove(e) {
        this.setData({
            touchMoveY: e.touches[0].clientY
        });
    },

    // 触摸结束事件
    handleTouchEnd(e) {
        const { touchStartY, touchMoveY, minSwipeDistance, currentIndex, verses } = this.data;
        const touchEndY = e.changedTouches[0].clientY;
        const moveDistance = touchStartY - touchEndY;

        // 向上滑动且距离超过阈值
        if (moveDistance > minSwipeDistance) {
            // 先更新索引
            const newIndex = currentIndex + 1;

            if (newIndex <= verses.length-1) {
                this.setData({ currentIndex: newIndex });
            }
            
            // 如果是最后一条，提前加载新偈语
            if (newIndex >= verses.length-1) {
                this.getVerses(this.data.preloadCount)
                    .then(newverse => {
                        let newverses = [...verses, ...newverse];
                        if (newverses.length > 256) {
                            newverses = newverses.slice(-256);
                        }
                        this.setData({ verses: newverses });
                    })
                    .catch(err => {
                        console.error('Failed to load new verse:', err);
                        // 加载失败时回退索引
                        this.setData({ currentIndex: currentIndex });
                    });
            }
        }
        // 向下滑动且距离超过阈值
        else if (moveDistance < -minSwipeDistance) {
            // 先更新索引
            const newIndex = currentIndex - 1;

            if (newIndex >= 0) {
                this.setData({ currentIndex: newIndex });
            } else {
                this.getVerses(1)
                    .then(newverse => {
                        let newverses = [...newverse, ...verses];
                        if (newverses.length > 256) {
                            newverses = newverses.slice(0, 256);
                        }
                        this.setData({ 
                            verses: newverses,
                            currentIndex: 0
                        });
                    })
                    .catch(err => {
                        console.error('Failed to load new verse:', err);
                        // 加载失败时回退索引
                        this.setData({ currentIndex: currentIndex });
                    });
            }
        }

        this.setData({
            touchEndY: touchEndY
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
                // 更新偈语的点赞数
                db.collection('verses').doc(verse._id).update({
                    data: {
                        likes: db.command.inc(1)
                    }
                }).then(() => {
                    console.log('更新点赞数成功');
                }).catch(err => {
                    console.error('更新点赞数失败:', err);
                });
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
                // 更新偈语的点赞数
                db.collection('verses').doc(verse._id).update({
                    data: {
                        likes: db.command.inc(-1)
                    }
                }).then(() => {
                    console.log('更新点赞数成功');
                }).catch(err => {
                    console.error('更新点赞数失败:', err);
                });
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
        verse.collections += verse.isCollected ? 1 : -1;
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
                // 更新偈语的收藏数
                db.collection('verses').doc(verse._id).update({
                    data: {
                        collections: db.command.inc(1)
                    }
                }).then(() => {
                    console.log('更新收藏数成功');
                }).catch(err => {
                    console.error('更新收藏数失败:', err);
                });
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
                // 更新偈语的收藏数
                db.collection('verses').doc(verse._id).update({
                    data: {
                        collections: db.command.inc(-1)
                    }
                }).then(() => {
                    console.log('更新收藏数成功');
                }).catch(err => {
                    console.error('更新收藏数失败:', err);
                });
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

        // 更新偈语的分享数
        const db = wx.cloud.database();
        db.collection('verses').doc(verse._id).update({
            data: {
                shares: db.command.inc(1)
            }
        }).then(() => {
            console.log('更新分享数成功');
        }).catch(err => {
            console.error('更新分享数失败:', err);
        });

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
