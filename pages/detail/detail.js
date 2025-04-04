const app = getApp()

Page({
    data: {
        verse: null,
        isLoading: true,
        commentText: '',
        userInfo: null,
        isLoggedIn: false,
        openid: null,
        replyTo: null,  // 当前回复的评论ID
        replyToUser: null,  // 被回复的用户名
        replyText: '',  // 回复内容
        showReplyInput: false,  // 是否显示回复输入框
        commentList: []
    },

    onLoad(options) {
        this.getOpenId();
        this.checkLoginStatus();
        if (options._id) {
            this.loadVerseDetail(options._id);
        }
    },

    onShow() {
        // 每次显示页面时检查登录状态
        this.checkLoginStatus();
    },

    checkLoginStatus() {
        const userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            this.setData({
                userInfo,
                isLoggedIn: true
            })
        }
    },

    getUserProfile() {
        wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (res) => {
                const userInfo = res.userInfo
                wx.setStorageSync('userInfo', userInfo)
                this.setData({
                    userInfo,
                    isLoggedIn: true
                })
            },
            fail: (err) => {
                console.log('用户拒绝授权', err)
                wx.showToast({
                    title: '需要授权才能互动',
                    icon: 'none'
                })
            }
        })
    },

    loadVerseDetail(_id) {
        const db = wx.cloud.database();
        db.collection('verses').doc(_id).get({
            success: res => {
                const verse = res.data;
                this.setData({
                        verse: verse
                    });
                // 检查是否已点赞和收藏
                Promise.all([
                    db.collection('likes').where({
                        verse_id: _id
                    }).get(),
                    db.collection('collections').where({
                        verse_id: _id
                    }).get()
                ]).then(([likeRes, collectRes]) => {
                    this.setData({
                        verse: {
                            ...verse,
                            isLiked: likeRes.data.length > 0,
                            isCollected: collectRes.data.length > 0
                        },
                        isLoading: false
                    });
                    this.loadComments(_id);
                });
            },
            fail: err => {
                console.error('获取偈语详情失败：', err);
                wx.showToast({
                    title: '获取详情失败',
                    icon: 'none'
                });
            }
        });
    },

    loadComments(verseId) {
        const db = wx.cloud.database();
        db.collection('comments')
            .where({
                verse_id: verseId
            })
            .orderBy('create_time', 'desc')
            .get({
                success: res => {
                    // 格式化时间
                    const formattedComments = res.data.map(comment => ({
                        ...comment,
                        create_time: this.formatTime(comment.create_time)
                    }));
                    this.setData({
                        commentList: formattedComments
                    });
                }
            });
    },

    // 格式化时间
    formatTime(date) {
        date = new Date(date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    },

    handleLike() {
        if (!this.data.isLoggedIn) {
            wx.showModal({
                title: '提示',
                content: '点赞需要授权登录',
                confirmText: '去登录',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        this.getUserProfile();
                    }
                }
            });
            return;
        }

        const db = wx.cloud.database();
        const _ = db.command;
        const verse = this.data.verse;

        // 检查是否已点赞
        if (verse.isLiked) {
            // 已点赞，先更新界面
            this.setData({
                'verse.likes': (verse.likes || 1) - 1,
                'verse.isLiked': false
            });

            // 更新数据库
            db.collection('likes').where({
                verse_id: verse._id
            }).get().then(res => {
                if (res.data.length > 0) {
                    return db.collection('likes').doc(res.data[0]._id).remove();
                }
            }).then(() => {
                return db.collection('verses').doc(verse._id).update({
                    data: {
                        likes: _.inc(-1)
                    }
                });
            }).catch(err => {
                console.error('取消点赞失败：', err);
                // 恢复界面状态
                this.setData({
                    'verse.likes': verse.likes,
                    'verse.isLiked': true
                });
            });
        } else {
            // 未点赞，先更新界面
            this.setData({
                'verse.likes': (verse.likes || 0) + 1,
                'verse.isLiked': true
            });

            // 更新数据库
            db.collection('likes').add({
                data: {
                    verse_id: verse._id,
                    create_time: db.serverDate()
                }
            }).then(() => {
                return db.collection('verses').doc(verse._id).update({
                    data: {
                        likes: _.inc(1)
                    }
                });
            }).catch(err => {
                console.error('点赞失败：', err);
                // 恢复界面状态
                this.setData({
                    'verse.likes': verse.likes,
                    'verse.isLiked': false
                });
            });
        }
    },

    handleCollect() {
        if (!this.data.isLoggedIn) {
            wx.showModal({
                title: '提示',
                content: '收藏需要授权登录',
                confirmText: '去登录',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        this.getUserProfile();
                    }
                }
            });
            return;
        }

        const db = wx.cloud.database();
        const _ = db.command;
        const verse = this.data.verse;

        // 检查是否已收藏
        if (verse.isCollected) {
            // 已收藏，先更新界面
            this.setData({
                'verse.collections': (verse.collections || 1) - 1,
                'verse.isCollected': false
            });

            // 更新数据库
            db.collection('collections').where({
                verse_id: verse._id
            }).get().then(res => {
                if (res.data.length > 0) {
                    return db.collection('collections').doc(res.data[0]._id).remove();
                }
            }).then(() => {
                return db.collection('verses').doc(verse._id).update({
                    data: {
                        collections: _.inc(-1)
                    }
                });
            }).then(() => {
                wx.showToast({
                    title: '已取消收藏',
                    icon: 'success'
                });
            }).catch(err => {
                console.error('取消收藏失败：', err);
                // 恢复界面状态
                this.setData({
                    'verse.collections': verse.collections,
                    'verse.isCollected': true
                });
            });
        } else {
            // 未收藏，先更新界面
            this.setData({
                'verse.collections': (verse.collections || 0) + 1,
                'verse.isCollected': true
            });

            // 更新数据库
            db.collection('collections').add({
                data: {
                    verse_id: verse._id,
                    create_time: db.serverDate()
                }
            }).then(() => {
                return db.collection('verses').doc(verse._id).update({
                    data: {
                        collections: _.inc(1)
                    }
                });
            }).then(() => {
                wx.showToast({
                    title: '收藏成功',
                    icon: 'success'
                });
            }).catch(err => {
                console.error('收藏失败：', err);
                // 恢复界面状态
                this.setData({
                    'verse.collections': verse.collections,
                    'verse.isCollected': false
                });
            });
        }
    },

    handleCommentInput(e) {
        this.setData({
            commentText: e.detail.value
        });
    },

    submitComment() {
        if (!this.data.isLoggedIn) {
            wx.showModal({
                title: '提示',
                content: '评论需要授权登录',
                confirmText: '去登录',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        this.getUserProfile();
                    }
                }
            });
            return;
        }

        const commentText = this.data.commentText.trim();
        if (!commentText) {
            wx.showToast({
                title: '请输入评论内容',
                icon: 'none'
            });
            return;
        }

        const db = wx.cloud.database();
        const verse = this.data.verse;

        db.collection('comments').add({
            data: {
                verse_id: verse._id,
                content: commentText,
                create_time: db.serverDate(),
                nick_name: this.data.userInfo.nickName,
                avatar_url: this.data.userInfo.avatarUrl
            },
            success: () => {
                wx.showToast({
                    title: '评论成功',
                    icon: 'success'
                });
                this.setData({
                    commentText: ''
                });
                // 重新加载评论
                this.loadComments(verse._id);
            },
            fail: err => {
                console.error('评论失败：', err);
                wx.showToast({
                    title: '评论失败，请重试',
                    icon: 'none'
                });
            }
        });
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

    onShareAppMessage() {
        return {
            title: this.data.verse.verse,
            path: '/pages/detail/detail?_id=' + this.data.verse._id
        }
    },

    replyComment(e) {
        if (!this.data.isLoggedIn) {
            wx.showModal({
                title: '提示',
                content: '回复需要授权登录',
                confirmText: '去登录',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        this.getUserProfile();
                    }
                }
            });
            return;
        }

        console.log(e.currentTarget.dataset, this.data.commentList);
        const commentId = e.currentTarget.dataset.id;
        const comment = this.data.commentList.find(item => item._id === commentId);
        this.setData({
            replyTo: commentId,
            replyToUser: comment.nick_name,
            showReplyInput: true,
            replyText: ''
        });
    },

    handleReplyInput(e) {
        this.setData({
            replyText: e.detail.value
        });
    },

    submitReply() {
        const replyText = this.data.replyText.trim();
        if (!replyText) {
            wx.showToast({
                title: '请输入回复内容',
                icon: 'none'
            });
            return;
        }

        const db = wx.cloud.database();
        const verse = this.data.verse;

        db.collection('comments').add({
            data: {
                verse_id: verse._id,
                content: `回复 ${this.data.replyToUser}：${replyText}`,
                create_time: db.serverDate(),
                nick_name: this.data.userInfo.nickName,
                avatar_url: this.data.userInfo.avatarUrl,
                parent_id: this.data.replyTo,
                is_reply: true
            },
            success: () => {
                wx.showToast({
                    title: '回复成功',
                    icon: 'success'
                });
                this.setData({
                    replyText: '',
                    replyTo: null,
                    replyToUser: null,
                    showReplyInput: false
                });
                // 重新加载评论
                this.loadComments(verse._id);
            },
            fail: err => {
                console.error('回复失败：', err);
                wx.showToast({
                    title: '回复失败，请重试',
                    icon: 'none'
                });
            }
        });
    },

    cancelReply() {
        this.setData({
            replyTo: null,
            replyToUser: null,
            showReplyInput: false,
            replyText: ''
        });
    },

    likeComment(e) {
        if (!this.data.isLoggedIn) {
            wx.showModal({
                title: '提示',
                content: '点赞需要授权登录',
                confirmText: '去登录',
                cancelText: '取消',
                success: (res) => {
                    if (res.confirm) {
                        this.getUserProfile();
                    }
                }
            });
            return;
        }

        const commentId = e.currentTarget.dataset.id;
        const db = wx.cloud.database();
        const _ = db.command;

        // 找到当前评论
        const comment = this.data.commentList.find(item => item._id === commentId);
        if (!comment) {
            console.error('找不到对应的评论:', commentId);
            return;
        }

        // 检查是否已点赞
        if (comment.isLiked) {
            // 已点赞，取消点赞
            this.setData({
                [`commentList[${this.data.commentList.indexOf(comment)}].likes`]: (comment.likes || 1) - 1,
                [`commentList[${this.data.commentList.indexOf(comment)}].isLiked`]: false
            });

            // 更新数据库
            db.collection('comments').doc(commentId).update({
                data: {
                    likes: _.inc(-1)
                }
            }).catch(err => {
                console.error('取消点赞失败：', err);
                // 恢复界面状态
                this.setData({
                    [`commentList[${this.data.commentList.indexOf(comment)}].likes`]: comment.likes,
                    [`commentList[${this.data.commentList.indexOf(comment)}].isLiked`]: true
                });
            });
        } else {
            // 未点赞，添加点赞
            this.setData({
                [`commentList[${this.data.commentList.indexOf(comment)}].likes`]: (comment.likes || 0) + 1,
                [`commentList[${this.data.commentList.indexOf(comment)}].isLiked`]: true
            });

            // 更新数据库
            db.collection('comments').doc(commentId).update({
                data: {
                    likes: _.inc(1)
                }
            }).catch(err => {
                console.error('点赞失败：', err);
                // 恢复界面状态
                this.setData({
                    [`commentList[${this.data.commentList.indexOf(comment)}].likes`]: comment.likes,
                    [`commentList[${this.data.commentList.indexOf(comment)}].isLiked`]: false
                });
            });
        }
    }
});