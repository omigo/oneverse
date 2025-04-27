const app = getApp()

Page({
    data: {
        formData: {
            verse: '',
            author: '',
            source: '',
            explanation: '',
            tags: []
        },
        tagInput: '',
        verseLength: 0,
        explanationLength: 0,
        openid: null,
        userInfo: null,
        isLoggedIn: false
    },

    onShow() {
        // 每次显示页面时检查登录状态
        this.checkLoginStatus();
    },

    onLoad() {
        this.getOpenId();
        this.checkLoginStatus();
    },

    checkLoginStatus() {
        const userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            this.setData({
                userInfo,
                isLoggedIn: true
            })
        } else {
            // 如果没有登录，直接弹出登录框
            wx.showModal({
                title: '提示',
                content: '发布偈语需要授权登录',
                confirmText: '去登录',
                cancelText: '返回',
                success: (res) => {
                    if (res.confirm) {
                        this.getUserProfile();
                    } else {
                        wx.navigateBack();
                    }
                }
            });
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
                    title: '需要授权才能发布',
                    icon: 'none',
                    duration: 2000,
                    success: () => {
                        setTimeout(() => {
                            wx.navigateBack()
                        }, 2000)
                    }
                })
            }
        })
    },

    submitVerse() {
        const formData = this.data.formData;
        formData.tags = this.data.formData.tags;

        if (!formData.verse.trim()) {
            wx.showToast({
                title: '请输入偈语内容',
                icon: 'none'
            });
            return;
        }

        // 检查偈语内容是否有意义
        if (!this.isValidVerse(formData.verse)) {
            wx.showToast({
                title: '偈语内容无意义，请重新输入',
                icon: 'none',
                duration: 2000
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

        wx.showLoading({
            title: '发布中...'
        });

        // 添加用户信息
        formData.nickName = this.data.userInfo.nickName;
        formData.avatarUrl = this.data.userInfo.avatarUrl;

        const db = wx.cloud.database();
        const verses = db.collection('verses');
        verses.orderBy('id', 'desc').limit(1).get({
            success: (res) => {
                let maxId = 0;
                if (res.data.length > 0) {
                    maxId = res.data[0].id;
                }
                formData.id = maxId + 1;
                formData.create_time = db.serverDate();
                formData.likes = 0;
                formData.collections = 0;
                formData.comments = 0;
                formData.shares = 0;
                verses.add({
                    data: formData,
                    success: (res) => {
                        wx.hideLoading();
                        if (res._id) {
                            // 清空表单数据
                            this.setData({
                                formData: {
                                    verse: '',
                                    author: '',
                                    source: '',
                                    explanation: '',
                                    tags: []
                                },
                                verseLength: 0,
                                explanationLength: 0
                            });
                            
                            wx.showToast({
                                title: '发布成功',
                                icon: 'success',
                                duration: 2000,
                                success: () => {
                                    setTimeout(() => {
                                        wx.navigateTo({
                                            url: `/pages/detail/detail?_id=${res._id}`
                                        });
                                    }, 2000);
                                }
                            });
                        } else {
                            console.log('发布失败', res);
                            wx.showToast({
                                title: '发布失败，请重试',
                                icon: 'none'
                            });
                        }
                    },
                    fail: (err) => {
                        wx.hideLoading();
                        console.error('数据插入失败', err);
                        wx.showToast({
                            title: '发布失败，请重试',
                            icon: 'none'
                        });
                    }
                });
            },
            fail: (err) => {
                wx.hideLoading();
                console.error('获取最大id失败', err);
                wx.showToast({
                    title: '获取最大id失败',
                    icon: 'none'
                });
            }
        });
    },

    onSubmit() {
        // 直接提交，因为已经确保登录
        this.submitVerse();
    },

    onVerseInput(e) {
        const verse = e.detail.value;
        this.setData({
            'formData.verse': verse,
            verseLength: verse.length
        });
    },

    onAuthorInput(e) {
        this.setData({
            'formData.author': e.detail.value
        });
    },

    onSourceInput(e) {
        this.setData({
            'formData.source': e.detail.value
        });
    },

    onExplanationInput(e) {
        const explanation = e.detail.value;
        this.setData({
            'formData.explanation': explanation,
            explanationLength: explanation.length
        });
    },

    onTagInput(e) {
        const value = e.detail.value;
        this.setData({
            'formData.tags': value.split(/[\s,，]+/).filter(tag => tag.length > 0)
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

    // 检查偈语内容是否有意义
    isValidVerse(verse) {
        // 去除空格和标点符号
        const cleanVerse = verse.replace(/[\s\p{P}]/gu, '');
        
        // 检查长度是否足够
        if (cleanVerse.length < 4) {
            return false;
        }
        
        // 检查是否全是重复字符
        const isAllSameChar = /^(.)\1+$/.test(cleanVerse);
        if (isAllSameChar) {
            return false;
        }
        
        // 检查是否全是数字
        const isAllNumbers = /^\d+$/.test(cleanVerse);
        if (isAllNumbers) {
            return false;
        }
        
        // 检查是否包含常见无意义词组
        const meaninglessPhrases = ['啊啊啊', '哈哈哈', '呵呵呵', '呜呜呜', '啦啦啦', '嘿嘿嘿', '嘻嘻嘻'];
        for (const phrase of meaninglessPhrases) {
            if (cleanVerse.includes(phrase)) {
                return false;
            }
        }
        
        // 检查字符多样性
        const uniqueChars = new Set(cleanVerse.split(''));
        console.log(cleanVerse,uniqueChars.size);
        if (uniqueChars.size <= 4) {
            return false;
        }
        
        return true;
    }
});