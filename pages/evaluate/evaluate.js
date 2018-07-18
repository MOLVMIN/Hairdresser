// pages/evaluate/evaluate.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab切换  
    currentTab: 0,
    totalCount: 0,
    markAs: 0,
    evaList: [],
    page: 0,
    page_size: 10,
    isCanload: true,
    options: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    console.log(options)
    that.setData({
      options: options
    })

    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getCurrentScoreList(that.data.currentTab)
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getCurrentScoreList(that.data.currentTab)
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
        currentTab: 0,
        totalCount: 0,
        markAs: 0,
        evaList: [],
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
      this.getCurrentScoreList(this.data.currentTab)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /** 
   * 滑动切换tab 
   */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });

    that.setData({
      evaList: [],
      isCanload: true,
      page: 0
    })
    that.getCurrentScoreList(that.data.currentTab)
  },

  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })

      that.setData({
        evaList: [],
        isCanload: true,
        page: 0
      })
      that.getCurrentScoreList(that.data.currentTab)
    }
  },

  getCurrentScoreList: function (e) {
    var mark = parseInt(e) + 1
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    var token = wx.getStorageSync('token')
    
    if (that.data.options.hairInfo != 'null') {
      app.http.request({
        url: "metes/hairdresser/" + mark + "/" + that.data.page_size + "/" + that.data.page,
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
            console.log("获取评论列表失败")
            wx.showModal({
              title: '获取评论列表失败',
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
            res.data.rows[i].imagePath = app.http.host + "images/f/" + res.data.rows[i].imageId
            res.data.rows[i].markImage0 = res.data.rows[i].mark > 0 ? '/imgs/star_active.png' : '/imgs/star_gray.png'
            res.data.rows[i].markImage1 = res.data.rows[i].mark > 1 ? '/imgs/star_active.png' : '/imgs/star_gray.png'
            res.data.rows[i].markImage2 = res.data.rows[i].mark > 2 ? '/imgs/star_active.png' : '/imgs/star_gray.png'
            res.data.rows[i].markImage3 = res.data.rows[i].mark > 3 ? '/imgs/star_active.png' : '/imgs/star_gray.png'
            res.data.rows[i].markImage4 = res.data.rows[i].mark > 4 ? '/imgs/star_active.png' : '/imgs/star_gray.png'
            res.data.rows[i].newphone = res.data.rows[i].phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
          }
          that.setData({
            totalCount: res.data.total,
            markAs: res.data.markAv,
            evaList: that.data.evaList.concat(res.data.rows),
            page: that.data.page + 1
          })
          console.log(that.data.evaList)
        }
      })
    }
    else {
      wx.hideLoading()
    }
  }

})