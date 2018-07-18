// var host = "https://221.5.9.254:9090/"
//var host = "http://www.fulnero.com:9090/"
var host = "https://htl.mlww.info/"
const util = require('./util')

function request(params) {

  if (params && params['url']) {
    if (params.url.indexOf('https') < 0) {
      params['url'] = host + params['url']
    }
  }
  if (!params['data']) {
    params['data'] = {}
  }
  // var sid = wx.getStorageSync('sid')
  // if (sid) {
  //     params['data']['_sid'] = sid
  // }
  var queryParam = util.parseQueryString(params['url'])
  for (var key in queryParam) {
    // statement
    if (queryParam[key]) {
      params['data'][key] = queryParam[key];
    }
  }
  wx.request(params)
}
module.exports = {
  request: request,
  host: host
}
