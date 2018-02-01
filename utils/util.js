//let md5 = require('./md5.js')
let md5 = require('./md5-new.js')
let config = require('../config.js')

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('') + '' + [hour, minute, second].map(formatNumber).join('')
}
function getTime(ts){
  return new Date(parseInt(ts) * 1000).toLocaleString().substr(0,17)
}
function getDate(ts){
  return new Date(parseInt(ts) * 1000).toLocaleString().substr(0,10)
}

function currDate(){
  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var day = d.getDate();

  return [year, month, day].map(formatNumber).join('-')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 参数加sign
function encrypt(data){
  let appId = config.appId, appKey = config.appKey, currDate = formatTime(new Date());
  
  data = data == null ? {} : data;

  var sortObj = {};
  if (Object.prototype.toString.call(data) == '[object Object]'){
    var str = '';
    
    data.app_id = data.app_id || appId;
    data.time_stamp = data.time_stamp || currDate;
    data.jiami = 'no';

    for (let k of Object.keys(data).sort()){
      sortObj[k] = data[k]
    }

    for (let k in sortObj){
      str += (k + sortObj[k])
    }

    str += appKey;
    sortObj.sign = md5(str);
  }

  return sortObj
}

// 拼接接口地址
function createApiUrl(apiName){
  if (typeof apiName != 'string' || !apiName.length) return '';

  return config.apiHost + '/' + apiName + '.php';
}

//千位分隔
function getFormatData(d) {
  return d.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
}

function currMonthDate() {
  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth() + 1;

  return [year, month].map(formatNumber).join('-')
}

module.exports = {
  formatTime: formatTime,
  currDate: currDate,
  getTime: getTime,
  getDate: getDate,
  encrypt: encrypt,
  createApiUrl: createApiUrl,
  getFormatData: getFormatData,
  currMonthDate: currMonthDate
}
