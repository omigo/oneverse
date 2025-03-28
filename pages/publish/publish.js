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

        // TODO: 发布偈语的API调用
        console.log('发布偈语:', formData);

        wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 2000,
            success: () => {
                setTimeout(() => {
                    wx.switchTab({
                        url: '/pages/index/index'
                    });
                }, 2000);
            }
        });
    }
});