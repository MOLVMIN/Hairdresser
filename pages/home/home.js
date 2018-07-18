// pages/home/home.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hairInfo: null,
    mimage: '',
    workList: [],
    workImageList: [],
    errmess: '',
    options:{},
    showModal: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      options: options
    })

    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        // 获取用户信息
        that.getWxInfo();

        // 获取发型师信息
        that.getHairInfo()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        // 获取用户信息
        that.getWxInfo();

        // 获取发型师信息
        that.getHairInfo()
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
    app.refreshTokenInfo()
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
        userInfo: {},
        hairInfo: {},
        mimage: '',
        workList: [],
        workImageList: [],
        errmess: '',
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '胡头理连锁',
      path: '/pages/home/home',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  getWxInfo: function () {
    var that = this
    that.setData({
      showModal: false,
    })
    wx.getSetting({
      success: res => {
        wx.getUserInfo({
          success: res => {
            console.log(res)
            app.globalData.userInfo = res.userInfo
            console.log(res.userInfo)
            that.setData({
              userInfo: res.userInfo
            })
            that.updateUserInfo()

          },
          fail: res => {
            console.log(res)
            if (res.errMsg != "getUserInfo:fail auth deny") {
              that.showDialogBtn()
            }
          }
        })
      },
      fail: res => {
        console.log(res)
      }
    })
  },


  getHairInfo: function () {
    var that = this
    var token = wx.getStorageSync('token')
    console.log(token)
    wx.showLoading({
      title: '加载中',
    })
    app.http.request({
      url: "hairdressers/info",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        wx.hideLoading()

        console.log(res)

        if (res.statusCode != 200) {
          wx.showModal({
            title: '发型师信息获取失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }

        res.data = util.jsonOptimize(res.data)
        
        that.setData({
          hairInfo: res.data
        })
        console.log(that.data.hairInfo)
        that.setData({
          mimage: app.http.host + "images/f/" + that.data.hairInfo.imageId
        })
        console.log(that.data.mimage)

        that.getWorkList()
      }
    })
  },

  getWorkList: function () {
    var that = this
    var token = wx.getStorageSync('token')
    if (!util.isNull(this.data.hairInfo)) {
      wx.showLoading({
        title: '加载中',
      })
      app.http.request({
        url: "workses/hairdresser/list",
        header: {
          'content-type': 'application/json',
          'Authorization': "Bearer " + token,
        },
        method: "POST",
        data: {
          "page": 0,
          "search": '',
          "size": 10,
          "sortNames": [
            ""
          ],
          "sortOrders": [
            "ASC"
          ]
        },
        success: function (res) {
          console.log(res)

          wx.hideLoading()

          if (res.statusCode != 200) {
            console.log("获取发型师作品失败")
            wx.showModal({
              title: '获取发型师作品失败',
              content: util.checkMsg(res.data.reMsg),
              showCancel: false,
            })
            return
          }

          that.setData({
            workList: res.data.rows
          })
          console.log(that.data.workList)

          var tempImageList = []
          for (var i in that.data.workList) {
            tempImageList[i] = app.http.host + "images/f/" + that.data.workList[i].imageId
          }
          that.setData({
            workImageList: tempImageList
          })
        }
      })
    }
  },

  evaluateTapEvent: function () {
    // if (util.isNull(this.data.hairInfo)) {
    //   wx.showModal({
    //     title: '出错',
    //     content: '当前用户不是发型师，无法进行更多操作',
    //     showCancel: false,
    //   })
    // }
    wx.navigateTo({
      url: '../../pages/evaluate/evaluate?hairInfo=' + JSON.stringify(this.data.hairInfo),
    })
  },

  orderTapEvent: function (e) {
    // if (util.isNull(this.data.hairInfo)) {
    //   wx.showModal({
    //     title: '出错',
    //     content: '当前用户不是发型师，无法进行更多操作',
    //     showCancel: false,
    //   })
    //   return
    // }
    wx.navigateTo({
      url: '../../pages/order/order?type=' + e.currentTarget.dataset.type + '&hairInfo=' + this.data.hairInfo,
    })
  },

  achieveTapEvent: function () {
    // if (util.isNull(this.data.hairInfo)) {
    //   wx.showModal({
    //     title: '出错',
    //     content: '当前用户不是发型师，无法进行更多操作',
    //     showCancel: false,
    //   })
    //   return
    // }
    wx.navigateTo({
      url: '../../pages/achievement/achievement?hairInfo=' + JSON.stringify(this.data.hairInfo),
    })
  },

  couponsTapEvent: function () {
    // if (util.isNull(this.data.hairInfo)) {
    //   wx.showModal({
    //     title: '出错',
    //     content: '当前用户不是发型师，无法进行更多操作',
    //     showCancel: false,
    //   })
    //   return
    // }
    wx.navigateTo({
      url: '../../pages/coupons/coupons?hairInfo=' + JSON.stringify(this.data.hairInfo),
    })
  },

  workTapEvent: function () {
    // if (util.isNull(this.data.hairInfo)) {
    //   wx.showModal({
    //     title: '出错',
    //     content: '当前用户不是发型师，无法进行更多操作',
    //     showCancel: false,
    //   })
    //   return
    // }
    wx.navigateTo({
      url: '../../pages/work_management/work_management?hairName=' + this.data.userInfo.nickName + '&hairImage=' + this.data.userInfo.avatarUrl + '&hairInfo=' + this.data.hairInfo,
    })
  },

  updateUserInfo: function () {
    var that = this
    var myDate = new Date()
    // console.log("更新用户信息 " + myDate.toLocaleString())
    // console.log(app.http.host + "users/wx")
    // console.log('content-type:' + 'application/json')
    // console.log('Authorization:' + "Bearer " + app.globalData.token)
    // console.log("city:" + that.data.userInfo.city)
    // console.log("country:" + that.data.userInfo.country)
    // console.log("gender:" + that.data.userInfo.gender)
    // console.log("id:" + that.data.hairInfo.id)
    // console.log("imageUrl:" + that.data.userInfo.avatarUrl)
    // console.log("language:" + that.data.userInfo.language)
    // console.log("nickname:" + that.data.userInfo.nickName)
    // console.log("province:" + that.data.userInfo.province)
    // console.log(that.data.userInfo)
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "users/wx",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "POST",
      data: {
        "city": that.data.userInfo.city,
        "country": that.data.userInfo.country,
        "gender": that.data.userInfo.gender,
        "imageUrl": that.data.userInfo.avatarUrl,
        "language": that.data.userInfo.language,
        "nickname": that.data.userInfo.nickName,
        "province": that.data.userInfo.province,
      },
      success: function (res) {
        console.log(res)

        if (res.statusCode != 200) {
          console.log("更新后台微信信息失败")
          wx.showModal({
            title: '更新后台微信信息失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }
      }
    })
  },

  preImages: function (e) {
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

  sign: function () {
    if (util.isNull(this.data.hairInfo)) {
      wx.showModal({
        title: '出错',
        content: '当前用户不是发型师，无法使用签到功能',
        showCancel: false,
      })
      return
    }
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "hairdressers/sign",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "GET",
      success: function (res) {
        console.log(res)

        if (res.statusCode != 200) {
          console.log("签到失败")
          wx.showModal({
            title: '签到失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }

        var tmpHairInfo = that.data.hairInfo
        tmpHairInfo.isSign = true
        that.setData({
          hairInfo: tmpHairInfo
        })
      }
    })
  },

  signed: function() {
    wx.showModal({
      title: '提示',
      content: '不能重复签到',
      showCancel: false,
    })
  },

  hairCoupons: function () {
    // if (util.isNull(this.data.hairInfo)) {
    //   wx.showModal({
    //     title: '出错',
    //     content: '当前用户不是发型师，无法进行更多操作',
    //     showCancel: false,
    //   })
    //   return
    // }
    wx.navigateTo({
      url: '../../pages/hairCouponsList/hairCouponsList?hairInfo=' + JSON.stringify(this.data.hairInfo)
    })
  },


  /**
     * 弹窗
     */
  showDialogBtn: function () {
    this.setData({
      showModal: true,
    })
  },

  inputChange: function (e) {
    this.setData({
      currentCcode: e.detail.value
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
    this.hideModal();

    if (this.data.currentCcode == '') {
      wx.showModal({
        title: '提示',
        content: '请输入核销码',
        showCancel: false
      })
      return
    }

    console.log(this.data.currentId)
    console.log(this.data.currentCcode)
    this.serviceBtn(this.data.currentId, this.data.currentCcode)
  },

})