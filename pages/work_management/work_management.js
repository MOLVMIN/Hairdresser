// pages/work_management/work_management.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab切换  
    currentTab: 0,
    hairName: '',
    hairImage: '',
    workList: [],
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
      hairName: options.hairName,
      hairImage: options.hairImage,
      options: options
    })
    this.setData({
      workList: [],
      isCanload: true,
      page: 0
    })
    var that = this
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
        hairName: '',
        hairImage: '',
        workList: [],
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
    that.setData({
      page: 0,
      workList: [],
    })

    that.setData({ currentTab: e.detail.current });

    that.getCurrentScoreList(that.data.currentTab)
  },

  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    that.setData({
      page: 0,
      workList: [],
      isCanload: true,
    })

    if (this.data.currentTab == e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })

      that.getCurrentScoreList(that.data.currentTab)
    }
  },

  uploadTapEvent: function () {
    wx.navigateTo({
      url: '../../pages/upload_sample/upload_sample',
    })
  },

  getCurrentScoreList: function (e) {
    var workType = ''
    if (e == 0) {
      workType = ''
    } else if (e == 1) {
      workType = 'PERM'
    } else if (e == 2) {
      workType = 'DYE'
    } else if (e == 3) {
      workType = 'CUT'
    } else if (e == 4) {
      workType = 'MODEL'
    } else {
      workType = 'OTHER'
    }
    console.log(workType)
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    var token = wx.getStorageSync('token')
    if (that.data.options.hairInfo != 'null') {
      app.http.request({
        url: "workses/hairdresser/list",
        header: {
          'content-type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        method: "POST",
        data: {
          "page": that.data.page,
          "search": workType,
          "size": that.data.page_size,
          "sortNames": [
            "string"
          ],
          "sortOrders": [
            "ASC"
          ]
        },
        success: function (res) {
          console.log(res)

          wx.hideLoading()

          wx.stopPullDownRefresh()

          if (res.statusCode != 200) {
            wx.showModal({
              title: '获取作品列表失败',
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
          }
          that.setData({
            workList: that.data.workList.concat(res.data.rows),
            page: that.data.page + 1
          })
          console.log(that.data.workList)
        }
      })
    }
    else {
      wx.hideLoading()
      this.setData({
        options: options
      })
    }
  },

  deleteWorkEvent: function (e) {
    var deleteId = e.currentTarget.dataset.id
    if (deleteId == '') {
      return
    }
    var that = this
    wx.showLoading({
      title: '删除中',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "workses/" + deleteId,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "DELETE",
      success: function (res) {
        console.log(res)

        wx.hideLoading()

        if (res.statusCode == 200) {
          wx.showModal({
            title: '',
            content: '删除成功',
            showCancel: false,
            success: function (res) {
              // 刷新
              that.setData({
                workList: [],
                isCanload: true,
                page: 0
              })
              that.getCurrentScoreList(that.data.currentTab)
            }
          })
        }
        else {
          wx.showModal({
            title: '删除失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
        }
      }
    })
  },

  previewImageEvent:function(e){
    var src = e.currentTarget.dataset.src
    wx.previewImage({
      urls: [src],
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
})