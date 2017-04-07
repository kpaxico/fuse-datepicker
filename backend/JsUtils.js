var moment = require('assets/js/moment-bd.js');
moment.locale('tr');

var isEmpty = function(v, allowBlank){
  return ((typeof v) === 'undefined') || v === null || ((Array.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
};

var isDate = function(v){
  return v && v instanceof Date;
};

var strToDate = function(dateStr, parseFormatStr, formatStr) {
  return moment(dateStr, parseFormatStr).format(formatStr || 'DD/MM/YYYY');
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
  isEmpty,
  isDate,
  strToDate,
  formatDate
}