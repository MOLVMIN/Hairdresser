// pages/coupons/coupons.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hairId: '',
    showModal: false,
    couponsId: '',
    couponsName: '',
    couponsConditions: '',
    username: '',
    options: {},
    nodata: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.hairInfo != 'null') {
      this.setData({
        hairId: JSON.parse(options.hairInfo).id,
        options: options
      })
    }
    else {
      this.setData({
        options: options
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.refreshTokenInfoNoCallback()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载

    var that = this
    //模拟加载
    setTimeout(function () {
      that.setData({
        hairId: '',
        showModal: false,
        couponsId: '',
        couponsName: '',
        couponsConditions: '',
        username: '',
      })
      that.onLoad(that.data.options)

      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  commitEvent: function () {

  },

  /**
  * 弹窗
  */
  commitEvent: function () {
    this.setData({
      showModal: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

  inputChange: function (e) {
    this.setData({
      username: e.detail.value
    })
  },

  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    var that = this
    wx.showLoading({
      title: '赠送中',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "coupons/mkover/" + that.data.couponsId + "/" + that.data.username,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      data: {
      },
      method: "GET",
      success: function (res) {
        console.log(res)

        wx.hideLoading()

        if (res.statusCode == 200) {
          wx.showModal({
            title: '',
            content: '赠送成功',
            showCancel: false,
          })
        }
        else {
          wx.showModal({
            title: '赠送失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
        }
        that.hideModal();
      },
    })
  },


  selectCouponsEvent: function () {
    wx.navigateTo({
      url: '../../pages/couponsList/couponsList?id=' + this.data.hairId,
    })
  }

})