var moment = require('assets/js/moment-bd.js');
moment.locale('tr');

var isEmpty = function(v, allowBlank){
  return ((typeof v) === 'undefined') || v === null || ((Array.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
};

var isDate = function(v){
  return v && v instanceof Date;
};

var formatDate = function(dateVal, formatString) {
  return (isDate(dateVal) || moment.isMoment(dateVal)) ? moment(dateVal).format(formatString || 'DD/MM/YYYY') : '(invalid date value)';
};

module.exports = {
  isEmpty,
  isDate,
  formatDate
}