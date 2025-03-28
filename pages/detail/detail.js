Page({
    data: {
        verse: null,
        comments: [],
        commentText: '',
        replyTo: null
    },

    onLoad(options) {
        // 获取偈语详情
        const { _id } = options;
        // 根据id从云数据库verses集合中查询对应偈语
        wx.cloud.database().collection('verses').doc(_id).get({
            success: res => {
                const verse = {
                    ...res.data,
                    isLiked: false,
                    isCollected: false
                };
                // 获取评论列表
                // TODO: 从服务器获取评论列表
                const comments = [
                    {
                        id: 1,
                        username: '禅心',
                        avatar: '/assets/icons/profile.png',
                        content: '这句话说得很有道理，让人深思。',
                        time: '2024-03-15 10:30',
                        likes: 5,
                        isLiked: false,
                        replies: [
                            {
                                id: 11,
                                username: '悟道',
                                content: '确实如此，受益良多。'
                            }
                        ]
                    },
                    {
                        id: 2,
                        username: '修行者',
                        avatar: '/assets/icons/profile.png',
                        content: '感谢分享这么好的偈语。',
                        time: '2024-03-15 09:15',
                        likes: 3,
                        isLiked: false
                    }
                ];

                this.setData({ verse, comments });
            },
            fail: err => {
                console.error('获取偈语详情失败', err);
            }
        });
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
        const { commentText, replyTo, comments } = this.data;
        if (!commentText.trim()) return;

        // TODO: 发送评论到服务器
        const newComment = {
            id: comments.length + 1,
            username: '我',
            avatar: '/assets/icons/profile.png',
            content: commentText,
            time: '刚刚',
            likes: 0,
            isLiked: false
        };

        if (replyTo) {
            // 添加回复
            replyTo.replies = replyTo.replies || [];
            replyTo.replies.push({
                id: replyTo.replies.length + 1,
                username: '我',
                content: commentText.replace(`回复 @${replyTo.username}：`, '')
            });
        } else {
            // 添加新评论
            comments.unshift(newComment);
        }

        this.setData({
            comments,
            commentText: '',
            replyTo: null
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