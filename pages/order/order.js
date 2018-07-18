// pages/order/order.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: "left",
    ongoingList: [],
    completeList: [],
    ongoingPage: 0,
    completePage: 0,
    ongoing_page_size: 99,
    complete_page_size: 10,
    isCanloadOngoing: true,
    isCanloadComplete: true,
    options: {},
    showModal: false,
    currentId: '',
    currentCcode: '',
    nodata: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentTab: options.type,
      ongoingList: [],
      completeList: [],
      ongoingPage: 0,
      completePage: 0,
      ongoing_page_size: 99,
      complete_page_size: 10,
      isCanloadOngoing: true,
      isCanloadComplete: true,
      showModal: false,
      currentId: '',
      currentCcode: '',
      options: options
    })
    var that = this
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.getOngoingOrderList()
        that.getCompleteOrderList()
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.getOngoingOrderList()
        that.getCompleteOrderList()
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
        currentTab: "left",
        ongoingList: [],
        completeList: [],
        ongoingPage: 0,
        completePage: 0,
        ongoing_page_size: 99,
        complete_page_size: 10,
        isCanloadOngoing: true,
        isCanloadComplete: true,
        showModal: false,
        currentId: '',
        currentCcode: '',
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
    if (this.data.currentTab == 'left') {
      if (this.data.isCanloadOngoing == true) {
        this.getOngoingOrderList()
      }
    } else {
      if (this.data.isCanloadComplete == true) {
        this.getCompleteOrderList()
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 切换tab时调用
  tabEvent: function (e) {
    var that = this
    if (e.currentTarget.dataset.tab == 'left') {
      that.setData({
        currentTab: 'left',
      })
    }
    else if (e.currentTarget.dataset.tab == 'right') {
      that.setData({
        currentTab: 'right'
      })
    }
  },

  getOngoingOrderList: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    var token = wx.getStorageSync('token')
    if (that.data.options.hairInfo != 'null') {
      app.http.request({
        url: "orders/uc/hairdresser/" + that.data.ongoing_page_size + "/" + that.data.ongoingPage,
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
            console.log("获取订单列表失败")
            wx.showModal({
              title: '获取订单列表失败',
              content: util.checkMsg(res.data.reMsg),
              showCancel: false,
            })
            return
          }

          if (!res.data.rows || res.data.rows.length == 0) {
            that.setData({
              isCanloadOngoing: false
            })
            return
          }

          res.data = util.jsonOptimize(res.data)

          for (var i = res.data.rows.length - 1; i >= 0; i--) {
            if (res.data.rows[i].status != "SERVERING") {
              res.data.rows.splice(i, 1)
              continue

            }

            res.data.rows[i].imagePath = app.http.host + "images/f/" + res.data.rows[i].imageId
            res.data.rows[i].itemlist = ''
            for (var j in res.data.rows[i].itemNames) {
              res.data.rows[i].itemlist = res.data.rows[i].itemlist + res.data.rows[i].itemNames[j] + ','
            }
            res.data.rows[i].itemlist = res.data.rows[i].itemlist.substring(0, res.data.rows[i].itemlist.length - 1)
            res.data.rows[i].newphone = res.data.rows[i].phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
          }
          that.setData({
            ongoingList: that.data.ongoingList.concat(res.data.rows),
            ongoingPage: that.data.ongoingPage + 1
          })
          console.log(that.data.ongoingList)
        }
      })
    }
    else {
      wx.hideLoading()
    }
  },

  getCompleteOrderList: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    var token = wx.getStorageSync('token')
    if (that.data.options.hairInfo != 'null') {
      app.http.request({
        url: "orders/cm/hairdresser/" + that.data.complete_page_size + "/" + that.data.completePage,
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
            console.log("获取已完成订单列表失败")
            wx.showModal({
              title: '获取已完成订单列表失败',
              content: util.checkMsg(res.data.reMsg),
              showCancel: false,
            })
            return;
          }

          if (!res.data.rows || res.data.rows.length == 0) {
            that.setData({
              isCanloadComplete: false
            })
            return
          }

          res.data = util.jsonOptimize(res.data)

          for (var i in res.data.rows) {
            //res.data.rows[i].createDT = res.data.rows[i].createdate.substring(0, 10)
            //res.data.rows[i].arriveDT = res.data.rows[i].mkTime.substring(0, 10)
            // res.data.rows[i].serviceDT = res.data.rows[i].svtime.substring(0, 10)
            // res.data.rows[i].payDT = res.data.rows[i].pytime.substring(0, 10)
            res.data.rows[i].imagePath = app.http.host + "images/f/" + res.data.rows[i].imageId
            res.data.rows[i].itemlist = ''
            for (var j in res.data.rows[i].itemNames) {
              res.data.rows[i].itemlist = res.data.rows[i].itemlist + res.data.rows[i].itemNames[j] + ','
            }
            res.data.rows[i].itemlist = res.data.rows[i].itemlist.substring(0, res.data.rows[i].itemlist.length - 1)
            res.data.rows[i].newphone = res.data.rows[i].phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
          }
          that.setData({
            completeList: that.data.completeList.concat(res.data.rows),
            completePage: that.data.completePage + 1
          })
          console.log(that.data.completeList)
        }
      })
    }
    else {
      wx.hideLoading()
    }
  },

  serviceBtn: function (id, ccode) {
    var that = this
    wx.showLoading({
      title: '订单核销中',
    })
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "orders/verify/" + id + "/" + ccode,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "PUT",
      success: function (res) {
        console.log(res)

        wx.hideLoading()

        if (res.data.reCode == '200') {
          wx.showModal({
            title: '',
            content: '订单核销成功',
            showCancel: false,
            success: function (res) {
              // that.setData({
              //   ongoingList: [],
              //   isCanloadOngoing: true,
              //   ongoingPage: 0
              // })
              // that.getOngoingOrderList()


              that.setData({
                currentTab: "left",
                ongoingList: [],
                completeList: [],
                ongoingPage: 0,
                completePage: 0,
                ongoing_page_size: 99,
                complete_page_size: 10,
                isCanloadOngoing: true,
                isCanloadComplete: true,
                showModal: false,
                currentId: '',
                currentCcode: '',
              })
              that.onLoad(that.data.options)



            }
          })
        }
        else {
          wx.showModal({
            title: '订单核销失败',
            content: util.checkMsg(res.data.reMsg),
            showCancel: false,
            success: function (res) {
              // that.setData({
              //   ongoingList: [],
              //   isCanloadOngoing: true,
              //   ongoingPage: 0
              // })
              // that.getOngoingOrderList()
            }
          })
        }
      }
    })
  },

  deleteOrderEvent: function (e) {
    var deleteId = e.currentTarget.dataset.id
    if (deleteId == '') {
      return
    }
    var that = this
    var token = wx.getStorageSync('token')
    app.http.request({
      url: "orders/" + deleteId,
      header: {
        'content-type': 'application/json',
        'Authorization': "Bearer " + token,
      },
      method: "DELETE",
      success: function (res) {
        if (res.statusCode == '200') {
          wx.showModal({
            title: '删除成功',
            content: util.checkMsg(res.data.reMsg),
          })
        }
        else {
          wx.showModal({
            title: '删除失败',
            content: util.checkMsg(res.data.reMsg),
          })
        }
      }
    })
  },


  /**
     * 弹窗
     */
  showDialogBtn: function (e) {
    this.setData({
      showModal: true,
      currentId: e.currentTarget.dataset.id,
    })
    console.log(e.currentTarget.dataset.id)
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