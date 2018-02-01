//perspective.js
const app = getApp();
var postParams = new Array();
var util = require("../../utils/util.js");
var md5 = require("../../utils/md5.js");
var page = 1;
var isR;
var maxTop = 0;
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
    scrollTop: 0,
    scrollHeight: 0,
    showView: false
  },
  onLoad: function () {
    //这里要非常注意，微信的scroll-view必须要设置高度才能监听滚动事件，所以，需要在页面的onLoad事件中给scroll-view的高度赋值
    var that = this;
    wx.getSystemInfo({
    success: function (res) {
        var clientHeight = res.windowHeight,
            clientWidth = res.windowWidth,
            rpxR = 750 / clientWidth;
        var defHei = 10;
        if (res.brand == 'iPhone') {
          defHei = 90;
        }
        var calc = clientHeight * rpxR - defHei;
        that.setData({
          scrollHeight: calc
        });
        that.GetList();
      }
    });
  },
 onShow: function () {
   //console.log(this.data.list);
    //在页面展示之后先获取一次数据
    if(!this.data.list.length){
      isR = 0;
      page = 1;
      this.GetList();
    }
    //var that = this;
   // this.GetList(that);
 },
  bindDownLoad: function () {
    //该方法绑定了页面滑动到底部的事件
    var that = this;
    this.GetList();
  },
  scroll: function (event) {
  },
  GetList: function () {
    var that = this;
    postParams['page'] = page;
    if (isR !== 2) {
      wx.showLoading({
        title: '加载中...',
      })
      that.setData({
        showView: false
      });
      wx.request({
        url: util.createApiUrl('iRating/h5_tsview'),
        data: util.encrypt({ 'page': page, 'page_size': 10 }),
        method: 'post',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.data.status == 7201) {
            isR = 2;
            that.setData({
              showView: true
            });
            return false;
          }
          if (res.data.status == 1) {
            var persList = res.data.data.data;
            var list = that.data.list;
            for (let dt in persList) {
              let tmp = {
                id: persList[dt].id,
                title: persList[dt].title,
                content: persList[dt].content,
                pic: persList[dt].pic,
                wxcontent: persList[dt].wxcontent
              }
              list.push(tmp);
              that.setData({
                list: list
              });
            }
            isR = 0;
            page++;
          }
        },
        complete: res => {
          setTimeout(function () {
            wx.hideLoading();
          }, 300)
        },
        dataType: "json"
      });
    }
  }

})