function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatduration(duration) {
  duration = new Date(duration);
  let mint = duration.getMinutes();
  let sec = duration.getSeconds();
  return formatNumber(mint) + ":" + formatNumber(sec);
}

function queryToObject(str) {
  var s = str.split("&");
  var param2 = {};
  for (var i = 0; i < s.length; i++) {
    var d = s[i].split("=");
    param2[d[0]] = d[1]
  }
  return param2;
}
function objectToString(param2) {
  var arr = [];
  for (var i in param2) {
    arr.unshift(i + "=" + param2[i]);
  }
  return arr.join("&");
}

function ksort(src) {
  var keys = Object.keys(src),
    target = {};
  keys.sort();
  keys.forEach(function (key) {
    target[key] = src[key];
  });
  return target;
}
function parseQueryString(url) {
  var str = url.split("?")[1];
  var result = {};
  if (str) {
    var items = str.split("&");
    var arr = [];
    for (var i = 0; i < items.length; i++) {
      arr = items[i].split('=');
      result[arr[0]] = arr[1];
    }
  }
  return result;
}

function strToJson(str) {
  return JSON.parse(str)
}

function jsonOptimize(json) {
  for (var index in json) {
    if (isNull(json[index])) {
      json[index] = ''
    }
    else if (typeof (json[index]) == 'object') {
      json[index] = jsonOptimize(json[index])
    }
  }
  return json
}

function isNull(value) {
  if (typeof (value) == 'undefined') {
    return true
  }
  if (value == null) {
    return true
  }
  if (typeof (value) == 'string') {
    return (trim(value) == '')
  }

  return false
}

function trim(str) {
  if (str == null) {
    return ''
  }

  return str.replace(/(^\s*)|(\s*$)/g, "")
}

function checkMsg(msg) {
  return msg.replace(/查无实体对象: /g, '')
}

module.exports = {
  ksort: ksort,
  parseQueryString: parseQueryString,
  formatTime: formatTime,
  queryToObject: queryToObject,
  objectToString: objectToString,
  formatduration: formatduration,
  strToJson: strToJson,
  jsonOptimize: jsonOptimize,
  isNull: isNull,
  checkMsg: checkMsg,
}
