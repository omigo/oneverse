Page({
    data: {
        userInfo: null,
        hasUserInfo: false,
        canIUseGetUserProfile: false,
        canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
        isLogin: false,
        verses: [],
        loading: true
    },

    onLoad() {
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true
            });
        }
    },

    onShow() {
        // 检查登录状态
        const isLogin = wx.getStorageSync('isLogin') || false;
        this.setData({ isLogin });

        if (isLogin) {
            // 获取用户信息
            const userInfo = wx.getStorageSync('userInfo');
            if (userInfo) {
                this.setData({
                    userInfo,
                    hasUserInfo: true
                });
            }
            // 加载收藏列表
            this.loadCollectionData();
        }
    },

    // 获取用户信息
    getUserProfile() {
        wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (res) => {
                const userInfo = res.userInfo;
                wx.setStorageSync('userInfo', userInfo);
                wx.setStorageSync('isLogin', true);
                this.setData({
                    userInfo,
                    hasUserInfo: true,
                    isLogin: true
                });
                // 加载收藏列表
                this.loadCollectionData();
            },
            fail: (err) => {
                console.error('获取用户信息失败：', err);
                wx.showToast({
                    title: '获取用户信息失败',
                    icon: 'none'
                });
            }
        });
    },

    // 加载收藏列表
    loadCollectionData() {
        const db = wx.cloud.database();
        const _ = db.command;
        
        // 获取用户openid
        wx.cloud.callFunction({
            name: 'getOpenId'
        }).then(res => {
            const openid = res.result.openid;
            
            // 获取收藏记录
            return db.collection('collections')
                .where({
                    _openid: openid
                })
                .orderBy('createTime', 'desc')
                .get();
        }).then(res => {
            if (res.data.length === 0) {
                this.setData({
                    verses: [],
                    loading: false
                });
                return;
            }

            // 获取所有收藏的偈语ID
            const verseIds = res.data.map(item => item.verse_id);
            
            // 获取偈语详情
            return db.collection('verses')
                .where({
                    _id: _.in(verseIds)
                })
                .get();
        }).then(res => {
            if (res.data.length === 0) {
                this.setData({
                    verses: [],
                    loading: false
                });
                return;
            }

            // 获取作者和出处信息
            const authors = [...new Set(res.data.map(verse => verse.author))];
            const sources = [...new Set(res.data.map(verse => verse.source))];
            
            const authorPromises = authors.map(author => 
                db.collection('authors')
                    .where({ name: author })
                    .get()
            );
            
            const sourcePromises = sources.map(source => 
                db.collection('sources')
                    .where({ name: source })
                    .get()
            );

            return Promise.all([...authorPromises, ...sourcePromises])
                .then(([...results]) => {
                    // 创建作者和出处信息映射
                    const authorMap = {};
                    const sourceMap = {};
                    
                    results.forEach(result => {
                        if (result.data.length > 0) {
                            const item = result.data[0];
                            if (item.name) {
                                if (item.description) {
                                    // 这是作者信息
                                    authorMap[item.name] = {
                                        description: item.description
                                    };
                                } else {
                                    // 这是出处信息
                                    sourceMap[item.name] = {
                                        description: item.description
                                    };
                                }
                            }
                        }
                    });

                    // 将作者和出处信息添加到偈语中
                    const verses = res.data.map(verse => ({
                        ...verse,
                        authorInfo: authorMap[verse.author] || {},
                        sourceInfo: sourceMap[verse.source] || {}
                    }));

                    this.setData({
                        verses,
                        loading: false
                    });
                });
        }).catch(err => {
            console.error('加载收藏列表失败：', err);
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            });
            this.setData({ loading: false });
        });
    },

    // 取消收藏
    handleUncollect(e) {
        const { id } = e.currentTarget.dataset;
        const db = wx.cloud.database();
        
        // 删除收藏记录
        db.collection('collections')
            .where({
                verse_id: id
            })
            .remove()
            .then(() => {
                // 更新偈语的收藏数
                return db.collection('verses').doc(id).update({
                    data: {
                        collections: db.command.inc(-1)
                    }
                });
            })
            .then(() => {
                wx.showToast({
                    title: '已取消收藏',
                    icon: 'success'
                });
                // 重新加载收藏列表
                this.loadCollectionData();
            })
            .catch(err => {
                console.error('取消收藏失败：', err);
                wx.showToast({
                    title: '操作失败',
                    icon: 'none'
                });
            });
    },

    // 导航到偈语详情
    navigateToDetail(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/detail?_id=${id}`
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

    onShareAppMessage() {
        return {
            title: '我收藏的偈语',
            path: '/pages/profile/profile'
        };
    }
});