const m = require('mithril')
const moment = require('moment')
const { popover } = require('@webantic/util')
require('moment/locale/en-gb')
require('moment/locale/cs.js')
require('moment/locale/es.js')
require('moment/locale/fr.js')
require('moment/locale/nl.js')

class Datepicker {
  constructor (input, config = {}) {
    if (!input) {
      console.warn('you need to pass a DOM node to Datepicker constructor')
      return
    }
    const self = this
    Datepicker.eventName = '@webantic/datepicker/opened'
    Datepicker.openClassName = '-datepicker-open'

    // default config
    self.config = {
      format: 'DD/MM/YYYY',
      locale: 'en-gb',
      position: 'fixed',
      oneOpen: true,
      closeOnSelect: true,
      viewport: document,
      triangle: true
    }
    // update config
    Object.assign(self.config, config)
    moment.locale(self.config.locale)
    self.config.input = input
    self.config.root = self._createRoot(input)
    const initialValue = input._date ? self._cleanDate(input._date) : self._cleanDate(input.value)
    input._date = initialValue.toDate()

    // set up show listener
    input.addEventListener('focus', function renderDatePicker (e) {
      // initial state
      let value = self._cleanDate(e.target.value)
      const squares = self._getPaddedDates(value).length
      e.target._date = value
      let state = {
        current: value,
        value: value,
        squares
      }

      // mount component
      const component = self._initComponent(state)
      m.mount(self.config.root, component)
      self.config.root.dispatchEvent(new CustomEvent(Datepicker.eventName, {
        detail: {
          instance: self
        },
        bubbles: true
      }))
      self.config.input.className += ' ' + Datepicker.openClassName
    })

    if (self.config.oneOpen) {
      window.addEventListener(Datepicker.eventName, function (event) {
        if (event.detail.instance !== self) {
          self.close()
        }
      })
    }
    input.addEventListener('click', self._stopPropagation)
  }

  close () {
    m.mount(this.config.root, null)
    this.config.input.className = (this.config.input.className || '').replace(Datepicker.openClassName, '')
    $(this.config.root).find('.popover-triangle').remove()
  }

  selectDate (vnode, date) {
    const self = this
    return function dateSelectionClickHandler (e) {
      const newValue = moment(vnode.state.current).date(date)
      self.config.input.value = newValue.format(self.config.format)
      vnode.state.value = newValue.toDate()
      self.config.input._date = newValue.toDate()
      if (self.config.closeOnSelect) {
        self.close()
      }
    }
  }

  incrementMonthView (vnode) {
    const self = this

    return function nextMonthClickHandler (e) {
      const currentMonth = moment(vnode.state.current).month()
      const newDate = moment(vnode.state.current).month(currentMonth + 1)
      vnode.state.current = newDate.toDate()
      vnode.state.squares = self._getPaddedDates(newDate).length
      return newDate
    }
  }

  decrementMonthView (vnode) {
    const self = this

    return function prevMonthClickHandler (e) {
      const currentMonth = moment(vnode.state.current).month()
      const newDate = moment(vnode.state.current).month(currentMonth - 1)
      vnode.state.current = newDate.toDate()
      vnode.state.squares = self._getPaddedDates(newDate).length
      return newDate
    }
  }

  hide (self, listener) {
    return function hideClickHandler (e) {
      self.close()
      document.removeEventListener('click', listener)
    }
  }

  _renderDayHeadings (vnode) {
    const days = (function addDay (i = 0, values = []) {
      if (i <= 6) {
        values.push(moment().weekday(i).format('dd')[0])
        return addDay.call(this, i + 1, values)
      } else {
        return values
      }
    })()
    return days.map(function templatifyDays (date) {
      return m('div', {class: 'dayHeading'}, date)
    })
  }

  _getDates (current) {
    const daysToRender = moment(current).daysInMonth()

    return (function addDate (i, total, values = []) {
      if (i <= total) {
        values.push(i)
        return addDate.call(this, i + 1, total, values)
      } else {
        return values
      }
    })(1, daysToRender)
  }

  _getPaddedDates (current) {
    const self = this
    const dates = self._getDates(current)

    return (function padDate (i, ii, values = dates) {
      if (i > 0) {
        values.unshift(null)
        return padDate.call(this, i - 1, ii, values)
      } else if (ii < 6) {
        values.push(null)
        return padDate.call(this, i, ii + 1, values)
      } else {
        return values
      }
    })(moment(current).date(dates[0]).weekday(), moment(current).date(dates[dates.length - 1]).weekday())
  }

  _renderDates (vnode) {
    const self = this

    const paddedDates = self._getPaddedDates(vnode.state.current)

    return paddedDates.map(function templatifyDates (date) {
      const empty = function isEmpty () {
        return date ? '' : '-empty'
      }
      const active = function isActive () {
        return parseInt(moment(vnode.state.value).format('DDMMYYYY')) === parseInt(moment(vnode.state.current).date(parseInt(date)).format('DDMMYYYY')) ? '-active' : ''
      }
      let props = {
        class: `date ${empty()} ${active()}`
      }
      if (date) {
        props.onclick = self.selectDate(vnode, parseInt(date))
      }
      return m('div', props, date)
    })
  }

  _isDate (date) {
    return !isNaN(new Date(date).getTime())
  }
  _cleanDate (date) {
    const self = this
    const momented = moment(date, self.config.format, true)
    if (momented.isValid()) {
      return momented
    }
    return moment(new Date(), self.config.format, true)
  }
  _createRoot (input) {
    const root = document.createElement('div')
    input.parentNode.insertBefore(root, input)
    return root
  }
  _stopPropagation (e) {
    e.stopPropagation()
  }

  _registerScrollVanish (e) {
    const self = this

    const viewport = self.config.viewport === document ? document : document.querySelector(self.config.viewport)

    const hideOnScroll = function (e) {
      self.close()
      self.config.input.blur()
      viewport.removeEventListener('scroll', hideOnScroll, false)
    }
    viewport.addEventListener('scroll', hideOnScroll)
  }

  _positionFixedly (vnode) {
    const self = this

    const datePickerElement = vnode.dom
    const inputElement = self.config.input
    const options = {
      triangle: self.config.triangle,
      positionVariantSelector: '.month-picker',
      where: ['top', 'bottom']
    }

    return popover.positionFixed(datePickerElement, inputElement, options)
  }

  _positionAbsolutely (vnode) {
    const self = this
    // just in case there's no parent with a non-static position
    document.body.style.position = 'relative'

    const inputPosition = {
      top: self.config.input.offsetTop + self.config.input.offsetHeight,
      left: self.config.input.offsetLeft,
      right: self.config.input.offsetParent.clientWidth - (self.config.input.offsetLeft + self.config.input.offsetWidth),
      bottom: self.config.input.offsetParent.clientHeight - self.config.input.offsetTop
    }
    if (inputPosition.left < self.config.input.clientWidth) {
      vnode.dom.style.left = inputPosition.left + 'px'
    } else {
      vnode.dom.style.right = inputPosition.right + 'px'
    }

    if (self.config.input.getBoundingClientRect().bottom > (window.innerHeight * 0.75)) {
      vnode.dom.style.bottom = inputPosition.bottom + 'px'
    } else {
      vnode.dom.style.top = inputPosition.top + 'px'
    }
  }

  _initComponent (state) {
    const self = this
    return {
      state,
      oninit (vnode) {
        vnode.state.current = state.current
        vnode.state.value = state.value
        vnode.state.squares = state.value
      },
      oncreate (vnode) {
        vnode.dom.style.position = self.config.position

        if (self.config.position === 'fixed') {
          self._registerScrollVanish()
          vnode.state.position = self._positionFixedly(vnode).positioned || self.config.position
          vnode.state.squareHeight = vnode.dom.querySelector('.date:not(.-empty)').clientHeight

          m.redraw()
        } else {
          self._positionAbsolutely(vnode)
        }

        const hide = document.addEventListener('click', self.hide(self, hide))
      },

      view (vnode) {
        const hide = function () {
          self.close()
        }

        let style = {}
        const { squares, squareHeight, position } = vnode.state
        if (squareHeight && squares && (squares <= 35)) {
          style[`margin-${position}`] = squares <= 28 ? (squareHeight * 2) + 'px' : squareHeight + 'px'
        }

        function monthBarWithPositionClass (positionClass) {
          return m('div', {class: `month-picker ${positionClass}`}, [
            m('span', {class: 'prev', onclick: self.decrementMonthView(vnode)}, '<'),
            m('span', {class: 'next', onclick: self.incrementMonthView(vnode)}, '>'),
            m('h2', {class: 'currentMonth'}, moment(vnode.state.current).format('MMMM YYYY'))
          ])
        }

        return m('div', {class: 'date-picker', style, onclick: self._stopPropagation}, [
          monthBarWithPositionClass('-top'),
          m('div', {class: 'dates-display'}, self._renderDayHeadings(vnode).concat(self._renderDates(vnode))),
          self.config.closeOnSelect ? null : m('div', {class: 'button', onclick: hide}, self.config.confirmText || 'Confirm'),
          monthBarWithPositionClass('-bottom')
        ])
      }
    }
  }
}

module.exports = Datepicker
