##Webantic Datepicker

A lightweight, no-css datepicker library. 

Markup generated is super-minimal and confirms to [RSCSS](http://rscss.io) guidelines.

####Usage

install with `npm i --save @webantic/datepicker`

require (use something like [browserify](http://browserify.org/)) and use as follows:

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


####Methods

`hide()` hides the picker

*(more coming soon)*