var Observable = require('FuseJS/Observable');

var AppLocalization = require('backend/AppLocalization.js');
var Utils = require('backend/JsUtils.js');

var moment = require('assets/js/moment-bd.js');

AppLocalization.currLocaleObj.onValueChanged(module, function(val) {
  // debug_log('DatePicker, AppLocalization.currLocaleObj.langCode: ' + Utils.objToStr(val.langCode));
  moment.locale(val.langCode);
});

var self = this;
var selectedDate = self.SelectedDate.inner();
var selectableMinDate = self.SelectableMinDate.inner();
var selectableMaxDate = self.SelectableMaxDate.inner();
var isCalendarVisible = Observable(false);

var calendarDateSelectedHandler = function(args) {
  var newDate = new Date(args.selectedYear, args.selectedMonth, args.selectedDay);
  // debug_log('DatePicker, calendarDateSelectedHandler: newDate: {0}, selectedDate: {1}, self.SelectedDate.value.value: {2}'.format(Utils.formatDate(newDate), Utils.formatDate(selectedDate.value), Utils.formatDate(self.SelectedDate.value.value))); 

  hideCalendar();

  if (self.SelectedDate.value instanceof Observable)
    self.SelectedDate.value.value = newDate;
  else
    self.SelectedDate.value = newDate;

  DatePickerDateSelectedEvent.raise({
    selectedDay: newDate.getDate(),
    selectedMonth: newDate.getMonth(),
    selectedYear: newDate.getFullYear()
  });
};

var changeSelectedDate = function(newDate) {
  // debug_log('DatePicker, changeSelectedDate: newDate: {0}, selectedDate: {1}, self.SelectedDate.value.value: {2}'.format(Utils.formatDate(newDate), Utils.formatDate(selectedDate.value), Utils.formatDate(self.SelectedDate.value.value))); 

  if (!canSelectDate(newDate))
    return;

  if (self.SelectedDate.value instanceof Observable)
    self.SelectedDate.value.value = newDate;
  else
    self.SelectedDate.value = newDate;

  DatePickerDateSelectedEvent.raise({
    selectedDay: newDate.getDate(),
    selectedMonth: newDate.getMonth(),
    selectedYear: newDate.getFullYear()
  });
}

var canSelectDate = function(givenDate) {
  var givenDateMoment = moment(givenDate);

  return (!Utils.isDate(selectableMinDate.value) || givenDateMoment.isAfter(selectableMinDate.value)) &&
    (!Utils.isDate(selectableMaxDate.value) || givenDateMoment.isBefore(selectableMaxDate.value)) &&
    (!self.CanOnlySelectBusinessDay.value || givenDateMoment.isBusinessDay())
}

var selectPrevDay = function(args) {
  // debug_log('DatePicker, selectPrevDay');
  changeSelectedDate(moment(selectedDate.value).clone().add(-1, 'd').toDate());
};

var selectNextDay = function(args) {
  // debug_log('DatePicker, selectNextDay');
  changeSelectedDate(moment(selectedDate.value).clone().add(1, 'd').toDate());
};

var showCalendar = function() {
  isCalendarVisible.value = true;
}

var hideCalendar = function() {
  isCalendarVisible.value = false;
}

module.exports = {
  selectedDate,

  selectedDateStr: selectedDate.map(function(x) {
    return moment(x).format('DD/MM/YYYY');
  }),
  calendarDateSelectedHandler,
  selectPrevDay,
  selectNextDay,

  isCalendarVisible,
  showCalendar,
  hideCalendar
};