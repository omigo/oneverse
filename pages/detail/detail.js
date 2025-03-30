Page({
    data: {
        verse: null,
        comments: [],
        commentText: '',
        replyTo: null,
        openid: ''
    },

    onLoad(options) {
        // 获取用户openid
        wx.cloud.callFunction({
            name: 'getOpenId'
        }).then(res => {
            this.setData({ openid: res.result.openid });
        }).catch(err => {
            console.error('获取openid失败：', err);
        });

        // 获取偈语详情
        const { _id } = options;
        const db = wx.cloud.database();
        
        // 获取偈语详情
        db.collection('verses').doc(_id).get().then(res => {
            const verse = {
                ...res.data,
                isLiked: false,
                isCollected: false
            };
            this.setData({ verse });
            
            // 加载评论列表
            this.loadComments();
        }).catch(err => {
            console.error('获取偈语详情失败', err);
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            });
        });
    },

    // 加载评论列表
    loadComments() {
        const db = wx.cloud.database();
        const _ = db.command;
        
        db.collection('comments')
            .where({
                verse_id: this.data.verse._id
            })
            .orderBy('createTime', 'desc')
            .get()
            .then(res => {
                // 获取评论用户的信息
                const userOpenids = [...new Set(res.data.map(comment => comment._openid))];
                
                // 获取用户信息
                const userPromises = userOpenids.map(openid => 
                    db.collection('users')
                        .where({ _openid: openid })
                        .get()
                );

                Promise.all(userPromises).then(userResults => {
                    // 创建用户信息映射
                    const userMap = {};
                    userResults.forEach(result => {
                        if (result.data.length > 0) {
                            const user = result.data[0];
                            userMap[user._openid] = {
                                nickName: user.nickName,
                                avatarUrl: user.avatarUrl
                            };
                        }
                    });

                    // 将用户信息添加到评论中
                    const comments = res.data.map(comment => ({
                        ...comment,
                        username: userMap[comment._openid]?.nickName || '匿名用户',
                        avatar: userMap[comment._openid]?.avatarUrl || '/assets/icons/profile.png',
                        time: this.formatTime(comment.createTime)
                    }));

                    this.setData({ comments });
                });
            })
            .catch(err => {
                console.error('加载评论失败：', err);
                wx.showToast({
                    title: '加载评论失败',
                    icon: 'none'
                });
            });
    },

    // 格式化时间
    formatTime(date) {
        if (typeof date === 'object') {
            const now = new Date();
            const diff = now - date;
            
            // 小于1分钟
            if (diff < 60000) {
                return '刚刚';
            }
            // 小于1小时
            if (diff < 3600000) {
                return Math.floor(diff / 60000) + '分钟前';
            }
            // 小于24小时
            if (diff < 86400000) {
                return Math.floor(diff / 3600000) + '小时前';
            }
            // 小于30天
            if (diff < 2592000000) {
                return Math.floor(diff / 86400000) + '天前';
            }
            
            // 超过30天显示具体日期
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return date;
    },

    // 处理点赞
    handleLike() {
        const { verse } = this.data;
        verse.isLiked = !verse.isLiked;
        verse.likes += verse.isLiked ? 1 : -1;
        this.setData({ verse });
    },

    // 处理收藏
    handleCollect() {
        const { verse } = this.data;
        verse.isCollected = !verse.isCollected;
        this.setData({ verse });
    },

    // 导航到作者详情
    navigateToAuthor(e) {
        const { author } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/author/author?name=${author}`
        });
    },

    // 导航到出处详情
    navigateToSource(e) {
        const { source } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/source/source?name=${source}`
        });
    },

    // 导航到标签详情
    navigateToTag(e) {
        const { tag } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/detail/tag/tag?name=${tag}`
        });
    },

    // 点赞评论
    likeComment(e) {
        const { id } = e.currentTarget.dataset;
        const { comments } = this.data;
        const comment = comments.find(c => c.id === id);
        if (comment) {
            comment.isLiked = !comment.isLiked;
            comment.likes += comment.isLiked ? 1 : -1;
            this.setData({ comments });
        }
    },

    // 回复评论
    replyComment(e) {
        const { id } = e.currentTarget.dataset;
        const { comments } = this.data;
        const comment = comments.find(c => c.id === id);
        if (comment) {
            this.setData({
                replyTo: comment,
                commentText: `回复 @${comment.username}：`
            });
        }
    },

    // 评论输入
    onCommentInput(e) {
        this.setData({
            commentText: e.detail.value
        });
    },

    // 提交评论
    submitComment() {
        const { commentText, replyTo, verse, openid } = this.data;
        if (!commentText.trim()) {
            wx.showToast({
                title: '请输入评论内容',
                icon: 'none'
            });
            return;
        }

        const db = wx.cloud.database();
        
        // 创建评论记录
        db.collection('comments').add({
            data: {
                verse_id: verse._id,
                content: commentText,
                createTime: db.serverDate(),
                likes: 0,
                reply_to: replyTo ? {
                    _openid: replyTo._openid,
                    content: replyTo.content
                } : null
            }
        }).then(() => {
            // 更新偈语的评论数
            return db.collection('verses').doc(verse._id).update({
                data: {
                    comments: db.command.inc(1)
                }
            });
        }).then(() => {
            wx.showToast({
                title: '评论成功',
                icon: 'success'
            });

            // 清空评论框
            this.setData({
                commentText: '',
                replyTo: null
            });

            // 重新加载评论列表
            this.loadComments();
        }).catch(err => {
            console.error('提交评论失败：', err);
            wx.showToast({
                title: '评论失败',
                icon: 'none'
            });
        });
    },

    onShareAppMessage() {
        const { verse } = this.data;
        // Increment share count
        verse.shares = (verse.shares || 0) + 1;
        this.setData({ verse });

        return {
            title: verse.verse,
            path: `/pages/detail/detail?_id=${verse._id}`
        };
    }
});