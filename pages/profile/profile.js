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
            console.log(userInfo)
            // 加载收藏列表
            this.loadCollectionData();
        }
    },

    // 获取用户信息
    getUserProfile() {
        wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (res) => {
                console.log(res)
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
                this.setData({
                    verses: res.data,
                    loading: false
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