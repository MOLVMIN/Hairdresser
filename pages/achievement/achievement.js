// pages/achievement/achievement.js

var wxCharts = require('../../utils/wxcharts.js');
var util = require('../../utils/util.js')
var app = getApp();
var lineChart = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab切换  
    currentTab: 0,
    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
    })

    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    var simulationData = this.createDefaultValue(0);
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: simulationData.categories,
      animation: true,
      // background: '#f5f5f5',
      series: [{
        name: '业绩',
        data: simulationData.data,
        format: function (val, name) {
          return val.toFixed(2) + '元';
        }
      },
      ],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        disableGrid: true,
        format: function (val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: windowWidth,
      height: 180,
      dataLabel: true,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });

    console.log('achi1')

    var that = this
    var token = wx.getStorageSync('token')
    if (!token || token == "") {
      app.getTokenInfo()
      app.tokenInfoReadyCallback = res => {
        that.updateData(that.data.currentTab)
      }
    }
    else {
      app.refreshTokenInfo()
      app.refreshTokenInfoReady = res => {
        that.updateData(that.data.currentTab)
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

  /** 
   * 滑动切换tab 
   */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });

    console.log('achi2')
    that.updateData(that.data.currentTab)
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

      console.log('achi3')
      that.updateData(that.data.currentTab)
    }
  },


  touchHandler: function (e) {
    console.log(lineChart.getCurrentDataIndex(e));
    lineChart.showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },

  createDefaultValue: function (e) {
    var categories = [];
    var data = [];
    var t = new Date();
    if (e == 0) {
      categories.push(t.getFullYear() + "年");
    } else if (e == 1) {
      categories.push(t.getMonth() + 1 + "月");
    } else {
      categories.push(t.getDate() + "日");
    }
    data.push(0);
    return {
      categories: categories,
      data: data
    }
  },

  updateData: function (e) {
    var that = this
    var achiType = ''
    var unit = ''
    if (e == 0) {
      achiType = 'year'
      unit = '年'
    } else if (e == 1) {
      achiType = 'month'
      unit = '月'
    } else {
      achiType = 'day'
      unit = '日'
    }
    wx.showLoading({
      title: '加载中',
    })
    var token = wx.getStorageSync('token')
    if (that.data.options.hairInfo != 'null') {
      app.http.request({
        url: "orders/performance/" + achiType,
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

          var tCategories = [];
          var tData = [];

          if (res.statusCode != 200) {
            console.log("获取业绩列表失败")

            var defaultValue = that.createDefaultValue(e);
            tCategories = defaultValue.categories
            tData = defaultValue.data
          } else {
            if (!res.data || res.data.length == 0) {
              console.log("无数据，不更新列表")

              var defaultValue = that.createDefaultValue(e);
              tCategories = defaultValue.categories
              tData = defaultValue.data
            } else {
              res.data = util.jsonOptimize(res.data)
              
              for (var i = 0; i < res.data.length; i++) {
                tCategories.push(res.data[i].tag + unit);
                tData.push(res.data[i].value);
              }
            }
          }

          var series = [{
            name: '业绩',
            data: tData,
            format: function (val, name) {
              return val.toFixed(2) + '元';
            }
          }];
          lineChart.updateData({
            categories: tCategories,
            series: series
          });
        },
        fail: function (res) {
          console.log(res)
        }
      })
    }
    else {
      wx.hideLoading()
    }
  },

  defaultValue: function (e) {
    if (e == 0) {
      achiType = 'year'
      unit = '年'
    } else if (e == 1) {
      achiType = 'month'
      unit = '月'
    } else {
      achiType = 'day'
      unit = '日'
    }
  }

})