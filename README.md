[![Travis](https://img.shields.io/travis/myfrom/Notifier.svg?style=flat-square)](https://travis-ci.org/myfrom/Notifier)
[![Published on webcomponents.org](https://img.shields.io/badge/shared_on-webcomponents.org-blue.svg?style=flat-square)](https://www.webcomponents.org/element/@myfrom/Notifer)
[![Docs on Github Pages](https://img.shields.io/badge/docs-github%20pages-3F51B5.svg?style=flat-square)](https://myfrom.github.io/Notifier)


🏗 **ALPHA BUILD! Bugs may occur** 🚧


# Notifier
A lightweight library to show paper-toast and paper-dialog alerts easily.

![Header image](banner.png)

## Usage

To use it you have to import [notifier](notifier.js) module.
```javascript
import Notifier from '@myfrom/notifier';
```
The module returns an initialised Notifier class on which you can use methods described in [docs](https://myfrom.github.io/Notifier).

**You should also load styles helper to ensure compatibility**, check section ["Helper styles"](#helper-styles)

If you want to use non-module version, you should downgrade to version 1.x.x


### Custom options

To use Notifier with your options, you need to import `NotifierImpl` and initialise that class with your options object

You can set custom options before you load Notifier by setting `NotifierOptions` on `window`. Here are the default values:

```javascript
import { NotiferImpl } from '@myfrom/notifier';

cosnt Notifier = new NotifierImpl({
  "mobileMediaQuery": ["(orientation: landscape) and (max-width: 960px)","(orientation: portrait) and (max-width: 600px)"] // To distinguish between phones and bigger devices. If changed you should also change it in styles.css
})
```

### Loading dependencies

Notifier relies on two MWC web components: [mwc-dialog](https://www.npmjs.com/package/@material/mwc-dialog) and [mwc-snackbar](https://www.npmjs.com/package/@material/mwc-snackbar).

You need to ensure that the browser will be able to run Web Components, that means you need to manually load any necessary polyfills in older browsers.

Differently to version 2 and earlier, those elements will always be imported with Notifier.

### Helper styles

For best experience, Notifier doesn't use custom buttons but relies on vanilla button implementation. To achieve Material Design look, the button is styled inside helper styles.

If you already have styles for a Material Button, you can skip loading the file and apply those styles to button with `material-button` class. Otherwise you should import the  [styles.css](./styles.css) stylesheet, either by a `<link rel="stylesheet" href="node_modules/@myfrom/notifier/styles.css">` or by importing `import '@myfrom/notifier/styles-loader'` in your JavaScript.

Differently to version 2 and earlier, those styles are not loaded automatically.