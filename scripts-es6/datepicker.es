var EVENT_DATE_PICKER_YEAR_UPDATE = 'date-picker:year-update'
var EVENT_DATE_PICKER_MONTH_UPDATE = 'date-picker:month-update'
var EVENT_DATE_PICKER_FORCE_EDIT = 'date-picker:force-edit'
var EVENT_DATE_PICKER_ENTER = 'date-picker:enter'
var EVENT_DATE_PICKER_EXIT = 'date-picker:exit'

/* eslint-env jquery */

/**
 * Date-picker
 *
 * @author Magesh Ravi
 * @version 0.1.4beta
 */
class DatePicker {

  static get FORMAT_DATE () { return 'date' }
  static get FORMAT_DATETIME () { return 'datetime' }

  /**
   * Creates a DatePicker instance
   * @param $input {jQuery}
   */
  constructor ($input) {
    this.defaults = {}

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
      dpSelectMenuLabel: '.c-date-picker__select-label',
      dpSelectMenu: '.c-date-picker__select',
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
    }

    this.$input = $input

    this.parseInputAttrs()

    this.setup()

    this.bindUIActions()
  }

  /**
   * Parse data attrs specified on the input tag
   */
  parseInputAttrs () {
    let minDateStr = this.$input.data('min-date')
    let minDate = parseDateFromString(minDateStr)

    if (!isNaN(minDate)) {
      this.defaults.minDate = minDate
    }

    let maxDateStr = this.$input.data('max-date')
    if (maxDateStr) {
      let maxDate = parseDateFromString(maxDateStr)
      this.defaults.maxDate = (isNaN(maxDate)) ? null : maxDate
    }

    if (this.defaults.minDate && this.defaults.maxDate && this.defaults.minDate > this.defaults.maxDate) {
      console.log(this.$input.get(0))
      throw Error('min-date is greater than max-date')
    }

    let formatStr = this.$input.data('format')
    if (!formatStr) {
      formatStr = DatePicker.FORMAT_DATE
    }

    let allowedFormats = [
      DatePicker.FORMAT_DATE,
      DatePicker.FORMAT_DATETIME
    ]

    if (allowedFormats.indexOf(formatStr) !== -1) {
      this.defaults.format = formatStr
    }

    let valueStr = this.$input.val()
    let value = parseDateFromString(valueStr)

    if (isNaN(value)) {
      value = parseDateFromString('today')
      let formattedValue = (this.defaults.format === DatePicker.FORMAT_DATETIME) ? getFormattedDateTime(value) : getFormattedDate(value)
      this.$input.val(formattedValue)
    }

    this.defaults.value = value

    /**
     * Parses date from the given string
     * @param dateStr {String}
     */
    function parseDateFromString (dateStr) {
      let today = new Date()
      let tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      let yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)

      switch (dateStr) {
        case 'yesterday':
          return yesterday

        case 'today':
          return today

        case 'tomorrow':
          return tomorrow

        default:
          return new Date(dateStr)
      }
    }
  }

  setup () {
    let dpClass = getClassNameFromSelector(this.cssSelectors.dp)
    let dpDisplayClass = getClassNameFromSelector(this.cssSelectors.dpDisplay)
    let dpDropDown = getClassNameFromSelector(this.cssSelectors.dpDropDown)

        // draw date-picker
    this.$dp = $('<div class="' + dpClass + '"></div>')
    this.$dp.insertAfter(this.$input)

    this.$dpDisplay = $('<input type="text" class="' + dpDisplayClass + '" readonly>')
    var displayValue = getFormattedDate(this.defaults.value)
    if (this.defaults.format === DatePicker.FORMAT_DATETIME) {
      displayValue = getFormattedDateTime(this.defaults.value, true)
    }
    this.$dpDisplay.val(displayValue)
    this.$dp.append(this.$dpDisplay)

    var $dpDropDown = $('<div class="' + dpDropDown + '"></div>')
    this.$dp.append($dpDropDown)

    this.$dpYearWrapper = $(this.getYearWrapperHtml())
    $dpDropDown.append(this.$dpYearWrapper)

    this.$dpMonthWrapper = $(this.getMonthWrapperHtml())
    $dpDropDown.append(this.$dpMonthWrapper)

    this.$dpCalWrapper = $(this.getCalWrapperHtml())
    $dpDropDown.append(this.$dpCalWrapper)

    if (this.defaults.format === DatePicker.FORMAT_DATETIME) {
      this.$dpTimeWrapper = $(this.getTimeWrapperHtml())
      $dpDropDown.append(this.$dpTimeWrapper)
    }

    this.$input.attr('type', 'hidden')
    this.$dp.append(this.$input)

    this.$dpOverlay = $(this.getOverlayHtml())
    this.$dp.append(this.$dpOverlay)

    // init references
    this.$year = this.$dp.find(this.cssSelectors.jsYear)
    this.$hour = this.$dp.find(this.cssSelectors.jsHour)
    this.$minute = this.$dp.find(this.cssSelectors.jsMinute)
    this.$meridian = this.$dp.find(this.cssSelectors.jsMeridian)
  }

  bindUIActions () {
    this.$dp.on('focus', this.show.bind(this))
    this.$dpDisplay.on('focus', this.show.bind(this))
    this.$dpOverlay.on('click', this.hide.bind(this))

    // decrement year
    this.$dp.on('click', this.cssSelectors.jsPrevYear, function () {
      'use strict'
      this.$year.val(parseInt(this.$year.val()) - 1)
      this.$dp.trigger(EVENT_DATE_PICKER_YEAR_UPDATE)
    }.bind(this))

    // increment year
    this.$dp.on('click', this.cssSelectors.jsNextYear, function () {
      'use strict'
      this.$year.val(parseInt(this.$year.val()) + 1)
      this.$dp.trigger(EVENT_DATE_PICKER_YEAR_UPDATE)
    }.bind(this))

    this.$year.on('change', function (ev) {
      this.updateMonth()
    }.bind(this))

    let disabledClass = getClassNameFromSelector(this.cssSelectors.disabled)

    this.$year.on('keypress', function (ev) {
      // when enter key is pressed, prevent any surrounding form from being submitted
      if (ev.keyCode === 13) {
        ev.preventDefault()
      }
    })

    this.$year.on('keyup', function (ev) {
      if (ev.keyCode !== 13) {
        this.$dpMonthWrapper.addClass(disabledClass)
        this.$dpCalWrapper.addClass(disabledClass)
        return
      }

      this.$dpMonthWrapper.removeClass(disabledClass)
      this.$dpCalWrapper.removeClass(disabledClass)

      this.$dpMonthWrapper.focus()
      this.navigateMonthsWithKeys()
    }.bind(this))

    this.$year.on('blur', function (ev) {
      this.$dpMonthWrapper.focus()
    }.bind(this))

    this.$dp.on(EVENT_DATE_PICKER_YEAR_UPDATE, this.updateMonth.bind(this))
    this.$dp.on(EVENT_DATE_PICKER_MONTH_UPDATE, this.updateCal.bind(this))

    this.$dp.on('keyup', this.cssSelectors.dpMonthWrapper, this.navigateMonthsWithKeys.bind(this))

    this.$dp.on('click', this.cssSelectors.dpMonth, this.selectMonth.bind(this))

    this.$dp.on('keyup', this.cssSelectors.dpCalWrapper, this.navigateDateWithKeys.bind(this))

    this.$dp.on('click', this.cssSelectors.dpDate, this.selectDate.bind(this))
    this.$dp.on(EVENT_DATE_PICKER_FORCE_EDIT, this.forceEditHandler.bind(this))

    this.$dp.on('click', this.cssSelectors.dpTimeWrapper + ' button', this.setTimeAndHide.bind(this))

    // listen to other datepicker instances
    $('body').on(EVENT_DATE_PICKER_ENTER, function (ev) {
      if (ev.target !== this.$dp.get(0)) {
        // some other datepicker in the same page entered drop-down state
        this.$dp.removeAttr('tabindex')
        this.$dpDisplay.attr('disabled', true)
      }
    }.bind(this))

    $('body').on(EVENT_DATE_PICKER_EXIT, function (ev) {
      if (ev.target !== this.$dp.get(0)) {
        // some other datepicker in the same page exited drop-down state
        this.$dp.attr('tabindex', '0')
        this.$dpDisplay.removeAttr('disabled')
      }
    }.bind(this))
  }

  show () {
    this.reset()
    this.$dp.addClass(getClassNameFromSelector(this.cssSelectors.dpFocused))

    $('html,body').css({'overflow': 'hidden'})
    this.$dp.trigger(EVENT_DATE_PICKER_ENTER)
  }

  hide () {
    this.$dp.removeClass(getClassNameFromSelector(this.cssSelectors.dpFocused))

    $('html,body').css({'overflow': 'auto'})
    this.$dp.trigger(EVENT_DATE_PICKER_EXIT)
    this.$dp.blur() // to avoid looping on the same instance when navigating with keyboard
  }

  forceEditHandler () {
    this.show()
    this.$dp.focus()
  }

  reset () {
        // update year
    this.$year.val(this.defaults.value.getFullYear())

        // update month-wrapper
    this.$dpMonthWrapper.remove()
    this.$dpMonthWrapper = $(this.getMonthWrapperHtml())
    this.$dpMonthWrapper.insertAfter(this.$dpYearWrapper)

        // update cal-wrapper
    this.$dpCalWrapper.remove()
    this.$dpCalWrapper = $(this.getCalWrapperHtml())
    this.$dpCalWrapper.insertAfter(this.$dpMonthWrapper)
  }

  updateMonth () {
    let $oldMonthWrapper = this.$dpMonthWrapper
    this.$dpMonthWrapper = $(this.getMonthWrapperHtml())
    $oldMonthWrapper.replaceWith(this.$dpMonthWrapper)

    this.$dp.trigger(EVENT_DATE_PICKER_MONTH_UPDATE)
  }

  updateCal () {
    this.$dpCalWrapper.remove()
    this.$dpCalWrapper = $(this.getCalWrapperHtml())
    this.$dpCalWrapper.insertAfter(this.$dpMonthWrapper)
  }

  /**
   * Navigate months with arrow keys
   * @param ev {Event}
   */
  navigateMonthsWithKeys (ev) {
    let leftKey = 37
    let upKey = 38
    let rightKey = 39
    let downKey = 40
    let enterKey = 13

    let focusClass = getClassNameFromSelector(this.cssSelectors.focus)
    let disabledClass = getClassNameFromSelector(this.cssSelectors.disabled)

    if (this.$dpMonthWrapper.hasClass(disabledClass)) {
      return
    }

    // check for focused month
    let $focusedMonth = this.$dp.find(this.cssSelectors.dpMonth + this.cssSelectors.focus)
    if (!$focusedMonth.length) {
      // check for active month
      $focusedMonth = this.$dp.find(this.cssSelectors.dpMonth + this.cssSelectors.active)
      $focusedMonth.addClass(focusClass)
    }
    if (!$focusedMonth.length) {
      // get this first non-disabled month
      $focusedMonth = this.$dp.find(this.cssSelectors.dpMonth + ':not(' + this.cssSelectors.disabled + ')').first()
      $focusedMonth.addClass(focusClass)
    }

    if (!ev) {
      return
    }

    let $targetMonth

    switch (ev.keyCode) {
      case leftKey:
        $targetMonth = $focusedMonth.prev()

        if (!$targetMonth.length) {
          // prev item does not exist. go to last item.
          $targetMonth = $focusedMonth.siblings(':last')
        }

        if ($targetMonth.hasClass(disabledClass)) {
          // item disabled. go to last item that is NOT disabled.
          $targetMonth = $focusedMonth.siblings(':not(' + this.cssSelectors.disabled + ')').last()
        }

        $targetMonth.addClass(focusClass)
            .siblings().removeClass(focusClass)
        break

      case rightKey:
        $targetMonth = $focusedMonth.next()

        if (!$targetMonth.length) {
          // next item does not exist. go to first item.
          $targetMonth = $focusedMonth.siblings(':first')
        }

        if ($targetMonth.hasClass(disabledClass)) {
          // item disabled. go to first item that is NOT disabled.
          $targetMonth = $focusedMonth.siblings(':not(' + this.cssSelectors.disabled + ')').first()
        }

        $targetMonth.addClass(focusClass)
          .siblings().removeClass(focusClass)
        break

      case upKey:
      case downKey:
        let $months = this.$dp.find(this.cssSelectors.dpMonth)
        let idx = $months.index($focusedMonth)

        if (idx < 6) {
          $targetMonth = $months.eq(idx + 6)
        } else {
          $targetMonth = $months.eq(idx - 6)
        }

        if (!$targetMonth.hasClass(disabledClass)) {
          $targetMonth.addClass(focusClass)
            .siblings().removeClass(focusClass)
        }
        break

      case enterKey:
        $focusedMonth.click()
        this.$dpCalWrapper.focus()
        this.navigateDateWithKeys()
    }
  }

  /**
   * Navigate date with arrow keys
   * @param ev {Event}
   */
  navigateDateWithKeys (ev) {
    let leftKey = 37
    let upKey = 38
    let rightKey = 39
    let downKey = 40
    let enterKey = 13

    let $dates = this.$dp.find(this.cssSelectors.dpDate).filter(':not(' + this.cssSelectors.empty + ')')
    let focusClass = getClassNameFromSelector(this.cssSelectors.focus)
    let disabledClass = getClassNameFromSelector(this.cssSelectors.disabled)

    if (this.$dpCalWrapper.hasClass(disabledClass)) {
      return
    }

    let $focusedDate = $dates.filter(this.cssSelectors.focus)
    if (!$focusedDate.length) {
      $focusedDate = $dates.filter(':not(' + this.cssSelectors.disabled + ')').first()
      $focusedDate.addClass(focusClass)
    }

    if (!ev) {
      return
    }

    let idx = $dates.index($focusedDate)
    let $targetDate

    switch (ev.keyCode) {
      case leftKey:
        if (idx === 0) {
          $targetDate = $dates.filter(':not(' + this.cssSelectors.disabled + ')').last()
        } else {
          $targetDate = $dates.eq(idx - 1)
        }

        if ($targetDate.hasClass(disabledClass)) {
          $targetDate = $dates.filter(':not(' + this.cssSelectors.disabled + ')').last()
        }

        $targetDate.addClass(focusClass)
          .siblings().removeClass(focusClass)
        break

      case rightKey:
        if (idx === $dates.length - 1) {
          $targetDate = $dates.filter(':not(' + this.cssSelectors.disabled + ')').first()
        } else {
          $targetDate = $dates.eq(idx + 1)
        }

        if ($targetDate.hasClass(disabledClass)) {
          $targetDate = $dates.filter(':not(' + this.cssSelectors.disabled + ')').first()
        }

        $targetDate.addClass(focusClass)
          .siblings().removeClass(focusClass)
        break

      case upKey:
        if (idx <= 6) {
          return
        }

        $targetDate = $dates.eq(idx - 7)

        if (!$targetDate.length) {
          return
        }

        if ($targetDate.hasClass(disabledClass)) {
          return
        }

        $targetDate.addClass(focusClass)
            .siblings().removeClass(focusClass)
        break

      case downKey:
        if (idx >= $dates.length - 7) {
          return
        }

        $targetDate = $dates.eq(idx + 7)

        if (!$targetDate.length) {
          return
        }

        if ($targetDate.hasClass(disabledClass)) {
          return
        }

        $targetDate.addClass(focusClass)
            .siblings().removeClass(focusClass)
        break

      case enterKey:
        $focusedDate.click()
        break
    }
  }

  /**
   * Process the user selected month
   * @param ev {Event}
   */
  selectMonth (ev) {
    let $li = $(ev.currentTarget)
    let disabledClass = getClassNameFromSelector(this.cssSelectors.disabled)

    if ($li.hasClass(disabledClass)) {
      return
    }

    let activeClass = getClassNameFromSelector(this.cssSelectors.active)
    $li.siblings('li').removeClass(activeClass)
    $li.addClass(activeClass)

    this.$dp.trigger(EVENT_DATE_PICKER_MONTH_UPDATE)
  }

  /**
   * Process the user selected date
   * @param ev {Event}
   */
  selectDate (ev) {
    let $li = $(ev.currentTarget)
    let disabledClass = getClassNameFromSelector(this.cssSelectors.disabled)
    let emptyClass = getClassNameFromSelector(this.cssSelectors.empty)
    if ($li.hasClass(disabledClass) || $li.hasClass(emptyClass)) {
      return
    }

    let activeClass = getClassNameFromSelector(this.cssSelectors.active)
    $li.siblings('li').removeClass(activeClass)
    $li.addClass(activeClass)

    // update this.defaults.value
    let year = this.$year.val()
    let month = this.getSelectedMonth()
    let selectedDate = parseInt($li.text())
    this.defaults.value = new Date(year, month, selectedDate)

    // update display
    this.$dpDisplay.val(getFormattedDate(this.defaults.value))

    // update input value
    this.$input.val(getFormattedDate(this.defaults.value))

    // clear the focus class (if used by keyboard navigation)
    var focusClass = getClassNameFromSelector(this.cssSelectors.focus)
    $(this.cssSelectors.dpDate).removeClass(focusClass)

    if (this.defaults.format === DatePicker.FORMAT_DATE) {
      this.hide()
    } else if (this.defaults.format === DatePicker.FORMAT_DATETIME) {
      this.$hour.focus()
    }
  }

  setTimeAndHide () {
    let year = this.$year.val()
    let month = this.getSelectedMonth()
    let selectedDate = this.getSelectedDate()
    let hour = parseInt(this.$hour.val())
    let minute = parseInt(this.$minute.val())
    let meridian = this.$meridian.val()

    if (hour === '') {
      this.$hour.focus()
    } else if (minute === '') {
      this.$minute.focus()
    } else if (meridian === '') {
      this.$meridian.focus()
    } else {
      if (meridian === 'pm') {
        hour += 12
      }

      let dt = new Date(year, month, selectedDate, hour, minute)
      if (isNaN(dt)) {
        console.log(`Invalid date: year:${year} month:${month} date:${selectedDate} hour:${hour} minute:${minute}`)
        return
      }
      this.$dpDisplay.val(getFormattedDateTime(dt, true))
      this.$input.val(getFormattedDateTime(dt))
      this.defaults.value = dt
      this.hide()
    }
  }

  getYearWrapperHtml () {
    let yearWrapperClass = getClassNameFromSelector(this.cssSelectors.dpYearWrapper)

    let prevYearClass = getClassNameFromSelector(this.cssSelectors.jsPrevYear)
    let yearClass = getClassNameFromSelector(this.cssSelectors.jsYear)
    let nextYearClass = getClassNameFromSelector(this.cssSelectors.jsNextYear)

    return [
      '<div class="' + yearWrapperClass + '">',
      '<span class="' + prevYearClass + ' fa fa-caret-left"></span>',
      '<input type="text" class="' + yearClass + '" value="' + this.defaults.value.getFullYear() + '">',
      '<span class="' + nextYearClass + ' fa fa-caret-right"></span>',
      '</div>'
    ].join('')
  }

  getMonthWrapperHtml () {
    if (!this.$year) {
      this.$year = this.$dp.find(this.cssSelectors.jsYear)
    }

    let monthLabels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    let curDate = new Date(this.$year.val(), 0, 1)
    let isActiveYear = (curDate.getFullYear() === this.defaults.value.getFullYear())
    let activeMonth = this.defaults.value.getMonth()

    // all months are enabled
    let enabledMonth = 0
    if (this.defaults.minDate) {
      if (curDate.getFullYear() < this.defaults.minDate.getFullYear()) {
        // all months are disabled
        enabledMonth = 12
      } else if (curDate.getFullYear() === this.defaults.minDate.getFullYear()) {
        enabledMonth = this.defaults.minDate.getMonth()
      }
    }

    // no months are disabled
    let disabledMonth = 12
    if (this.defaults.maxDate) {
      if (curDate.getFullYear() > this.defaults.maxDate.getFullYear()) {
        // all months are disabled
        disabledMonth = -1
      } else if (curDate.getFullYear() === this.defaults.maxDate.getFullYear()) {
        disabledMonth = this.defaults.maxDate.getMonth()
      }
    }

    let monthWrapperClass = getClassNameFromSelector(this.cssSelectors.dpMonthWrapper)
    let monthClass = getClassNameFromSelector(this.cssSelectors.dpMonth)
    let disabledClass = getClassNameFromSelector(this.cssSelectors.disabled)
    let activeClass = getClassNameFromSelector(this.cssSelectors.active)
    let html = ['<ul class="' + monthWrapperClass + '" tabindex="0">']

    for (let i = 0; i < 12; i++) {
      let classList = [monthClass]

      if (i < enabledMonth || i > disabledMonth) {
        classList.push(disabledClass)
      } else if (isActiveYear && i === activeMonth) {
        classList.push(activeClass)
      }

      let li = [
        '<li',
        'data-month="' + i + '"',
        'class="' + classList.join(' ') + '"'
      ]

      li.push('>' + monthLabels[i] + '</li>')

      html.push(li.join(' '))
    }

    html.push('</ul>')

    return html.join('')
  }

  getCalWrapperHtml () {
    let dpCalWrapper = getClassNameFromSelector(this.cssSelectors.dpCalWrapper)
    let dpWeekWrapper = getClassNameFromSelector(this.cssSelectors.dpWeekWrapper)
    let dpDate = getClassNameFromSelector(this.cssSelectors.dpDate)
    let disabledClass = getClassNameFromSelector(this.cssSelectors.disabled)
    let activeClass = getClassNameFromSelector(this.cssSelectors.active)
    let emptyClass = getClassNameFromSelector(this.cssSelectors.empty)

    let html = [
      '<div class="' + dpCalWrapper + '" tabindex="0">'
    ]

    let weekDayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    html.push('<ul class="' + dpWeekWrapper + '">')

    for (let i = 0; i < 7; i++) {
      html.push(
                '<li class="' + [dpDate, emptyClass].join(' ') + '">' + weekDayLabels[i] + '</li>'
            )
    }

    html.push('</ul>')

    // draw dates
    html.push('<ul class="' + dpWeekWrapper + '">')

    let selectedYear = this.$year.val()
    let selectedMonth = this.getSelectedMonth()

    if (selectedMonth === -1) {
      return
    }

    let curDate = new Date(selectedYear, selectedMonth, 1)
    let enabledDate = 1
    let disabledDate = 32
    let isActiveYear = (curDate.getFullYear() === this.defaults.value.getFullYear())
    let isActiveMonth = (curDate.getMonth() === this.defaults.value.getMonth())
    let activeDate = this.defaults.value.getDate()

    if (this.defaults.minDate) {
      if (curDate.getFullYear() < this.defaults.minDate.getFullYear()) {
        // all dates are disabled
        enabledDate = 32
      } else if (curDate.getFullYear() === this.defaults.minDate.getFullYear()) {
        if (curDate.getMonth() < this.defaults.minDate.getMonth()) {
          enabledDate = 32
        } else if (curDate.getMonth() === this.defaults.minDate.getMonth()) {
          enabledDate = this.defaults.minDate.getDate()
        }
      }
    }

    if (this.defaults.maxDate) {
      if (curDate.getFullYear() > this.defaults.maxDate.getFullYear()) {
        // all dates are disabled
        disabledDate = 0
      } else if (curDate.getFullYear() === this.defaults.maxDate.getFullYear()) {
        if (curDate.getMonth() > this.defaults.maxDate.getMonth()) {
          disabledDate = 0
        } else if (curDate.getMonth() === this.defaults.maxDate.getMonth()) {
          disabledDate = this.defaults.maxDate.getDate()
        }
      }
    }

    // empty dates
    for (let e = 0; e < curDate.getDay(); e++) {
      html.push('<li class="' + [dpDate, emptyClass].join(' ') + '">&nbsp;</li>')
    }

    let maxDate = getDaysInMonth(selectedYear, selectedMonth)

    for (let d = 1; d <= maxDate; d++) {
      let classList = [dpDate]

      if (d < enabledDate || d > disabledDate) {
        classList.push(disabledClass)
      } else if (isActiveYear && isActiveMonth && d === activeDate) {
        classList.push(activeClass)
      }

      html.push('<li class="' + classList.join(' ') + '">' + d + '</li>')
    }

    html.push('</ul>')
    html.push('</div>')

    return html.join('')
  }

  getTimeWrapperHtml () {
    let timeWrapperClassName = getClassNameFromSelector(this.cssSelectors.dpTimeWrapper)
    let selectLabelClassName = getClassNameFromSelector(this.cssSelectors.dpSelectMenuLabel)
    let selectMenuClassName = getClassNameFromSelector(this.cssSelectors.dpSelectMenu)
    let hourClassName = getClassNameFromSelector(this.cssSelectors.jsHour)
    let minClassName = getClassNameFromSelector(this.cssSelectors.jsMinute)
    let meridianClassName = getClassNameFromSelector(this.cssSelectors.jsMeridian)

    let selected = ''
    let hourNow = this.defaults.value.getHours()
    let minNow = this.defaults.value.getMinutes()

    let hour = `<label class="${selectLabelClassName}">
    <select class="${selectMenuClassName} ${hourClassName}">
        <option value="">hh</option>`
    for (let i = 0; i <= 12; i++) {
      selected = ''
      if (hourNow === i || hourNow % 12 === i) {
        selected = ' selected '
      }
      i = ('0' + i).slice(-2)
      hour += `<option value="${i}" ${selected}>${i}</option>`
    }
    hour += `</select></label>`

    let minOptions = [0, 15, 30, 45]
    let min = `<label class="${selectLabelClassName}">
    <select class="${selectMenuClassName} ${minClassName}">
      <option value="">mm</option>`
    for (let j in minOptions) {
      selected = ''
      let k = parseInt(j) + 1
      if (minNow >= minOptions[j] && minNow < minOptions[k]) {
        selected = ' selected '
      }
      let opt = ('0' + minOptions[j]).slice(-2)
      min += `<option value="${opt}" ${selected}>${opt}</option>`
    }
    min += '</select></label>'

    let amSelected = ''
    let pmSelected = ''
    if (hourNow < 12) {
      amSelected = ' selected '
    } else {
      pmSelected = ' selected '
    }

    let meridian = `<label class="${selectLabelClassName}">
    <select class="${selectMenuClassName} ${meridianClassName}">
      <option value="">----</option>
      <option value="am" ${amSelected}>am</option>
      <option value="pm" ${pmSelected}>pm</option>
    </select></label>`

    return `<div class="${timeWrapperClassName}">
      <div>
        ${hour}&nbsp;${min}&nbsp;${meridian}
        <button type="button">Go</button>
      </div>
    </div>`
  }

  getSelectedMonth () {
    let $selectedMonth = this.$dp.find(this.cssSelectors.dpMonth + this.cssSelectors.active)
    let $allMonths = this.$dp.find(this.cssSelectors.dpMonth)
    return $allMonths.index($selectedMonth)
  }

  getSelectedDate () {
    let $selectedDate = this.$dp.find(this.cssSelectors.dpDate + this.cssSelectors.active)
    return parseInt($selectedDate.text())
  }

  getOverlayHtml () {
    let overlayClass = getClassNameFromSelector(this.cssSelectors.dpOverlay)
    return '<div class="' + overlayClass + '"></div>'
  }
}

/**
 * Returns date formatted as Y-m-d with leading zeros
 *
 * @param {Date} dt
 *
 * @returns {String}
 */
function getFormattedDate (dt) {
  'use strict'
  return [
    dt.getFullYear(),
    ('0' + (dt.getMonth() + 1)).slice(-2),
    ('0' + dt.getDate()).slice(-2)
  ].join('-')
}

/**
 * Returns the date formatted as Y-m-d H:i:s with leading zeros.
 * If display is set to true, the format is Y-m-d at h:m a.
 *
 * @param dt {Date}
 * @param display {Boolean}
 */
function getFormattedDateTime (dt, display = false) {
  let time = [
    ('0' + dt.getHours()).slice(-2),
    ('0' + dt.getMinutes()).slice(-2),
    ('0' + dt.getSeconds()).slice(-2)
  ].join(':')

  if (display) {
    let hours = dt.getHours()
    if (hours > 12) {
      hours = hours % 12
    }

    let a = 'am'
    if (dt.getHours() >= 12) {
      a = 'pm'
    }

    time = [
      ('0' + hours).slice(-2),
      ('0' + dt.getMinutes()).slice(-2)
    ].join(':')

    time = `${time} ${a}`
  }

  return `${getFormattedDate(dt)} ${time}`
}

/**
 * Returns the number of days in the given month.
 *
 * @param {Number} year
 * @param {Number} month 0-indexed
 *
 * @returns {number}
 */
function getDaysInMonth (year, month) {
  return new Date(year, (month + 1), 0).getDate()
}

/**
 * Strips the dot in classname selector
 *
 * @param {String} selector
 *
 * @returns {string}
 */
function getClassNameFromSelector (selector) {
  'use strict'
  return selector.replace('.', '')
}

$.fn.datepicker = function () {
  'use strict'
  $(this).each(function () {
    let $input = $(this)
    let datePicker = new DatePicker($input) // eslint-disable-line no-unused-vars
  })
}
