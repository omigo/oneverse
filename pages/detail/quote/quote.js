const { getRandomQuote } = require('../../../data/quotes');

Page({
    data: {
        quote: null,
        comments: [],
        commentText: '',
        replyTo: null
    },

    onLoad(options) {
        // 获取偈语详情
        const { id } = options;
        // TODO: 根据id从服务器获取偈语详情
        const quotes = require('../../../data/quotes').default;
        const randomQuote = id ? quotes.find(q => q.id === id) || getRandomQuote() : getRandomQuote();
        const quote = {
            ...randomQuote,
            isLiked: false,
            isCollected: false,
            likes: randomQuote.likes || Math.floor(Math.random() * 100),
            collections: Math.floor(Math.random() * 50),
            shares: Math.floor(Math.random() * 30),
            comments: Math.floor(Math.random() * 20)
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

        this.setData({ quote, comments });
    },

    // 处理点赞
    handleLike() {
        const { quote } = this.data;
        quote.isLiked = !quote.isLiked;
        quote.likes += quote.isLiked ? 1 : -1;
        this.setData({ quote });
    },

    // 处理收藏
    handleCollect() {
        const { quote } = this.data;
        quote.isCollected = !quote.isCollected;
        this.setData({ quote });
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
        const { quote } = this.data;
        return {
            title: quote.quote,
            path: `/pages/detail/quote/quote?id=${quote.id}`
        };
    }
}); 