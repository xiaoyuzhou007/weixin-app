// pages/article/article.js
const app = getApp()
var util = require("../../utils/util.js");
var md5 = require("../../utils/md5.js");
var WxParse = require('../../wxParse/wxParse.js');
Page({
  //分享
  onShareAppMessage: function (res) {
    return {
      title: 'iRatingSys探索影视大数据平台',
      path: '/pages/article/article?id=' + this.data.id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  data: {
    title: '',
    id: '',
    isbackbutton: 'none',
  },
  onLoad: function (options) {
    this.setData({
      id: options.id,
    });
    if (options.id) {
      var This = this;
      wx.showLoading({
        title: '加载中...',
      })
      wx.request({
        url: util.createApiUrl('iRating/h5_tsview'),
        data: util.encrypt({ 'id': options.id }),
        method: 'post',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          var persInfo = res.data.data;
          var title = persInfo.title;
          var updatetime = persInfo.updatetime;
          var pic = persInfo.pic;
          var content = persInfo.content;
          var wxcontent = persInfo.wxcontent;
          WxParse.wxParse('content', 'html', content, This, 5);
          This.setData({
            title: title,
            updatetime: updatetime,
            // pic:pic,
            // content:content,
            // wxcontent:wxcontent
          })
        },
        complete: res => {
          setTimeout(function () {
            wx.hideLoading();
          }, 300),
            This.setData({
              isbackbutton: 'block'
            })
        },
        dataType: "json"
      });
    }
  },
  backindex: function () {
    wx.switchTab({
      url: '/pages/view/view'
    })
  }
})