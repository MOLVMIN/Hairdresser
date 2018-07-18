// pages/upload_sample/upload_sample.js
var util = require('../../utils/util.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    workName: '',
    workContent: '',
    index: 0,
    itemType: ['剪发', '烫发', '染发', '造型'],
    currentType: ['CUT', 'PERM', 'DYE', 'MODEL'],

    tempImageFile:'',
    canvasWidth: 300,
    canvasHeight: 300,

    options: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
    })
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
        workName: '',
        workContent: '',
        index: 0,
        itemType: ['剪发', '烫发', '染发', '造型'],
        currentType: ['CUT', 'PERM', 'DYE', 'MODEL'],

        tempImageFile: '',
        canvasWidth: 300,
        canvasHeight: 300,
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

  workNameInputChange: function (e) {
    this.setData({
      workName: e.detail.value
    })
  },

  workContentInputChange: function (e) {
    this.setData({
      workContent: e.detail.value
    })
  },

  bindPickerChange: function (e) {
    var that = this
    that.setData({
      index: e.detail.value,
    })
  },

  // chooseImage: function () {
  //   let that = this
  //   wx.chooseImage({
  //     count: 1, // 默认9
  //     sizeType: ['compressed'],
  //     success: function (res) {
  //       var filepath = res.tempFiles[0].path
  //       var size = res.tempFiles[0].size
  //       console.log('大小' + size)
  //       that.setData({
  //         tempImageFile: filepath
  //       })
  //       wx.getImageInfo({
  //         src: filepath,
  //         success: function (res) {
  //           var picWidth = res.width
  //           var picHeight = res.height

  //           var compressWidth = 300
  //           var compressHeight = picHeight / picWidth * 300
  //           console.log(compressWidth)
  //           console.log(compressHeight)
  //           that.setData({
  //             canvasWidth: compressWidth,
  //             canvasHeight: compressHeight
  //           })
  //           const ctx = wx.createCanvasContext('myCanvas')
  //           ctx.drawImage(filepath, 0, 0, compressWidth, compressHeight)
  //           ctx.draw(false, function (e) {
  //             console.log('draw callback')
  //             wx.canvasToTempFilePath({
  //               destWidth: compressWidth,
  //               destHeight: compressHeight,
  //               // quality:1.0,
  //               canvasId: 'myCanvas',
  //               success: function (res) {
  //                 console.log(res.tempFilePath)
  //                 wx.getImageInfo({
  //                   src: res.tempFilePath,
  //                   success: function (res) {
  //                     var picWidth = res.width
  //                     var picHeight = res.height
  //                     console.log(picWidth)
  //                     console.log(picHeight)
  //                   }
  //                 })

  //                 that.setData({
  //                   tempImageFile: res.tempFilePath
  //                 })
  //               },
  //               fail: function (res) {
  //                 console.log(res)
  //               },
  //               complete: function (res) {
  //                 console.log(res)
  //               }
  //             })
  //           })

  //         }
  //       })   
  //     }
  //   })
  // },

  chooseImage:function(){
    let that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'],
      success: function(res) {
        var filepath = res.tempFiles[0].path
        var size = res.tempFiles[0].size
        console.log('大小' + size)
        // if (size >= 409600) {
        //   wx.showModal({
        //     title: '提示',
        //     content: '图片过大',
        //     showCancel: false,
        //   })
        //   return
        // } 
        that.setData({
          tempImageFile: filepath
        })
      },
    })
  },

  commitOrderEvent: function () {
    var that = this
    if (that.data.tempImageFile == ''){
      wx.showModal({
        title: '',
        content: '请选择上传图片',
        showCancel: false,
      })
      return
    }
    console.log(that.data.tempImageFile)
    wx.showLoading({
      title: '上传中',
    })
    var token = wx.getStorageSync('token')
    wx.uploadFile({
      url: app.http.host + 'workses/hairdresser',
      filePath: that.data.tempImageFile,
      name: 'file',
      header: {
        'Authorization': "Bearer " + token,
        "Content-Type": "multipart/form-data",
      },
      formData: {
        'name': that.data.workName,
        'wtype': that.data.currentType[that.data.index],
        'content': that.data.workContent,
      },
      success: function (res) {
        console.log(res)

        wx.hideLoading()

        if (res.statusCode == 200) {
          wx.showModal({
            title: '',
            content: '上传成功',
            showCancel: false,
            success: function (res) {
              // 刷新前页
              var pages = getCurrentPages();
              var prevPage = pages[pages.length - 2];  // 作品列表
              prevPage.setData({
                workList: [],
                isCanload: true,
                page: 0
              })
              prevPage.getCurrentScoreList(prevPage.data.currentTab)
              // 返回
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
        else {
          if (res.data.reMsg) {
            wx.showModal({
              title: '上传失败',
              content: util.checkMsg(res.data.reMsg),
              showCancel: false,
              success: function (res) {
                // 刷新前页
                var pages = getCurrentPages();
                var prevPage = pages[pages.length - 2];  // 作品列表
                prevPage.setData({
                  workList: [],
                  isCanload: true,
                  page: 0
                })
                prevPage.getCurrentScoreList(prevPage.data.currentTab)
                // 返回
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          } else {
            wx.showModal({
              title: '上传失败',
              content: '图片过大',
              showCancel: false,
              success: function (res) {
                // 刷新前页
                var pages = getCurrentPages();
                var prevPage = pages[pages.length - 2];  // 作品列表
                prevPage.setData({
                  workList: [],
                  isCanload: true,
                  page: 0
                })
                prevPage.getCurrentScoreList(prevPage.data.currentTab)
                // 返回
                wx.navigateBack({
                  delta: 1
                })
              }
            })
          }
        }
      }
    })
  }
})