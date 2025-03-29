// pages/detail/report/report.js
const { getRandomverse } = require('../../../data/verses');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		verse: null,
		selectedReason: '',
		description: '',
		reasons: [
			'内容涉及政治敏感',
			'内容涉及色情暴力',
			'内容涉及商业广告',
			'内容存在版权问题',
			'内容与佛教无关',
			'内容有误导性',
			'其他原因'
		],
		maxDescriptionLength: 200
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		const { id } = options;

		// TODO: 从服务器获取偈语信息
		const verse = {
			id,
			...getRandomverse()
		};

		this.setData({ verse });
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	},

	// 选择举报原因
	handleReasonSelect(e) {
		const selectedReason = e.currentTarget.dataset.reason;
		this.setData({ selectedReason });
	},

	// 处理描述输入
	handleDescriptionInput(e) {
		const description = e.detail.value.slice(0, this.data.maxDescriptionLength);
		this.setData({ description });
	},

	// 提交举报
	handleSubmit() {
		const { verse, selectedReason, description } = this.data;

		if (!selectedReason) {
			wx.showToast({
				title: '请选择举报原因',
				icon: 'none'
			});
			return;
		}

		// TODO: 发送举报请求到服务器
		const report = {
			verseId: verse.id,
			reason: selectedReason,
			description
		};

		console.log('提交举报:', report);

		wx.showToast({
			title: '举报已提交',
			icon: 'success',
			success: () => {
				setTimeout(() => {
					wx.navigateBack();
				}, 1500);
			}
		});
	}
})