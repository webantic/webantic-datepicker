## Webantic Datepicker

A lightweight, no-css datepicker library. 

Markup generated is super-minimal and confirms to [RSCSS](http://rscss.io) guidelines for easy styling.

### Usage

Install with `npm i --save @webantic/datepicker`

Just require (use something like [browserify](http://browserify.org/)), give it a text input element and you're good to go.

```javascript
   var Datepicker = require('@webantic/datepicker')

   var picker = new Datepicker(document.querySelector(".js-datepicker"))
```

Optionally, you can pass a config object as a second argument to the constructor. There are currently only two values:

**locale**: the [momentjs](https://momentjs.com/docs/#/i18n/) locale to use (default `en-gb`). Currently supports:
 * `en` (US)
 * `en-gb`(UK)
 * `cs` (Serbia and Montenegro)
 * `es`(Spain)
 * `fr` (France)
 * `nl` (Netherlands)

Don't ask why I picked these ones to support because I have no idea ¯\\\_(ツ)\_/¯

**format**: the [momentjs](https://momentjs.com/docs/#/displaying/format/) format for displaying the value in the input (default `DD/MM/YYYY`)

**position**: (default fixed) either `absolute` or `fixed`. Represents the css position type. If fixed is used the popover will disappear on scroll. 


### Methods

`hide()` hides the picker

*(more coming soon)*

### Example SCSS

There's deliberately no styling bundled with the component but if you need something to get you started use the following:

```scss
    .date-picker {
      & {
        width: 100%;
        max-width: 40rem;
        background: #fff;
        box-shadow: 0 0.4rem 0.8rem rgba(0,0,0,0.4);
        box-sizing: border-box;
        padding: 2rem;
        margin-top: 1.4rem;
      }
      &:after {
        content: url('data:image/svg+xml;utf8,<svg height="13" width="16" xmlns="http://www.w3.org/2000/svg" version="1.1"><polygon points="0,10 7,0 14,10" style="fill:#fff;"></polygon></svg>');
        bottom: 100%;
        left: 0;
        right: 0;
        position: absolute;
        width: 1.3rem;
        height: 1.3rem;
        margin: 0 auto;
        display: block;
      }
      & > .prev,
      & > .next {
        display: block;
        border: 0.1rem solid #ddd;
        padding: 1.5rem 2rem;
        cursor: pointer;
        float: left;
        user-select: none;
      }
      & > .next {
        float: right;
      }
      & > .prev:hover,
      & > .next:hover {
        background: rgba(200,200,200, 0.1);
      }
      & > .currentMonth {
        text-align: center;
        font-size: 2rem;
        font-weight: 100;
        margin: 1.8rem auto;
      }
    }
    .dates-display {
      & {

      }
      & > .dayHeading,
      & > .date {
        display: inline-block;
        width: 14.285714%;
        line-height: 4.5rem;
        text-align: center;
      }
      & > .dayHeading {
        font-size: 1.2rem;
        font-weight: bold;
        vertical-align: bottom;
      }
      & > .date:not(.-empty){
        box-shadow: 0 0 0.1rem #ddd;
        cursor: pointer;
      }
      & > .date:not(.-empty):hover {
        background: rgba(220,220,220, 0.1);
      }
      & > .date:not(.-empty).-active {
        background: blue;
        color: #fff;
      }
    }
```