var moment = require('assets/js/moment-bd.js');

function setMomentLocale(langCode) {
  moment.locale(langCode);
}

var isEmpty = function(v, allowBlank){
  return ((typeof v) === 'undefined') || v === null || ((Array.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
};

var isDate = function(v){
  return v && v instanceof Date;
};

var strToDate = function(dateStr, parseFormatStr) {
  return moment(dateStr, parseFormatStr || 'YYYY-MM-DDTHH:mm:ss').toDate();
};

var formatDate = function(dateVal, formatString) {
  return (isDate(dateVal) || moment.isMoment(dateVal)) ? moment(dateVal).format(formatString || 'DD/MM/YYYY') : '(invalid date value)';
};

String.prototype.format = function() {
  var args = Array.prototype.slice.call(arguments, 0, arguments.length);
  // debug_log('String.format.args: ' + args + ', this: ' + this);
  return this.replace(/\{(\d+)\}/g, function(m, i) {
    return args[i];
  });
};

module.exports = {
  setMomentLocale,
  
  isEmpty,
  isDate,
  strToDate,
  formatDate
}