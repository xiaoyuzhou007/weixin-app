var app = getApp();
var util = require("../../utils/util.js");
var md5 = require("../../utils/md5.js");
Page({
  //分享
  onShareAppMessage: function (res) {
    return {
      title: 'iRatingSys探索影视大数据平台',
      path: '/pages/view/view',
      imageUrl: '/image/share.png',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  data: {
    list: [],
    date: util.currMonthDate(),
    time: util.currMonthDate(),
    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    type: 2,
    forArray: [0, 1, 2, 3, 4]
  },
  // 点击时间
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.setData({
      list: []
    })
    this.getProgramList();
  },

  // 滚动切换标签样式
  switchTab: function (e) {
    if (e.detail.current == 0) {
      var type = 2;
    }
    if (e.detail.current == 1) {
      var type = 1;
    }
    if (e.detail.current == 2) {
      var type = 5;
    }
    if (e.detail.current == 3) {
      var type = 4;
    }
    if (e.detail.current == 4) {
      var type = 3;
    }
    this.setData({
      type: type
    })
    this.setData({
      list: []
    })
    this.getProgramList();

    this.setData({
      currentTab: e.detail.current
    });
    this.checkCor();
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = e.target.dataset.current;

    if (this.data.currentTaB == cur) { return false; }
    else {
      this.setData({
        currentTab: cur
      })
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 3) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },
  onLoad: function () {
    var that = this;
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res);
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var defHei = 100;
        if (res.brand == 'iPhone') {
          defHei = 200;
        }
        var calc = clientHeight * rpxR - defHei;
        // clientHeight = clientHeight-50;
        that.setData({
          winHeight: calc
        });
      }
    });
    this.getProgramList();
  },

  //获取节目列表
  getProgramList: function () {
    var that = this;
    wx.showLoading({ title: '加载中...' })
    wx.request({
      url: util.createApiUrl('iRating/h5_renqi_more'),
      data: util.encrypt({ 'type': this.data.type, 'time': this.data.date, 'source': 'xcx' }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'post',
      dataType: 'json',
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            list: res.data.data.data
          })
        }
      },
      complete: function() {
        setTimeout(function(){
          wx.hideLoading()
        }, 300)
      }
    })
  },
  footerTap: app.footerTap
})
