Page({
    data: {
        formData: {
            quote: '',
            author: '',
            source: '',
            tags: [],
            explanation: ''
        },
        tagInput: '',
        quoteLength: 0,
        explanationLength: 0
    },

    handleQuoteInput(e) {
        const quote = e.detail.value;
        this.setData({
            'formData.quote': quote,
            quoteLength: quote.length
        });
    },

    handleAuthorInput(e) {
        this.setData({
            'formData.author': e.detail.value
        });
    },

    handleSourceInput(e) {
        this.setData({
            'formData.source': e.detail.value
        });
    },

    handleExplanationInput(e) {
        const explanation = e.detail.value;
        this.setData({
            'formData.explanation': explanation,
            explanationLength: explanation.length
        });
    },

    handleTagInput(e) {
        this.setData({
            tagInput: e.detail.value
        });
    },

    addTag(e) {
        const { value } = e.detail;
        if (!value.trim()) return;

        const { tags } = this.data.formData;
        if (tags.includes(value.trim())) {
            wx.showToast({
                title: '标签已存在',
                icon: 'none'
            });
            return;
        }

        if (tags.length >= 5) {
            wx.showToast({
                title: '最多添加5个标签',
                icon: 'none'
            });
            return;
        }

        this.setData({
            'formData.tags': [...tags, value.trim()],
            tagInput: ''
        });
    },

    deleteTag(e) {
        const { index } = e.currentTarget.dataset;
        const { tags } = this.data.formData;
        tags.splice(index, 1);
        this.setData({
            'formData.tags': tags
        });
    },

    handleSubmit(e) {
        const formData = e.detail.value;
        formData.tags = this.data.formData.tags;

        if (!formData.quote.trim()) {
            wx.showToast({
                title: '请输入偈语内容',
                icon: 'none'
            });
            return;
        }

        if (!formData.author.trim()) {
            wx.showToast({
                title: '请输入作者',
                icon: 'none'
            });
            return;
        }

        // 获取云数据库引用
        const db = wx.cloud.database();
        // 获取verses集合引用
        const verses = db.collection('verses');
        // 获取当前最大id
        verses.orderBy('id', 'desc').limit(1).get({
            success: (res) => {
                let maxId = 0;
                if (res.data.length > 0) {
                    maxId = res.data[0].id;
                }
                // 插入数据到verses集合，id加1
                formData.id = maxId + 1;
                verses.add({
                    data: formData,
                    success: (res) => {
                        console.log('数据插入成功', res);
                        wx.showToast({
                            title: '发布成功',
                            icon: 'success',
                            duration: 2000,
                            success: () => {
                                setTimeout(() => {
                                    wx.navigateTo({ // 修改跳转逻辑
                                        url: `/pages/detail/quote?id=${formData.id}` // 跳转到明细页面并传递id
                                    });
                                }, 2000);
                            }
                        });
                    },
                    fail: (err) => {
                        console.error('数据插入失败', err);
                        wx.showToast({
                            title: '发布失败',
                            icon: 'none'
                        });
                    }
                });
            },
            fail: (err) => {
                console.error('获取最大id失败', err);
                wx.showToast({
                    title: '获取最大id失败',
                    icon: 'none'
                });
            }
        });
        return;
    }
});