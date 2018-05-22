'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EVENT_DATE_PICKER_YEAR_UPDATE = 'date-picker:year-update';
var EVENT_DATE_PICKER_MONTH_UPDATE = 'date-picker:month-update';
var EVENT_DATE_PICKER_FORCE_EDIT = 'date-picker:force-edit';
var EVENT_DATE_PICKER_ENTER = 'date-picker:enter';
var EVENT_DATE_PICKER_EXIT = 'date-picker:exit';

/* eslint-env jquery */

/**
 * Date-picker
 *
 * @author Magesh Ravi
 * @version 1.0.0
 */

var DatePicker = function () {
  _createClass(DatePicker, null, [{
    key: 'FORMAT_DATE',
    get: function get() {
      return 'date';
    }
  }, {
    key: 'FORMAT_DATETIME',
    get: function get() {
      return 'datetime';
    }

    /**
     * Creates a DatePicker instance
     * @param $input {jQuery}
     */

  }]);

  function DatePicker($input) {
    _classCallCheck(this, DatePicker);

    this.defaults = {};

    this.cssSelectors = {
      dp: '.c-date-picker',
      dpFocused: '.c-date-picker--focused',
      dpDisplay: '.c-date-picker__display',
      dpDropDown: '.c-date-picker__drop-down',
      dpYearWrapper: '.c-date-picker__year-wrapper',
      dpMonthWrapper: '.c-date-picker__month-wrapper',
      dpMonth: '.c-date-picker__month',
      dpCalWrapper: '.c-date-picker__cal-wrapper',
      dpWeekWrapper: '.c-date-picker__week-wrapper',
      dpDate: '.c-date-picker__date',
      dpTimeWrapper: '.c-date-picker__time-wrapper',
      dpOverlay: '.c-date-picker__overlay',
      focus: '.focus',
      active: '.active',
      empty: '.empty',
      disabled: '.disabled',
      jsPrevYear: '.js-date-picker-prev-year',
      jsYear: '.js-date-picker-year',
      jsNextYear: '.js-date-picker-next-year',
      jsHour: '.js-date-picker-hour',
      jsMinute: '.js-date-picker-minute',
      jsMeridian: '.js-date-picker-meridian'
    };

    this.$input = $input;

    this.parseInputAttrs();

    this.setup();

    this.bindUIActions();
  }

  _createClass(DatePicker, [{
    key: 'parseInputAttrs',
    value: function parseInputAttrs() {
      var minDateStr = this.$input.data('min-date');
      var minDate = parseDateFromString(minDateStr);

      if (!isNaN(minDate)) {
        this.defaults.minDate = minDate;
      }

      var valueStr = this.$input.val();
      var value = parseDateFromString(valueStr);

      if (isNaN(value)) {
        this.defaults.value = parseDateFromString('today');
      } else {
        this.defaults.value = value;
      }

      var formatStr = this.$input.data('format');
      if (!formatStr) {
        formatStr = DatePicker.FORMAT_DATE;
      }

      var allowedFormats = [DatePicker.FORMAT_DATE, DatePicker.FORMAT_DATETIME];

      if (allowedFormats.indexOf(formatStr) !== -1) {
        this.defaults.format = formatStr;
      }

      /**
       * Parses date from the given string
       * @param dateStr {String}
       */
      function parseDateFromString(dateStr) {
        var today = new Date();
        var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        switch (dateStr) {
          case 'today':
            return today;

          case 'tomorrow':
            return tomorrow;

          default:
            return new Date(dateStr);
        }
      }
    }
  }, {
    key: 'setup',
    value: function setup() {
      var dpClass = getClassNameFromSelector(this.cssSelectors.dp);
      var dpDisplayClass = getClassNameFromSelector(this.cssSelectors.dpDisplay);
      var dpDropDown = getClassNameFromSelector(this.cssSelectors.dpDropDown);

      // draw date-picker
      this.$dp = $('<div class="' + dpClass + '"></div>');
      this.$dp.insertAfter(this.$input);

      this.$dpDisplay = $('<input type="text" class="' + dpDisplayClass + '" readonly>');
      var displayValue = getFormattedDate(this.defaults.value);
      if (this.defaults.format === DatePicker.FORMAT_DATETIME) {
        displayValue = getFormattedDateTime(this.defaults.value, true);
      }
      this.$dpDisplay.val(displayValue);
      this.$dp.append(this.$dpDisplay);

      var $dpDropDown = $('<div class="' + dpDropDown + '"></div>');
      this.$dp.append($dpDropDown);

      this.$dpYearWrapper = $(this.getYearWrapperHtml());
      $dpDropDown.append(this.$dpYearWrapper);

      this.$dpMonthWrapper = $(this.getMonthWrapperHtml());
      $dpDropDown.append(this.$dpMonthWrapper);

      this.$dpCalWrapper = $(this.getCalWrapperHtml());
      $dpDropDown.append(this.$dpCalWrapper);

      if (this.defaults.format === DatePicker.FORMAT_DATETIME) {
        this.$dpTimeWrapper = $(this.getTimeWrapperHtml());
        $dpDropDown.append(this.$dpTimeWrapper);
      }

      this.$input.attr('type', 'hidden');
      this.$dp.append(this.$input);

      this.$dpOverlay = $(this.getOverlayHtml());
      this.$dp.append(this.$dpOverlay);

      // init references
      this.$year = this.$dp.find(this.cssSelectors.jsYear);
      this.$hour = this.$dp.find(this.cssSelectors.jsHour);
      this.$minute = this.$dp.find(this.cssSelectors.jsMinute);
      this.$meridian = this.$dp.find(this.cssSelectors.jsMeridian);
    }
  }, {
    key: 'bindUIActions',
    value: function bindUIActions() {
      this.$dp.on('focus', this.show.bind(this));
      this.$dpDisplay.on('focus', this.show.bind(this));
      this.$dpOverlay.on('click', this.hide.bind(this));

      // decrement year
      this.$dp.on('click', this.cssSelectors.jsPrevYear, function () {
        'use strict';

        this.$year.val(parseInt(this.$year.val()) - 1);
        this.$dp.trigger(EVENT_DATE_PICKER_YEAR_UPDATE);
      }.bind(this));

      // increment year
      this.$dp.on('click', this.cssSelectors.jsNextYear, function () {
        'use strict';

        this.$year.val(parseInt(this.$year.val()) + 1);
        this.$dp.trigger(EVENT_DATE_PICKER_YEAR_UPDATE);
      }.bind(this));

      this.$year.on('change', function (ev) {
        this.updateMonth();
      }.bind(this));

      var disabledClass = getClassNameFromSelector(this.cssSelectors.disabled);

      this.$year.on('keyup', function (ev) {
        if (ev.keyCode !== 13) {
          this.$dpMonthWrapper.addClass(disabledClass);
          this.$dpCalWrapper.addClass(disabledClass);
          return;
        }

        this.$dpMonthWrapper.removeClass(disabledClass);
        this.$dpCalWrapper.removeClass(disabledClass);

        this.$dpMonthWrapper.focus();
        this.navigateMonthsWithKeys();
      }.bind(this));

      this.$year.on('blur', function (ev) {
        this.$dpMonthWrapper.focus();
      }.bind(this));

      this.$dp.on(EVENT_DATE_PICKER_YEAR_UPDATE, this.updateMonth.bind(this));
      this.$dp.on(EVENT_DATE_PICKER_MONTH_UPDATE, this.updateCal.bind(this));

      this.$dp.on('keyup', this.cssSelectors.dpMonthWrapper, this.navigateMonthsWithKeys.bind(this));

      this.$dp.on('click', this.cssSelectors.dpMonth, this.selectMonth.bind(this));

      this.$dp.on('keyup', this.cssSelectors.dpCalWrapper, this.navigateDateWithKeys.bind(this));

      this.$dp.on('click', this.cssSelectors.dpDate, this.selectDate.bind(this));
      this.$dp.on(EVENT_DATE_PICKER_FORCE_EDIT, this.forceEditHandler.bind(this));

      this.$dp.on('click', this.cssSelectors.dpTimeWrapper + ' button', this.setTimeAndHide.bind(this));

      // listen to other datepicker instances
      $('body').on(EVENT_DATE_PICKER_ENTER, function (ev) {
        if (ev.target !== this.$dp.get(0)) {
          // some other datepicker in the same page entered drop-down state
          this.$dp.removeAttr('tabindex');
          this.$dpDisplay.attr('disabled', true);
        }
      }.bind(this));

      $('body').on(EVENT_DATE_PICKER_EXIT, function (ev) {
        if (ev.target !== this.$dp.get(0)) {
          // some other datepicker in the same page exited drop-down state
          this.$dp.attr('tabindex', '0');
          this.$dpDisplay.removeAttr('disabled');
        }
      }.bind(this));
    }
  }, {
    key: 'show',
    value: function show() {
      this.reset();
      this.$dp.addClass(getClassNameFromSelector(this.cssSelectors.dpFocused));

      $('html,body').css({ 'overflow': 'hidden' });
      this.$dp.trigger(EVENT_DATE_PICKER_ENTER);
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.$dp.removeClass(getClassNameFromSelector(this.cssSelectors.dpFocused));

      $('html,body').css({ 'overflow': 'auto' });
      this.$dp.trigger(EVENT_DATE_PICKER_EXIT);
      this.$dp.blur(); // to avoid looping on the same instance when navigating with keyboard
    }
  }, {
    key: 'forceEditHandler',
    value: function forceEditHandler() {
      this.show();
      this.$dp.focus();
    }
  }, {
    key: 'reset',
    value: function reset() {
      // update year
      this.$year.val(this.defaults.value.getFullYear());

      // update month-wrapper
      this.$dpMonthWrapper.remove();
      this.$dpMonthWrapper = $(this.getMonthWrapperHtml());
      this.$dpMonthWrapper.insertAfter(this.$dpYearWrapper);

      // update cal-wrapper
      this.$dpCalWrapper.remove();
      this.$dpCalWrapper = $(this.getCalWrapperHtml());
      this.$dpCalWrapper.insertAfter(this.$dpMonthWrapper);
    }
  }, {
    key: 'updateMonth',
    value: function updateMonth() {
      var $oldMonthWrapper = this.$dpMonthWrapper;
      this.$dpMonthWrapper = $(this.getMonthWrapperHtml());
      $oldMonthWrapper.replaceWith(this.$dpMonthWrapper);

      this.$dp.trigger(EVENT_DATE_PICKER_MONTH_UPDATE);
    }
  }, {
    key: 'updateCal',
    value: function updateCal() {
      this.$dpCalWrapper.remove();
      this.$dpCalWrapper = $(this.getCalWrapperHtml());
      this.$dpCalWrapper.insertAfter(this.$dpMonthWrapper);
    }

    /**
     * Navigate months with arrow keys
     * @param ev {Event}
     */

  }, {
    key: 'navigateMonthsWithKeys',
    value: function navigateMonthsWithKeys(ev) {
      var leftKey = 37;
      var upKey = 38;
      var rightKey = 39;
      var downKey = 40;
      var enterKey = 13;

      var focusClass = getClassNameFromSelector(this.cssSelectors.focus);
      var disabledClass = getClassNameFromSelector(this.cssSelectors.disabled);

      if (this.$dpMonthWrapper.hasClass(disabledClass)) {
        return;
      }

      // check for focused month
      var $focusedMonth = this.$dp.find(this.cssSelectors.dpMonth + this.cssSelectors.focus);
      if (!$focusedMonth.length) {
        // check for active month
        $focusedMonth = this.$dp.find(this.cssSelectors.dpMonth + this.cssSelectors.active);
        $focusedMonth.addClass(focusClass);
      }
      if (!$focusedMonth.length) {
        // get this first non-disabled month
        $focusedMonth = this.$dp.find(this.cssSelectors.dpMonth + ':not(' + this.cssSelectors.disabled + ')').first();
        $focusedMonth.addClass(focusClass);
      }

      if (!ev) {
        return;
      }

      var $targetMonth;

      switch (ev.keyCode) {
        case leftKey:
          $targetMonth = $focusedMonth.prev();

          if (!$targetMonth.length) {
            // prev item does not exist. go to last item.
            $targetMonth = $focusedMonth.siblings(':last');
          }

          if ($targetMonth.hasClass(disabledClass)) {
            // item disabled. go to last item that is NOT disabled.
            $targetMonth = $focusedMonth.siblings(':not(' + this.cssSelectors.disabled + ')').last();
          }

          $targetMonth.addClass(focusClass).siblings().removeClass(focusClass);
          break;

        case rightKey:
          $targetMonth = $focusedMonth.next();

          if (!$targetMonth.length) {
            // next item does not exist. go to first item.
            $targetMonth = $focusedMonth.siblings(':first');
          }

          if ($targetMonth.hasClass(disabledClass)) {
            // item disabled. go to first item that is NOT disabled.
            $targetMonth = $focusedMonth.siblings(':not(' + this.cssSelectors.disabled + ')').first();
          }

          $targetMonth.addClass(focusClass).siblings().removeClass(focusClass);
          break;

        case upKey:
        case downKey:
          var $months = this.$dp.find(this.cssSelectors.dpMonth);
          var idx = $months.index($focusedMonth);

          if (idx < 6) {
            $targetMonth = $months.eq(idx + 6);
          } else {
            $targetMonth = $months.eq(idx - 6);
          }

          if (!$targetMonth.hasClass(disabledClass)) {
            $targetMonth.addClass(focusClass).siblings().removeClass(focusClass);
          }
          break;

        case enterKey:
          $focusedMonth.click();
          this.$dpCalWrapper.focus();
          this.navigateDateWithKeys();
      }
    }

    /**
     * Navigate date with arrow keys
     * @param ev {Event}
     */

  }, {
    key: 'navigateDateWithKeys',
    value: function navigateDateWithKeys(ev) {
      var leftKey = 37;
      var upKey = 38;
      var rightKey = 39;
      var downKey = 40;
      var enterKey = 13;

      var $dates = this.$dp.find(this.cssSelectors.dpDate).filter(':not(' + this.cssSelectors.empty + ')');
      var focusClass = getClassNameFromSelector(this.cssSelectors.focus);
      var disabledClass = getClassNameFromSelector(this.cssSelectors.disabled);

      if (this.$dpCalWrapper.hasClass(disabledClass)) {
        return;
      }

      var $focusedDate = $dates.filter(this.cssSelectors.focus);
      if (!$focusedDate.length) {
        $focusedDate = $dates.filter(':not(' + this.cssSelectors.disabled + ')').first();
        $focusedDate.addClass(focusClass);
      }

      if (!ev) {
        return;
      }

      var idx = $dates.index($focusedDate);
      var $targetDate;

      switch (ev.keyCode) {
        case leftKey:
          if (idx === 0) {
            $targetDate = $dates.filter(':not(' + this.cssSelectors.disabled + ')').last();
          } else {
            $targetDate = $dates.eq(idx - 1);
          }

          if ($targetDate.hasClass(disabledClass)) {
            $targetDate = $dates.filter(':not(' + this.cssSelectors.disabled + ')').last();
          }

          $targetDate.addClass(focusClass).siblings().removeClass(focusClass);
          break;

        case rightKey:
          if (idx === $dates.length - 1) {
            $targetDate = $dates.filter(':not(' + this.cssSelectors.disabled + ')').first();
          } else {
            $targetDate = $dates.eq(idx + 1);
          }

          if ($targetDate.hasClass(disabledClass)) {
            $targetDate = $dates.filter(':not(' + this.cssSelectors.disabled + ')').first();
          }

          $targetDate.addClass(focusClass).siblings().removeClass(focusClass);
          break;

        case upKey:
          if (idx <= 6) {
            return;
          }

          $targetDate = $dates.eq(idx - 7);

          if (!$targetDate.length) {
            return;
          }

          if ($targetDate.hasClass(disabledClass)) {
            return;
          }

          $targetDate.addClass(focusClass).siblings().removeClass(focusClass);
          break;

        case downKey:
          if (idx >= $dates.length - 7) {
            return;
          }

          $targetDate = $dates.eq(idx + 7);

          if (!$targetDate.length) {
            return;
          }

          if ($targetDate.hasClass(disabledClass)) {
            return;
          }

          $targetDate.addClass(focusClass).siblings().removeClass(focusClass);
          break;

        case enterKey:
          $focusedDate.click();
          break;
      }
    }

    /**
     * Process the user selected month
     * @param ev {Event}
     */

  }, {
    key: 'selectMonth',
    value: function selectMonth(ev) {
      var $li = $(ev.currentTarget);
      var disabledClass = getClassNameFromSelector(this.cssSelectors.disabled);

      if ($li.hasClass(disabledClass)) {
        return;
      }

      var activeClass = getClassNameFromSelector(this.cssSelectors.active);
      $li.siblings('li').removeClass(activeClass);
      $li.addClass(activeClass);

      this.$dp.trigger(EVENT_DATE_PICKER_MONTH_UPDATE);
    }

    /**
     * Process the user selected date
     * @param ev {Event}
     */

  }, {
    key: 'selectDate',
    value: function selectDate(ev) {
      var $li = $(ev.currentTarget);
      var activeClass = getClassNameFromSelector(this.cssSelectors.active);
      $li.siblings('li').removeClass(activeClass);
      $li.addClass(activeClass);

      // update this.defaults.value
      var year = this.$year.val();
      var month = this.getSelectedMonth();
      var selectedDate = parseInt($li.text());
      this.defaults.value = new Date(year, month, selectedDate);

      // update display
      this.$dpDisplay.val(getFormattedDate(this.defaults.value));

      // update input value
      this.$input.val(getFormattedDate(this.defaults.value));

      // clear the focus class (if used by keyboard navigation)
      var focusClass = getClassNameFromSelector(this.cssSelectors.focus);
      $(this.cssSelectors.dpDate).removeClass(focusClass);

      if (this.defaults.format === DatePicker.FORMAT_DATE) {
        this.hide();
      } else if (this.defaults.format === DatePicker.FORMAT_DATETIME) {
        this.$hour.focus();
      }
    }
  }, {
    key: 'setTimeAndHide',
    value: function setTimeAndHide() {
      var year = this.$year.val();
      var month = this.getSelectedMonth();
      var selectedDate = this.getSelectedDate();
      var hour = parseInt(this.$hour.val());
      var minute = parseInt(this.$minute.val());
      var meridian = this.$meridian.val();

      if (hour === '') {
        this.$hour.focus();
      } else if (minute === '') {
        this.$minute.focus();
      } else if (meridian === '') {
        this.$meridian.focus();
      } else {
        if (meridian === 'pm') {
          hour += 12;
        }

        var dt = new Date(year, month, selectedDate, hour, minute);
        if (isNaN(dt)) {
          console.log('Invalid date: year:' + year + ' month:' + month + ' date:' + selectedDate + ' hour:' + hour + ' minute:' + minute);
          return;
        }
        this.$dpDisplay.val(getFormattedDateTime(dt, true));
        this.$input.val(getFormattedDateTime(dt));
        this.defaults.value = dt;
        this.hide();
      }
    }
  }, {
    key: 'getYearWrapperHtml',
    value: function getYearWrapperHtml() {
      var yearWrapperClass = getClassNameFromSelector(this.cssSelectors.dpYearWrapper);

      var prevYearClass = getClassNameFromSelector(this.cssSelectors.jsPrevYear);
      var yearClass = getClassNameFromSelector(this.cssSelectors.jsYear);
      var nextYearClass = getClassNameFromSelector(this.cssSelectors.jsNextYear);

      return ['<div class="' + yearWrapperClass + '">', '<span class="' + prevYearClass + ' fa fa-caret-left"></span>', '<input type="text" class="' + yearClass + '" value="' + this.defaults.value.getFullYear() + '">', '<span class="' + nextYearClass + ' fa fa-caret-right"></span>', '</div>'].join('');
    }
  }, {
    key: 'getMonthWrapperHtml',
    value: function getMonthWrapperHtml() {
      if (!this.$year) {
        this.$year = this.$dp.find(this.cssSelectors.jsYear);
      }

      var monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      var curDate = new Date(this.$year.val(), 0, 1);
      var isActiveYear = curDate.getFullYear() === this.defaults.value.getFullYear();
      var activeMonth = this.defaults.value.getMonth();

      // all months are enabled
      var enabledMonth = 0;
      if (this.defaults.minDate) {
        if (curDate.getFullYear() < this.defaults.minDate.getFullYear()) {
          // all months are disabled
          enabledMonth = 12;
        } else if (curDate.getFullYear() === this.defaults.minDate.getFullYear()) {
          enabledMonth = this.defaults.minDate.getMonth();
        }
      }

      var monthWrapperClass = getClassNameFromSelector(this.cssSelectors.dpMonthWrapper);
      var monthClass = getClassNameFromSelector(this.cssSelectors.dpMonth);
      var disabledClass = getClassNameFromSelector(this.cssSelectors.disabled);
      var activeClass = getClassNameFromSelector(this.cssSelectors.active);
      var html = ['<ul class="' + monthWrapperClass + '" tabindex="0">'];

      for (var i = 0; i < 12; i++) {
        var classList = [monthClass];

        if (i < enabledMonth) {
          classList.push(disabledClass);
        } else if (isActiveYear && i === activeMonth) {
          classList.push(activeClass);
        }

        var li = ['<li', 'data-month="' + i + '"', 'class="' + classList.join(' ') + '"'];

        li.push('>' + monthLabels[i] + '</li>');

        html.push(li.join(' '));
      }

      html.push('</ul>');

      return html.join('');
    }
  }, {
    key: 'getCalWrapperHtml',
    value: function getCalWrapperHtml() {
      var dpCalWrapper = getClassNameFromSelector(this.cssSelectors.dpCalWrapper);
      var dpWeekWrapper = getClassNameFromSelector(this.cssSelectors.dpWeekWrapper);
      var dpDate = getClassNameFromSelector(this.cssSelectors.dpDate);
      var disabledClass = getClassNameFromSelector(this.cssSelectors.disabled);
      var activeClass = getClassNameFromSelector(this.cssSelectors.active);
      var emptyClass = getClassNameFromSelector(this.cssSelectors.empty);

      var html = ['<div class="' + dpCalWrapper + '" tabindex="0">'];

      var weekDayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      html.push('<ul class="' + dpWeekWrapper + '">');

      for (var i = 0; i < 7; i++) {
        html.push('<li class="' + [dpDate, emptyClass].join(' ') + '">' + weekDayLabels[i] + '</li>');
      }

      html.push('</ul>');

      // draw dates
      html.push('<ul class="' + dpWeekWrapper + '">');

      var selectedYear = this.$year.val();
      var selectedMonth = this.getSelectedMonth();

      if (selectedMonth === -1) {
        return;
      }

      var curDate = new Date(selectedYear, selectedMonth, 1);
      var enabledDate = 1;
      var isActiveYear = curDate.getFullYear() === this.defaults.value.getFullYear();
      var isActiveMonth = curDate.getMonth() === this.defaults.value.getMonth();
      var activeDate = this.defaults.value.getDate();

      if (this.defaults.minDate) {
        if (curDate.getFullYear() < this.defaults.minDate.getFullYear()) {
          // all dates are disabled
          enabledDate = 32;
        } else if (curDate.getFullYear() === this.defaults.minDate.getFullYear()) {
          if (curDate.getMonth() < this.defaults.minDate.getMonth()) {
            enabledDate = 32;
          } else if (curDate.getMonth() === this.defaults.minDate.getMonth()) {
            enabledDate = this.defaults.minDate.getDate();
          }
        }
      }

      // empty dates
      for (var e = 0; e < curDate.getDay(); e++) {
        html.push('<li class="' + [dpDate, emptyClass].join(' ') + '">&nbsp;</li>');
      }

      var maxDate = getDaysInMonth(selectedYear, selectedMonth);

      for (var d = 1; d <= maxDate; d++) {
        var classList = [dpDate];

        if (d < enabledDate) {
          classList.push(disabledClass);
        } else if (isActiveYear && isActiveMonth && d === activeDate) {
          classList.push(activeClass);
        }

        html.push('<li class="' + classList.join(' ') + '">' + d + '</li>');
      }

      html.push('</ul>');
      html.push('</div>');

      return html.join('');
    }
  }, {
    key: 'getTimeWrapperHtml',
    value: function getTimeWrapperHtml() {
      var timeWrapperClassName = getClassNameFromSelector(this.cssSelectors.dpTimeWrapper);
      var hourClassName = getClassNameFromSelector(this.cssSelectors.jsHour);
      var minClassName = getClassNameFromSelector(this.cssSelectors.jsMinute);
      var meridianClassName = getClassNameFromSelector(this.cssSelectors.jsMeridian);

      var hour = '<select class="' + hourClassName + '">\n      <option value="">hh</option>';
      for (var i = 1; i <= 12; i++) {
        i = ('0' + i).slice(-2);
        hour += '<option value="' + i + '">' + i + '</option>';
      }
      hour += '</select>';

      var minOptions = [0, 15, 30, 45];
      var min = '<select class="' + minClassName + '">\n      <option value="">mm</option>';
      for (var j in minOptions) {
        var opt = ('0' + minOptions[j]).slice(-2);
        min += '<option value="' + opt + '">' + opt + '</option>';
      }
      min += '</select>';

      var meridian = '<select class="' + meridianClassName + '">\n      <option value="">----</option>\n      <option value="am">am</option>\n      <option value="pm">pm</option>\n    </select>';

      return '<div class="' + timeWrapperClassName + '">\n      <div>\n        ' + hour + '&nbsp;' + min + '&nbsp;' + meridian + '\n        <button>Go</button>\n      </div>\n    </div>';
    }
  }, {
    key: 'getSelectedMonth',
    value: function getSelectedMonth() {
      var $selectedMonth = this.$dp.find(this.cssSelectors.dpMonth + this.cssSelectors.active);
      var $allMonths = this.$dp.find(this.cssSelectors.dpMonth);
      return $allMonths.index($selectedMonth);
    }
  }, {
    key: 'getSelectedDate',
    value: function getSelectedDate() {
      var $selectedDate = this.$dp.find(this.cssSelectors.dpDate + this.cssSelectors.active);
      return parseInt($selectedDate.text());
    }
  }, {
    key: 'getOverlayHtml',
    value: function getOverlayHtml() {
      var overlayClass = getClassNameFromSelector(this.cssSelectors.dpOverlay);
      return '<div class="' + overlayClass + '"></div>';
    }
  }]);

  return DatePicker;
}();

/**
 * Returns date formatted as Y-m-d with leading zeros
 *
 * @param {Date} dt
 *
 * @returns {String}
 */


function getFormattedDate(dt) {
  'use strict';

  return [dt.getFullYear(), ('0' + (dt.getMonth() + 1)).slice(-2), ('0' + dt.getDate()).slice(-2)].join('-');
}

/**
 * Returns the date formatted as Y-m-d H:i:s with leading zeros.
 * If display is set to true, the format is Y-m-d at h:m a.
 *
 * @param dt {Date}
 * @param display {Boolean}
 */
function getFormattedDateTime(dt) {
  var display = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var time = [('0' + dt.getHours()).slice(-2), ('0' + dt.getMinutes()).slice(-2), ('0' + dt.getSeconds()).slice(-2)].join(':');

  if (display) {
    var hours = dt.getHours();
    var a = 'am';
    if (hours > 12) {
      hours = hours - 12;
      a = 'pm';
    }

    time = [('0' + hours).slice(-2), ('0' + dt.getMinutes()).slice(-2)].join(':');

    time = time + ' ' + a;
  }

  return getFormattedDate(dt) + ' ' + time;
}

/**
 * Returns the number of days in the given month.
 *
 * @param {Number} year
 * @param {Number} month 0-indexed
 *
 * @returns {number}
 */
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Strips the dot in classname selector
 *
 * @param {String} selector
 *
 * @returns {string}
 */
function getClassNameFromSelector(selector) {
  'use strict';

  return selector.replace('.', '');
}

$.fn.datepicker = function () {
  'use strict';

  $(this).each(function () {
    var $input = $(this);
    var datePicker = new DatePicker($input); // eslint-disable-line no-unused-vars
  });
};