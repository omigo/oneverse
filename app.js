App({
    globalData: {
        userInfo: null
    },
    onLaunch() {
        // 小程序启动时执行
        wx.cloud.init({
            env: 'cloud1-4g7tlz21bd482955',
            traceUser: true
        });
    }
})