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

// Consume Non-UI observables
selectableMinDate.subscribe(module);
selectableMaxDate.subscribe(module);

var getSelectedMonth = function() {
  return self.SelectedMonth.value instanceof Observable ? self.SelectedMonth.value : self.SelectedMonth;
}

var calendarDateSelectedHandler = function(args) {
  var newDate = args ? new Date(args.selectedYear, args.selectedMonth, args.selectedDay) : null;

  debug_log('DatePicker, calendarDateSelectedHandler: newDate: {0}, selectedDate: {1}, self.SelectedDate.value.value: {2}'.format(Utils.formatDate(newDate), Utils.formatDate(selectedDate.value), Utils.formatDate(self.SelectedDate.value.value))); 

  hideCalendar();

  if (self.SelectedDate.value instanceof Observable)
    self.SelectedDate.value.value = newDate;
  else
    self.SelectedDate.value = newDate;

  if (Utils.isDate(newDate)) {
    DatePickerDateSelectedEvent.raise({
      selectedDay: newDate.getDate(),
      selectedMonth: newDate.getMonth(),
      selectedYear: newDate.getFullYear()
    });
  } else
    DatePickerDateSelectedEvent.raise();
};

var calendarMonthSelectedHandler = function(args) {
  var newDate = args ? new Date(args.selectedYear, args.selectedMonth, args.selectedDay) : null;
  hideCalendar();

  DatePickerMonthSelectedEvent.raise({
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

  debug_log('canSelectDate, givenDate: {0}, selectableMinDate.value: {1}, selectableMaxDate.value: {2}'.format(Utils.formatDate(givenDate), Utils.formatDate(selectableMinDate.value), Utils.formatDate(selectableMaxDate.value)));

  return (!Utils.isDate(selectableMinDate.value) || givenDateMoment.isAfter(selectableMinDate.value)) &&
    (!Utils.isDate(selectableMaxDate.value) || givenDateMoment.isBefore(selectableMaxDate.value)) &&
    (!self.CanOnlySelectBusinessDay.value || givenDateMoment.isBusinessDay())
}

var changeSelectedMonth = function(newDate) {
  // debug_log('DatePicker, changeSelectedMonth: newDate: {0}, selectedMonth: {1}, self.SelectedMonth.value.value: {2}'.format(Utils.formatDate(newDate), Utils.formatDate(selectedMonth.value), Utils.formatDate(self.SelectedMonth.value.value))); 

  if (self.SelectedMonth.value instanceof Observable)
    self.SelectedMonth.value.value = newDate;
  else
    self.SelectedMonth.value = newDate;

  DatePickerMonthSelectedEvent.raise({
    selectedDay: newDate.getDate(),
    selectedMonth: newDate.getMonth(),
    selectedYear: newDate.getFullYear()
  });
}

var selectPrevTime = function(args) {
  var selectedMonth = getSelectedMonth();
  debug_log('DatePicker, selectPrevTime, selectedMonth: ' + selectedMonth.value);

  if (selectedMonth.value) {
    var newDate = moment(selectedMonth.value).clone().add(-1, 'M');
    changeSelectedMonth(newDate.toDate());
  } else {
    var newDate = moment(selectedDate.value).clone().add(-1, 'd');
    var isNewDateValid = canSelectDate(newDate);
    while (isNewDateValid === false) {
      if ((Utils.isDate(selectableMinDate.value) && newDate.isBefore(selectableMinDate.value)))
        break;

        isNewDateValid = canSelectDate(newDate.add(-1, 'd'));
        debug_log('newDate: ' + newDate.toDate());
    }
    if (isNewDateValid)
      changeSelectedDate(newDate.toDate());
  }
};

var selectNextTime = function(args) {
  var selectedMonth = getSelectedMonth();
  debug_log('DatePicker, selectNextTime, selectedMonth: ' + selectedMonth.value);

  if (selectedMonth.value) {
    var newDate = moment(selectedMonth.value).clone().add(1, 'M');
    changeSelectedMonth(newDate.toDate());
  } else {
    var newDate = moment(selectedDate.value).clone().add(1, 'd');
    var isNewDateValid = canSelectDate(newDate);
    while (isNewDateValid === false) {
      if ((Utils.isDate(selectableMaxDate.value) && newDate.isAfter(selectableMaxDate.value)))
        break;

        isNewDateValid = canSelectDate(newDate.add(1, 'd'));
        debug_log('newDate: ' + newDate.toDate());
    }
    if (isNewDateValid)
      changeSelectedDate(newDate.toDate());
  }
};

var showCalendar = function() {
  isCalendarVisible.value = true;
}

var hideCalendar = function() {
  isCalendarVisible.value = false;
}

module.exports = {
  selectedDate,

  selectedDateStr: Observable(function() {
    var selectedMonth = getSelectedMonth();

    if (selectedMonth.value)
      return moment(selectedMonth.value).format('MMMM YYYY');
    else if (selectedDate.value)
      return moment(selectedDate.value).format('DD/MM/YYYY');
  }),
  calendarDateSelectedHandler,
  calendarMonthSelectedHandler,
  selectPrevTime,
  selectNextTime,

  isCalendarVisible,
  showCalendar,
  hideCalendar
};