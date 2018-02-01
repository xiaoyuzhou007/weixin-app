//view.js
var util = require('../../utils/util.js');
var wxCharts = require('../../utils/wxcharts.js');

var app = getApp();
var lineCharts = [];
var colors = ['#3BC3F9', '#EC7AF4', '#FF968B'];
var lineColors = ['#343486', '#34378a', '#353c96'];
var c1 = null;  // 定时器

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
    toDay: util.currDate(),
    tvList: ['CCTV-1', '湖南卫视', '浙江卫视'],
    selectIndex: [0, 1, 2],
    tvTop10: [],
    winWidth: "", //窗口宽度
    winHeight: "",//窗口高度
    canvasWidth: "",  // 画布宽度
    canvasHeight: "", // 画布高度

    selected: true,
    selected1: false
  },
  selected: function (e) {
    this.setData({
      selected1: false,
      selected: true
    })
  },
  selected1: function (e) {
    this.setData({
      selected: false,
      selected1: true
    })

    this.getTvDetialTop10()
  },
  onLoad: function () {
    var that = this;
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        var clientWidth = res.windowWidth,    // 屏幕宽度px
            clientHeight = res.windowHeight,  // 屏幕高度px
            rpxR = 750 / clientWidth;         // rpx比例 1px = * rpx

        var calc = clientHeight * rpxR - 100; // 单位rpx

        that.setData({
          winWidth: 750,    // 单位rpx 规定
          winHeight: calc,  // 高度rpx
          clientWidth: clientWidth,
          canvasWidth: 750-100,
          canvasHeight: 275-36
        });
      }
    });

    // 获取电视频道
    this.getTvList()

  },
  onShow: function () {
    var This = this;
    c1 = setInterval(function () {
      if (This.data.selected) {
        This.updateProgramRating(0);
        This.updateProgramRating(1);
        This.updateProgramRating(2);
      } else if (This.data.selected1) {
        This.getTvDetialTop10()
      }
    }, 60000)
  },

  onHide: function () {
    clearInterval(c1)
  },

  touchHandler: function (e) {
    let index = e.target.dataset.column;

    lineCharts[index].showToolTip(e, {
      // background: '#7cb5ec',
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },

  // 获取影视详情
  getTvDetialTop10: function () {
    var This = this;

    wx.showLoading({
      title: '加载中...',
    })
    
    wx.request({
      url: util.createApiUrl('iRating/h5_real_time_data'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: util.encrypt(),
      success: res => {
        if (res.data.status == 1) {
          This.setData({
            tvTop10: res.data.data
          })
        }
      },
      fail: res => {

      },
      complete: res => {
        wx.hideLoading();
      },
      dataType: 'json'
    })
  },

  // 获取屏幕列表
  getTvList: function () {
    var This = this;
    wx.request({
      url: util.createApiUrl('iRating/channel_all_list'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: util.encrypt(),
      success: res => {
        if (res.data.status == 1) {
          let list = [];
          for (let item of res.data.data.list) {
            list.push(item.name)
          }
          
          This.setData({
            tvList: list,
            selectIndex: [1, 39, 36]
          })

          this.getAllProgramRating() // 获取全部频道实时数数据
        }
      },
      fail: res => {

      },
      dataType: 'json'
    })
  },

  // 选择项
  changeItem: function (e) {
    let This = this,
      index = +e.detail.value, // 当前选择项下标
      selectIndex = this.data.selectIndex,  // 全部选择下标数组
      dataset = e.currentTarget.dataset;  // dataset

    selectIndex[dataset.column] = index;

    this.setData({
      selectIndex: selectIndex
    })

    this.getProgramRating(dataset.column)
  },

  // 获取全部频道实时数据
  getAllProgramRating: function () {
    this.getProgramRating(0);
    this.getProgramRating(1);
    this.getProgramRating(2);
  },

  // 获取节目实时收视率
  getProgramRating: function (column) {
    let This = this,
      tvList = this.data.tvList, // 影视列表
      selectIndex = this.data.selectIndex; // 全部选择下标数组

    let tvName = tvList[selectIndex[column]];

    wx.request({
      url: util.createApiUrl('iRating/audience_rating_line_last_hour'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: util.encrypt({ 'area': '全国', 'channels': tvName }),
      success: res => {
        if (res.data.status == 1) {
          let seriesData = [];
          let categories = res.data.data.time_axis;

          for (let i in res.data.data.list[tvName]) {
            seriesData.push(res.data.data.list[tvName][i]['audience_rate'] * 100)
          }
          
          if (seriesData.length) {
            
            categories = categories.slice(30);
            seriesData = seriesData.slice(30);

            lineCharts[column] = new wxCharts({
              canvasId: 'canvas-' + column,
              type: 'line',
              legend: false,
              dataPointShape: false,
              categories: categories,
              animation: true,
              background: '#2B2973',
              xAxis: {
                disableGrid: true,
                gridColor: '#373B81',
                fontColor: '#70719D'
              },
              yAxis: {
                gridColor: lineColors[column],
                fontColor: '#70719D',
                format: function (val) {
                  return val.toFixed(3);
                },
                min: 0
              },
              width: This.data.clientWidth - (This.data.clientWidth <= 320 ? 25: 35),
              height: This.data.clientWidth <= 320 ? 100 : 118,
              dataLabel: false,
              extra: {
                lineStyle: 'curve'
              },
              series: [{
                name: '收视率',
                color: colors[column],
                data: seriesData,
                format: function (val, name) {
                  return val.toFixed(3) + '';
                }
              }]
            });
          }
        }
      },
      fail: res => {

      },
      dataType: 'json'

    })
  },
  // 更新数据
  updateProgramRating: function (column) {
    let This = this,
      tvList = this.data.tvList, // 影视列表
      selectIndex = this.data.selectIndex; // 全部选择下标数组

    let tvName = tvList[selectIndex[column]];

    wx.request({
      url: util.createApiUrl('iRating/audience_rating_line_last_hour'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: util.encrypt({ 'area': '全国', 'channels': tvName }),
      success: res => {
        if (res.data.status == 1) {
          let seriesData = [];
          let categories = res.data.data.time_axis;

          for (let i in res.data.data.list[tvName]) {
            seriesData.push(res.data.data.list[tvName][i]['audience_rate'] * 100)
          }

          if (seriesData.length) {
            categories = categories.slice(30);
            seriesData = seriesData.slice(30);

            lineCharts[column].updateData({
              categories: categories,
              series: [{
                name: '收视率',
                color: colors[column],
                data: seriesData,
                format: function (val, name) {
                  return val.toFixed(3) + '';
                }
              }]
            });

          }
        }
      },
      fail: res => {

      },
      dataType: 'json'
    })
  },
  footerTap: app.footerTap
})