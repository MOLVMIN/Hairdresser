// pages/hairCouponsList/hairCouponsList.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hairId: '',
    activityList: [],
    options: {},
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

    var that = this
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getActivityList()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getActivityList()
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
        activityList: [],
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

  grant: function(e) {
    var id = e.currentTarget.dataset.id
    var count = e.currentTarget.dataset.count
    wx.navigateTo({
      url: '../../pages/fansList/fansList?id=' + id + '&count=' + count,
    })
  },

  getActivityList: function () {
    let that = this
    wx.showLoading({
      title: '加载中…',
    })
    var token = wx.getStorageSync('token')
    var deadtime = new Date
    var deadD = deadtime.toLocaleDateString()
    deadD = deadD.split('/').join('-')
    var deadT = deadtime.toTimeString()
    deadT = deadT.substring(0, 8)
    var deadline = deadD + " " + deadT
    console.log(deadline)
    console.log(!util.isNull(that.data.options.hairInfo))
    if (that.data.options.hairInfo != 'null') {
      app.http.request({
        url: "activitys/list",
        header: {
          'content-type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        data: {
          "dataMap": 
            { 
              "deadline": deadline,
              "hairdresserId": that.data.hairId
            },
          "page": 0,
          "search": "",
          "size": 99,
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

          if (res.statusCode != 200) {
            console.log("获取优惠活动列表失败")
            wx.showModal({
              title: '获取优惠活动列表失败',
              content: util.checkMsg(res.data.reMsg),
              showCancel: false,
            })
            return
          }

          res.data = util.jsonOptimize(res.data)

          // res.data.rows.sort(function (obj1, obj2) {
          //   var val1 = obj1.deadline;
          //   var dt1 = new Date(val1)
          //   var val2 = obj2.deadline;
          //   var dt2 = new Date(val2)
          //   var comp1 = dt1.getTime();
          //   var comp2 = dt2.getTime();
          //   if (comp1 < comp2) {
          //     return -1;
          //   } else if (comp1 > comp2) {
          //     return 1;
          //   } else {
          //     return 0;
          //   }
          // })

          for (var i in res.data.rows) {
            res.data.rows[i].itemlist = ''
            for (var j in res.data.rows[i].itemNames) {
              res.data.rows[i].itemlist = res.data.rows[i].itemlist + res.data.rows[i].itemNames[j] + ','
            }
            res.data.rows[i].itemlist = res.data.rows[i].itemlist.substring(0, res.data.rows[i].itemlist.length - 1);
          }
          
        

          that.setData({
            activityList: res.data.rows
          })
        },
        fail: function (res) {
          wx.hideLoading()
        }
      })
    }
    else {
      wx.hideLoading()
    }
  },
})