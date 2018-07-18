// pages/fansList/fansList.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityId: '',
    activityCount: 0,
    page: 0,
    pageSize: 10,
    fansList: [],
    selectionId:[],
    isCanload: true,
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      activityId: options.id,
      activityCount: options.count,
      options: options
    })
    console.log(this.data.activityId)
    console.log(this.data.activityCount)

    var that = this
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getFansList()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getFansList()
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
        activityId: '',
        activityCount: 0,
        page: 0,
        pageSize: 10,
        fansList: [],
        selectionId: [],
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
      this.getFansList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  allChange: function (e) {
    var changeList = e.detail.value
    var tmplist = this.data.fansList
    var tmpSelectionIdList = []
    if (changeList.length == 0) {
      for (var i in tmplist) {
        tmplist[i].checked = false
      }
    } else {
      for (var i in tmplist) {
        tmplist[i].checked = true
        tmpSelectionIdList.push(tmplist[i].id)
      }
    }
    this.setData({
      fansList: tmplist,
      selectionId: tmpSelectionIdList,
    })
    console.log(this.data.selectionId)
  },

  checkboxChange: function (e) {
    var changeList = e.detail.value
    this.setData({
      selectionId: changeList,
    })
    console.log(this.data.selectionId)
  },

  getFansList: function () {
    let that = this
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "hairdressers/info/fans",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      data: {
        "page": that.data.page,
        "search": "",
        "size": that.data.pageSize,
        "sortNames": [
          "id"
        ],
        "sortOrders": [
          "ASC"
        ]
      },
      method: "POST",
      success: function (res) {
        console.log(res.data)
        wx.hideLoading()

        wx.stopPullDownRefresh()

        if (res.statusCode != 200) {
          console.log("获取粉丝列表失败")
          wx.showModal({
            title: '获取粉丝列表失败',
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
          res.data.rows[i].checked = false
          res.data.rows[i].imagePath = app.http.host + 'images/f/' + res.data.rows[i].imageId
        }

        that.setData({
          fansList: that.data.fansList.concat(res.data.rows),
          page: that.data.page + 1
        })
        console.log(that.data.fansList)
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },

  grant: function () {
    let that = this
    console.log(that.data.activityId)
    console.log(that.data.selectionId)
    if (that.data.selectionId.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择要转赠的粉丝',
        showCancel: false,
      })
      return
    }

    if (that.data.selectionId.length > that.data.activityCount) {
      wx.showModal({
        title: '提示',
        content: '优惠券数量不足',
        showCancel: false,
      })
      return
    }

    wx.showLoading({
      title: '加载中…',
    })

    var token = wx.getStorageSync('token')
    app.http.request({
      url: "activitys/send/" + that.data.activityId,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      data: {
        "ids": that.data.selectionId
      },
      method: "POST",
      success: function (res) {
        console.log(res.data)
        wx.hideLoading()

        if (res.statusCode != 200) {
          console.log("优惠券转赠粉丝失败")
          wx.showModal({
            title: '优惠券转赠粉丝失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
            success: function (res) {
              var pages = getCurrentPages()
              var prevPage = pages[pages.length - 2]  //上一个页面
              prevPage.onLoad(prevPage.data.options)

              wx.navigateBack({
                delta: 1
              })
            }
          })
        } else {
          console.log("优惠券转赠粉丝成功")
          wx.showModal({
            title: '提示',
            content: '优惠券已成功转赠粉丝',
            showCancel: false,
            success: function (res) {
              var pages = getCurrentPages()
              var prevPage = pages[pages.length - 2]  //上一个页面
              prevPage.onLoad(prevPage.data.options)

              wx.navigateBack({
                delta: 1
              })
            }
          })
        }

        // res.data = util.jsonOptimize(res.data)
      },
      fail: function (res) {
        wx.hideLoading()
      }
    })
  },
})