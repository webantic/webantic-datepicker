const m = require('mithril')
const moment = require('moment')
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

    // default config
    self.config = {
      format: 'DD/MM/YYYY',
      locale: 'en-gb',
      position: 'fixed'
    }
    // update config
    Object.assign(self.config, config)
    moment.locale(self.config.locale)
    self.config.input = input
    self.config.root = self._createRoot(input)

    // set up show listener
    input.addEventListener('focus', function renderDatePicker (e) {
      // initial state
      let value = e.target._date ? self._cleanDate(e.target._date) : self._cleanDate(e.target.value)
      let state = {
        current: value,
        value: value

      }
      // mount component
      const component = self._initComponent(state)
      m.mount(self.config.root, component)
    })
    input.addEventListener('click', self._stopPropagation)
  }

  selectDate (vnode, date) {
    const self = this
    return function dateSelectionClickHandler (e) {
      const newValue = moment(vnode.state.current).date(date)
      self.config.input.value = newValue.format(self.config.format)
      vnode.state.value = newValue.toDate()
      self.config.input._date = newValue.toDate()
    }
  }

  incrementMonthView (vnode) {
    return function nextMonthClickHandler (e) {
      const currentMonth = moment(vnode.state.current).month()
      const newDate = moment(vnode.state.current).month(currentMonth + 1)
      vnode.state.current = newDate.toDate()
      return newDate
    }
  }

  decrementMonthView (vnode) {
    return function prevMonthClickHandler (e) {
      const currentMonth = moment(vnode.state.current).month()
      const newDate = moment(vnode.state.current).month(currentMonth - 1)
      vnode.state.current = newDate.toDate()
      return newDate
    }
  }

  hide (self, listener) {
    return function hideClickHandler (e) {
      m.mount(self.config.root, null)
      document.removeEventListener('click', listener)
    }
  }

  _renderDayHeadings (vnode) {
    const self = this
    const days = (function addDay (i = 0 , values = []) {
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

  _renderDates (vnode) {
    const self = this
    const daysToRender = moment(vnode.state.current).daysInMonth()
    const dates = (function addDate (i, total, values = []) {
      if (i <= total) {
        values.push(i)
        return addDate.call(this, i + 1, total, values)
      } else {
        return values
      }
    })(1, daysToRender)

    const paddedDates = (function padDate (i, ii, values = dates) {
      if (i > 0) {
        values.unshift(null)
        return padDate.call(this, i - 1, ii, values)
      }
      else if (ii < 6) {
        values.push(null)
        return padDate.call(this, i, ii + 1, values)
      }else {
        return values
      }
    })(moment(vnode.state.current).date(dates[0]).weekday(), moment(vnode.state.current).date(dates[dates.length - 1]).weekday())

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
    return this._isDate(date) ? new Date(date) : new Date()
  }
  _createRoot (input) {
    const root = document.createElement('div')
    input.parentNode.insertBefore(root, input)
    return root
  }
  _stopPropagation (e) {
    e.stopPropagation()
  }

  _hideOnScroll (e) {
    this.hide()
    window.removeEventListener('scroll', this._hideOnScroll)
  }

  _registerScrollVanish (e) {
    window.addEventListener('scroll', this._hideOnScroll)
  }

  _initComponent (state) {
    const self = this
    if (self.config.position === 'fixed') {
      self._registerScrollVanish()
    }
    return {
      state,
      oninit(vnode) {
        vnode.state.current = state.current
        vnode.state.value = state.value
      },
      oncreate(vnode) {
        vnode.dom.style.position = self.config.position

        const inputPosition = {
          top: self.config.input.offsetTop,
          left: self.config.input.offsetLeft,
          right: self.config.input.offsetLeft + self.config.input.offsetWidth,
          bottom: self.config.input.offsetTop + self.config.input.offsetHeight
        }
        const top = inputPosition.top
        const left = inputPosition.left
        const right = inputPosition.right
        const bottom = inputPosition.bottom
        if (inputPosition.left < self.config.input.clientWidth) {
          vnode.dom.style.left = right + 'px'
        } else {
          vnode.dom.style.right = left + 'px'
        }

        if (inputPosition.bottom < self.config.input.clientHeight) {
          vnode.dom.style.bottom = top + 'px'
        } else {
          vnode.dom.style.top = bottom + 'px'
        }
        const hide = document.addEventListener('click', self.hide(self, hide))
      },
      view(vnode) {
        return m('div', {class: 'date-picker', onclick: self._stopPropagation}, [
          m('span', {class: 'prev', onclick: self.decrementMonthView(vnode)}, '<'),
          m('span', {class: 'next', onclick: self.incrementMonthView(vnode)}, '>'),
          m('h2', {class: 'currentMonth'}, moment(vnode.state.current).format('MMMM YYYY')),
          m('div', {class: 'dates-display'}, self._renderDayHeadings(vnode).concat(self._renderDates(vnode)))
        ])
      }
    }
  }
}

module.exports = Datepicker
