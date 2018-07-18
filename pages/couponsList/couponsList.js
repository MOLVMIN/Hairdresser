// couponsList.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hairId: '',
    couponsList: [],
    page: 0,
    page_size: 10,
    isCanload: true,
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      hairId: options.id,
      options: options
    })
    var that = this
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getCouponsList()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getCouponsList()
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
        hairId: '',
        couponsList: [],
        page: 0,
        page_size: 10,
        isCanload: true,
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
    if (this.data.isCanload == true) {
      this.getCouponsList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  couponsDetailEvent: function (e) {
    wx.navigateTo({
      url: '../../pages/couponsDetail/couponsDetail?id=' + e.currentTarget.dataset.id + '&conditions=' + e.currentTarget.dataset.conditions
    })
  },



  getCouponsList: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "coupons/list4user/" + that.data.page_size + "/" + that.data.page,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        console.log(res)

        wx.hideLoading()

        wx.stopPullDownRefresh()

        if (res.statusCode != 200) {
          console.log("获取优惠券列表失败")
          wx.showModal({
            title: '获取优惠券列表失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }

        if (!res.data.rows || res.data.rows.length == 0) {
          that.setData({
            isCanload: false
          })
          return
        }

        res.data = util.jsonOptimize(res.data)
        
        for (var i in res.data.rows) {
          if (res.data.rows[i].status == 'NORMAL') {
            res.data.rows[i].couponsRightClass = 'coupons-right'
            res.data.rows[i].couponsRightText = '查看详情'
            res.data.rows[i].couponsLeftImage = '/imgs/voucher_active.png'
            res.data.rows[i].couponsTime = res.data.rows[i].deadline.substring(0, 10)
            res.data.rows[i].bindtapEvent = 'couponsDetailEvent'
          }
          else {
            res.data.rows[i].couponsRightClass = 'coupons-right-gray'
            res.data.rows[i].couponsRightText = '已过期'
            res.data.rows[i].couponsLeftImage = '/imgs/voucher_gray.png'
            res.data.rows[i].couponsTime = res.data.rows[i].deadline.substring(0, 10)
            res.data.rows[i].bindtapEvent = ''
          }
        }
        that.setData({
          couponsList: that.data.couponsList.concat(res.data.rows),
          page: that.data.page + 1
        })
        console.log(that.data.couponsList)
      }
    })
  },


})