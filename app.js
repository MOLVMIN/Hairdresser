//app.js 
var util = require('/utils/util.js')
App({
  onLaunch: function () {
    var that = this
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    wx.setStorageSync('token', '')
  },

  getTokenInfo: function () {
    var that = this
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          var code = res.code
          console.log(res.code)

          wx.showLoading({
            title: '鉴权中',
          })
          that.http.request({
            url: "auth/hairdresser/" + code,
            header: {
              'content-type': 'application/json'
            },
            data: {
            },
            method: "GET",
            success: function (res) {
              console.log(res)

              wx.hideLoading()

              if (res.statusCode != 200) {
                console.log("鉴权失败 " + code)
                wx.showModal({
                  title: '鉴权失败',
                  content: util.checkMsg(res.data.reMsg),
                  showCancel: false,
                })
                return
              }

              var newtoken = ''
              if (res.header.authorization) {
                newtoken = res.header.authorization.split(" ")[1]
              } else if (res.header.Authorization) {
                newtoken = res.header.Authorization.split(" ")[1]
              }
              wx.setStorageSync('token', newtoken)
              console.log(newtoken)
              if (that.tokenInfoReadyCallback) {
                that.tokenInfoReadyCallback(res)
              }
            },
            fail: function (res) {
              console.log('login fail')
              console.log(res)
            }
          })

        } else {
          console.log('获取用户登录状态失败！' + res.Msg)
        }
      }
    })
  },

  refreshTokenInfo: function () {
    var that = this
    var oldtoken = wx.getStorageSync('token')
    if (util.isNull(oldtoken)) {
      return
    }

    that.http.request({
      url: "refresh",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + oldtoken,
      },
      data: {
      },
      method: "GET",
      success: function (res) {
        console.log(res)

        if (res.statusCode != 200) {
          console.log("刷新token失败")
          wx.showModal({
            title: '刷新token失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }

        var newtoken = ''
        if (res.header.authorization) {
          newtoken = res.header.authorization.split(" ")[1]
        } else if (res.header.Authorization) {
          newtoken = res.header.Authorization.split(" ")[1]
        }
        wx.setStorageSync('token', newtoken)
        console.log(newtoken)
        if (that.refreshTokenInfoReady) {
          that.refreshTokenInfoReady(res)
        }
      },
      fail: function (res) {
        console.log("fail:" + res)
      }
    })
  },


  refreshTokenInfoNoCallback: function () {
    var that = this
    var oldtoken = wx.getStorageSync('token')
    if (util.isNull(oldtoken)) {
      return
    }

    that.http.request({
      url: "refresh",
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + oldtoken,
      },
      data: {
      },
      method: "GET",
      success: function (res) {
        console.log(res)

        if (res.statusCode != 200) {
          console.log("刷新token失败")
          wx.showModal({
            title: '刷新token失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
          })
          return
        }

        var newtoken = ''
        if (res.header.authorization) {
          newtoken = res.header.authorization.split(" ")[1]
        } else if (res.header.Authorization) {
          newtoken = res.header.Authorization.split(" ")[1]
        }
        wx.setStorageSync('token', newtoken)
        console.log(newtoken)
      },
      fail: function (res) {
        console.log("fail:" + res)
      }
    })
  },

  globalData: {
    userInfo: null,
    openid: "",
    //token: ""
  },

  http: require('/utils/request.js')
})