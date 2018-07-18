// couponsDetail.js
var util = require('../../utils/util.js')
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    conditions: '',
    selectStyle: '',
    detailInfo: [],
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      conditions: options.conditions,
      options: options
    })
    var that = this
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getDetailInfo()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getDetailInfo()
      }
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
        id: '',
        conditions: '',
        selectStyle: '',
        detailInfo: [],
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

  getDetailInfo: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "/coupons/" + that.data.id,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        console.log(res)

        wx.hideLoading()

        if (res.statusCode != 200) {
          wx.showModal({
            title: '获取优惠券信息失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }

        res.data = util.jsonOptimize(res.data)

        res.data.limitTime = res.data.createdate.substring(0, 10) + ' 至 ' + res.data.modifydate.substring(0, 10)
        that.setData({
          detailInfo: res.data
        })
        console.log(that.data.detailInfo)
      }
    })
  },

  selectCouponsEvent: function () {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 3];  // 转赠页面

    // 直接调用上级页面的setData()方法，把数据存到上级页面中去
    prevPage.setData({
      couponsId: this.data.id,
      couponsName: this.data.detailInfo.name,
      couponsConditions: this.data.conditions,
    })

    wx.navigateBack({
      delta: 2
    })
  },

})