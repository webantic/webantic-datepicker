'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var m = require('mithril');
var moment = require('moment');

var _require = require('@webantic/util'),
    popover = _require.popover;

require('moment/locale/en-gb');
require('moment/locale/cs.js');
require('moment/locale/es.js');
require('moment/locale/fr.js');
require('moment/locale/nl.js');

var Datepicker = function () {
  function Datepicker(input) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Datepicker);

    if (!input) {
      console.warn('you need to pass a DOM node to Datepicker constructor');
      return;
    }
    var self = this;
    Datepicker.eventName = '@webantic/datepicker/opened';

    // default config
    self.config = {
      format: 'DD/MM/YYYY',
      locale: 'en-gb',
      position: 'fixed',
      oneOpen: true,
      closeOnSelect: true
      // update config
    };Object.assign(self.config, config);
    moment.locale(self.config.locale);
    self.config.input = input;
    self.config.root = self._createRoot(input);

    // set up show listener
    input.addEventListener('focus', function renderDatePicker(e) {
      // initial state
      var value = e.target._date ? self._cleanDate(e.target._date) : self._cleanDate(e.target.value);
      var state = {
        current: value,
        value: value

        // mount component
      };var component = self._initComponent(state);
      m.mount(self.config.root, component);
      self.config.root.dispatchEvent(new CustomEvent(Datepicker.eventName, {
        detail: {
          instance: self
        },
        bubbles: true
      }));
    });

    if (self.config.oneOpen) {
      window.addEventListener(Datepicker.eventName, function (event) {
        if (event.detail.instance !== self) {
          m.mount(self.config.root, null);
        }
      });
    }
    input.addEventListener('click', self._stopPropagation);
  }

  _createClass(Datepicker, [{
    key: 'selectDate',
    value: function selectDate(vnode, date) {
      var self = this;
      return function dateSelectionClickHandler(e) {
        var newValue = moment(vnode.state.current).date(date);
        self.config.input.value = newValue.format(self.config.format);
        vnode.state.value = newValue.toDate();
        self.config.input._date = newValue.toDate();
        if (self.config.closeOnSelect) {
          m.mount(self.config.root, null);
        }
      };
    }
  }, {
    key: 'incrementMonthView',
    value: function incrementMonthView(vnode) {
      return function nextMonthClickHandler(e) {
        var currentMonth = moment(vnode.state.current).month();
        var newDate = moment(vnode.state.current).month(currentMonth + 1);
        vnode.state.current = newDate.toDate();
        return newDate;
      };
    }
  }, {
    key: 'decrementMonthView',
    value: function decrementMonthView(vnode) {
      return function prevMonthClickHandler(e) {
        var currentMonth = moment(vnode.state.current).month();
        var newDate = moment(vnode.state.current).month(currentMonth - 1);
        vnode.state.current = newDate.toDate();
        return newDate;
      };
    }
  }, {
    key: 'hide',
    value: function hide(self, listener) {
      return function hideClickHandler(e) {
        m.mount(self.config.root, null);
        document.removeEventListener('click', listener);
      };
    }
  }, {
    key: '_renderDayHeadings',
    value: function _renderDayHeadings(vnode) {
      var self = this;
      var days = function addDay() {
        var i = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

        if (i <= 6) {
          values.push(moment().weekday(i).format('dd')[0]);
          return addDay.call(this, i + 1, values);
        } else {
          return values;
        }
      }();
      return days.map(function templatifyDays(date) {
        return m('div', { class: 'dayHeading' }, date);
      });
    }
  }, {
    key: '_renderDates',
    value: function _renderDates(vnode) {
      var self = this;
      var daysToRender = moment(vnode.state.current).daysInMonth();
      var dates = function addDate(i, total) {
        var values = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

        if (i <= total) {
          values.push(i);
          return addDate.call(this, i + 1, total, values);
        } else {
          return values;
        }
      }(1, daysToRender);

      var paddedDates = function padDate(i, ii) {
        var values = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : dates;

        if (i > 0) {
          values.unshift(null);
          return padDate.call(this, i - 1, ii, values);
        } else if (ii < 6) {
          values.push(null);
          return padDate.call(this, i, ii + 1, values);
        } else {
          return values;
        }
      }(moment(vnode.state.current).date(dates[0]).weekday(), moment(vnode.state.current).date(dates[dates.length - 1]).weekday());

      return paddedDates.map(function templatifyDates(date) {
        var empty = function isEmpty() {
          return date ? '' : '-empty';
        };
        var active = function isActive() {
          return parseInt(moment(vnode.state.value).format('DDMMYYYY')) === parseInt(moment(vnode.state.current).date(parseInt(date)).format('DDMMYYYY')) ? '-active' : '';
        };
        var props = {
          class: 'date ' + empty() + ' ' + active()
        };
        if (date) {
          props.onclick = self.selectDate(vnode, parseInt(date));
        }
        return m('div', props, date);
      });
    }
  }, {
    key: '_isDate',
    value: function _isDate(date) {
      return !isNaN(new Date(date).getTime());
    }
  }, {
    key: '_cleanDate',
    value: function _cleanDate(date) {
      var self = this;
      var momented = moment(date, self.config.format, true);
      if (momented.isValid()) {
        return momented;
      }
      return moment(new Date(), self.config.format, true);
    }
  }, {
    key: '_createRoot',
    value: function _createRoot(input) {
      var root = document.createElement('div');
      input.parentNode.insertBefore(root, input);
      return root;
    }
  }, {
    key: '_stopPropagation',
    value: function _stopPropagation(e) {
      e.stopPropagation();
    }
  }, {
    key: '_registerScrollVanish',
    value: function _registerScrollVanish(e) {
      var self = this;
      var hideOnScroll = function hideOnScroll(e) {
        m.mount(self.config.root, null);
        self.config.input.blur();
        window.removeEventListener('scroll', hideOnScroll, false);
      };
      window.addEventListener('scroll', hideOnScroll);
    }
  }, {
    key: '_positionFixedly',
    value: function _positionFixedly(vnode) {
      var self = this;
      var datePickerElement = vnode.dom;
      var inputElement = self.config.input;
      popover.positionFixed(datePickerElement, inputElement);
    }
  }, {
    key: '_positionAbsolutely',
    value: function _positionAbsolutely(vnode) {
      var self = this;
      // just in case there's no parent with a non-static position
      document.body.style.position = 'relative';

      var inputPosition = {
        top: self.config.input.offsetTop + self.config.input.offsetHeight,
        left: self.config.input.offsetLeft,
        right: self.config.input.offsetParent.clientWidth - (self.config.input.offsetLeft + self.config.input.offsetWidth),
        bottom: self.config.input.offsetParent.clientHeight - self.config.input.offsetTop
      };
      if (inputPosition.left < self.config.input.clientWidth) {
        vnode.dom.style.left = inputPosition.left + 'px';
      } else {
        vnode.dom.style.right = inputPosition.right + 'px';
      }

      if (self.config.input.getBoundingClientRect().bottom > window.innerHeight * 0.75) {
        vnode.dom.style.bottom = inputPosition.bottom + 'px';
      } else {
        vnode.dom.style.top = inputPosition.top + 'px';
      }
    }
  }, {
    key: '_initComponent',
    value: function _initComponent(state) {
      var self = this;
      return {
        state: state,
        oninit: function oninit(vnode) {
          vnode.state.current = state.current;
          vnode.state.value = state.value;
        },
        oncreate: function oncreate(vnode) {
          vnode.dom.style.position = self.config.position;

          if (self.config.position === 'fixed') {
            self._registerScrollVanish();
          }

          if (self.config.position === 'fixed') {
            self._positionFixedly(vnode);
          } else {
            self._positionAbsolutely(vnode);
          }

          var hide = document.addEventListener('click', self.hide(self, hide));
        },
        view: function view(vnode) {
          var hide = function hide() {
            m.mount(self.config.root, null);
          };
          return m('div', { class: 'date-picker', onclick: self._stopPropagation }, [m('span', { class: 'prev', onclick: self.decrementMonthView(vnode) }, '<'), m('span', { class: 'next', onclick: self.incrementMonthView(vnode) }, '>'), m('h2', { class: 'currentMonth' }, moment(vnode.state.current).format('MMMM YYYY')), m('div', { class: 'dates-display' }, self._renderDayHeadings(vnode).concat(self._renderDates(vnode))), self.config.closeOnSelect ? null : m('div', { class: 'button', onclick: hide }, self.config.confirmText || 'Confirm')]);
        }
      };
    }
  }]);

  return Datepicker;
}();

module.exports = Datepicker;