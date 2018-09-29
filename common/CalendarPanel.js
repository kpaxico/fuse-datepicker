var Observable = require('FuseJS/Observable');

var AppLocalization = require('backend/AppLocalization.js');
var Utils = require('backend/JsUtils.js');

var moment = require('assets/js/moment-bd.js');

AppLocalization.currLocaleObj.onValueChanged(module, function(val) {
  // debug_log('CalendarPanel, AppLocalization.currLocaleObj.langCode: ' + Utils.objToStr(val.langCode));
  moment.locale(val.langCode);
});

var self = this;
var selectedDate = self.SelectedDate.inner();
var selectableMinDate = self.SelectableMinDate.inner();
var selectableMaxDate = self.SelectableMaxDate.inner();

var currentDate = moment(null);
var currentYearMonthLabel = Observable();
var currentViewDates = [];
var isSelectedDayInCurrentMonth = Observable(false);

var selectedDay = Observable([]);

var initDaysView = function() {
  if (currentViewDates.length > 0)
    return;

  function getDayItem(state, dayNo, isEnabled, isSelectable, isInView) {
    return {
      state: state,
      dayNo: dayNo,
      isEnabled: isEnabled,
      isSelectable: Observable(isSelectable),
      isInView: Observable(isInView)
    }
  }

  for (var i = 23; i <= 31; i++)
    currentViewDates.push(getDayItem(-1, i, false, false, false)); 

  for (var i = 1; i <= 31; i++)
    currentViewDates.push(getDayItem(0, i, true, true, true)); 

  for (var i = 1; i <= 6; i++)
    currentViewDates.push(getDayItem(1, i, false, false, false));
}

var refreshDaysView = function() {
  // debug_log('refreshDaysView, currentDate: {0}, selectableMinDate.value: {1}, selectableMaxDate.value: {2}'.format(Utils.formatDate(currentDate), Utils.formatDate(selectableMinDate.value), Utils.formatDate(selectableMaxDate.value)));

  if (!currentDate.isValid())
    return;

  var firstDate = moment([currentDate.year(), currentDate.month(), 1]);
  var lastDate = moment(currentDate).endOf('month');

  debug_log('refreshDaysView, firstDate: {0}, lastDate: {1}'.format(Utils.formatDate(firstDate), Utils.formatDate(lastDate)));

  // Previous Month Days Handling
  var firstDayNoOfWeek = moment.localeData().firstDayOfWeek(); // en: 0, tr: 1
  var prevMonthDayCount = (firstDate.day() === 0 ? 7 : firstDate.day()) - firstDayNoOfWeek;
  // debug_log('firstDayNoOfWeek: {0}, firstDate.day: {1}, prevMonthDayCount: {2}'.format(firstDayNoOfWeek, firstDate.day(), prevMonthDayCount));
  var prevMonthDays = [];
  while (prevMonthDayCount > 0) {
    prevMonthDays.push(firstDate.clone().add((-1) * prevMonthDayCount, 'd').date());
    --prevMonthDayCount;
  }
  currentViewDates.filter(function(item) {
    return item.state === -1;
  }).forEach(function(element) {
    element.isInView.value = prevMonthDays.includes(element.dayNo);
    // debug_log('element.dayNo: {0}, element.isInView.value: {1}'.format(element.dayNo, element.isInView.value));
  });

  // Current Month Last Days Handling
  var currentMonthLastDays = currentViewDates.filter(function(item) {
    return item.state === 0 && item.dayNo >= 28;
  }).forEach(function(element) {
    element.isInView.value = element.dayNo <= lastDate.date();
    // debug_log('element.dayNo: {0}, lastDate.date(): {1}, element.isInView.value: {2}'.format(element.dayNo, lastDate.date(), element.isInView.value));
  });

  // Next Month Days Handling
  var nextMonthDayCount = 7 - (lastDate.day() === 0 ? 7 : lastDate.day());
  var nextMonthDays = [];
  for (var i = 0; i < nextMonthDayCount; i++)
    nextMonthDays.push(i + 1);
  // debug_log('lastDate.day(): {0}, nextMonthDays: {1}, {2}'.format(lastDate.day(), nextMonthDays, lastDate));

  currentViewDates.filter(function(item) {
    return item.state === 1;
  }).forEach(function(element) {
    element.isInView.value = nextMonthDays.includes(element.dayNo);
  });

  // selectableDate marking
  markSelectableDates();
}

var markSelectableDates = function() {
  currentViewDates.filter(function(item) {
    return item.state === 0;
  }).forEach(function(element) {
    var elementMoment = moment([currentDate.year(), currentDate.month(), element.dayNo]);
    var selectable = true;
    
    selectable = (!Utils.isDate(selectableMinDate.value) || elementMoment.isAfter(selectableMinDate.value)) && (!Utils.isDate(selectableMaxDate.value) || elementMoment.isBefore(selectableMaxDate.value)) && 
      (!self.CanOnlySelectBusinessDay.value || elementMoment.isBusinessDay());

    element.isSelectable.value = selectable;
    // debug_log('dayNo: {0}, isSelectable: {1}'.format(element.dayNo, selectable));
  });
}

var canSelectDate = function(givenDate) {
  var givenDateMoment = moment(givenDate);
  
  return (!Utils.isDate(selectableMinDate.value) || givenDateMoment.isAfter(selectableMinDate.value)) && 
    (!Utils.isDate(selectableMaxDate.value) || givenDateMoment.isBefore(selectableMaxDate.value)) && 
    (!self.CanOnlySelectBusinessDay.value || givenDateMoment.isBusinessDay())
}

var setCurrentDate = function(dateVal) {
  if (dateVal && dateVal instanceof Date && !moment(dateVal).isSame(currentDate, 'day')) {
    // debug_log('setCurrentDate, dateVal: {0}, currentDate: {1}, areEqual: {2}'.format(Utils.formatDate(dateVal), Utils.formatDate(currentDate), moment(dateVal).isSame(currentDate, 'day')));
    currentDate = moment(dateVal);
    currentYearMonthLabel.value = currentDate.format('MMMM YYYY');
    isSelectedDayInCurrentMonth.value = moment(selectedDate.value).isSame(currentDate, 'month');
    refreshDaysView();
  } 
  // else
    // debug_log('setCurrentDate, dateVal: {0}, currentDate: {1}: SKIPPED'.format(Utils.formatDate(dateVal), Utils.formatDate(currentDate)));
}

selectableMinDate.onValueChanged(module, function(dateVal) {
  // debug_log('selectableMinDate.onValueChanged: {0}'.format(Utils.formatDate(selectableMinDate.value)));
  markSelectableDates();
})

selectableMaxDate.onValueChanged(module, function(dateVal) {
  // debug_log('selectableMaxDate.onValueChanged: {0}'.format(Utils.formatDate(selectableMaxDate.value)));
  markSelectableDates();
})

selectedDate.onValueChanged(module, function(dateVal) {
  // debug_log('selectedDate.onValueChanged: dateVal: {0}'.format(Utils.formatDate(dateVal)));

  if (!Utils.isDate(dateVal))
    return;

  setCurrentDate(new Date(dateVal.getFullYear(), dateVal.getMonth(), 1));
  isSelectedDayInCurrentMonth.value = moment(selectedDate.value).isSame(currentDate, 'month');

  if (selectedDay.value != dateVal.getDate())
    selectedDay.value = dateVal.getDate();
});

selectedDay.onValueChanged(module, function() {
  if (Utils.isEmpty(selectedDay.value) || selectedDay.value == 0 || !currentDate.isValid()) {
    // debug_log('selectedDay.onValueChanged, Utils.isEmpty(selectedDay.value): {0}, selectedDay.value == 0: {1}, currentDate.isSame("1900-01-01"): {2}: SKIPPED'.format(Utils.isEmpty(selectedDay.value), selectedDay.value == 0, currentDate.isSame('1900-01-01')));
  } else {
    var newDate = new Date(currentDate.year(), currentDate.month(), selectedDay.value);
    if (!Utils.isDate(selectedDate.value) || !moment(newDate).isSame(selectedDate.value, 'day')) {
      // debug_log('selectedDay.onValueChanged: newDate: {0}, selectedDate.value: {1}'.format(Utils.formatDate(newDate), Utils.formatDate(selectedDate.value)));

      setSelectedDate(newDate, false);
    } 
    // else
    //   debug_log('selectedDay.onValueChanged, moment(newDate).isSame(selectedDate.value, "day") = true, newDate: {0}, selectedDate.value: {1}: SKIPPED'.format(Utils.formatDate(newDate), Utils.formatDate(selectedDate.value)));
  }
})

var setSelectedDate = function(newDate, silentUpdate) {
  debug_log('setSelectedDate: newDate: {0}, silentUpdate: {1}'.format(Utils.formatDate(newDate), silentUpdate));

  if (self.SelectedDate.value instanceof Observable)
    self.SelectedDate.value.value = newDate;
  else
    self.SelectedDate.value = newDate;
  
  CalendarDateSelectedEvent.raise({
    selectedDay: newDate.getDate(), 
    selectedMonth: newDate.getMonth(),
    selectedYear: newDate.getFullYear() 
  });
}

var goToPrevMonth = function(args) {
  setCurrentDate(currentDate.clone().add(-1, 'M').toDate());
}

var goToNextMonth = function(args) {
  setCurrentDate(currentDate.clone().add(1, 'M').toDate());
}

var selectToday = function() {
  // debug_log('selectToday');
  var newDate = new Date();
  if (canSelectDate(newDate))
    setSelectedDate(newDate, false);
}

var selectedDayTappedHandler = function(args) {
  debug_log('selectedDayTappedHandler, args.data.dayNo: {0}, selectedDay.value: {1}, selectedDate.value: {2}, currentDate: {3}'.format(args.data.dayNo, selectedDay.value, Utils.formatDate(selectedDate.value), Utils.formatDate(currentDate)));
  if (!Utils.isEmpty(selectedDate.value)) {
    if (moment(selectedDate.value).isSame(currentDate, 'month'))
      CalendarSelectedDayTappedEvent.raise({
        selectedDay: selectedDate.value.getDate(), 
        selectedMonth: selectedDate.value.getMonth(),
        selectedYear: selectedDate.value.getFullYear() 
      });
    else
      setSelectedDate(new Date(currentDate.year(), currentDate.month(), selectedDay.value), false);
  } else {
    debug_log('selectedDayTappedHandler, selectedDate.value is UNDEFINED: {0}'.format(selectedDate.value));
  }
}

initDaysView();

var initialCurrentMDate = moment().isBusinessDay() === false ? moment().nextBusinessDay() : moment();
setCurrentDate(initialCurrentMDate.toDate());

module.exports = {
  appLoc: AppLocalization.currLocale,
  
  shortDayNames: moment.weekdaysShort(true),
  currentYearMonthLabel,
  currentViewDates,

  goToPrevMonth,
  goToNextMonth,
  selectToday,
  selectedDayTappedHandler,

  selectedDay,
  isSelectedDayInCurrentMonth,
  highlightSelectedDate: self.HighlightSelectedDate.inner()
}