App({
    onLaunch() {
        // 小程序启动时执行
        wx.cloud.init({
            env: wx.cloud.DYNAMIC_CURRENT_ENV,
            traceUser: true
        });
    }
})