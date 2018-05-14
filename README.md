[![Travis](https://img.shields.io/travis/myfrom/Notifier.svg?style=flat-square)](https://travis-ci.org/myfrom/Notifier)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg?style=flat-square)](https://www.webcomponents.org/element/myfrom/Notifer)
[![Docs on Github Pages](https://img.shields.io/badge/docs-github%20pages-3F51B5.svg?style=flat-square)](https://myfrom.github.io/Notifier)


# Notifier
A lightweight library to show paper-toast and paper-dialog alerts easily.

![Header image](banner.png?raw=true)

## Usage

To use it you have to import [notifier.js](notifier.js) file anywhere in your document scope. You also must ensure that Polymer and importHref are loaded before Notifier.
You should put something like this in your document's `<head>`:
```html
<link rel="import" href="bower_components/polymer/lib/utils/import-href.html">
<script src="bower_components/notifier/notifier.js"></script>
```

When Notifier is ready, it dispatches an event `notifier-ready` on window and initialises its class on `window.Notifier`.

### Custom options

You can set custom options before you load Notifier by setting `NotifierOptions` on `window`. Here are the default values:

```json
{
  "elementsImported": false, // If set to true, Notifier won't attempt to load its dependencies (check 'Loading dependencies' section).
  "stylesLoaded": false, //  Same but it's about helper styles (check 'Helper styles section').
  "mobileMediaQuery": ["(orientation: landscape) and (max-width: 960px)","(orientation: portrait) and (max-width: 600px)"] // To distinguish between phones and bigger devices. If changed you should also change it in styles.css
}
```

### Loading dependencies

Notifier relies on a few custom elements such as [paper-dialog](https://www.webcomponents.org/element/PolymerElements/paper-dialog) and [paper-toast](https://www.webcomponents.org/element/PolymerElements/paper-toast).

By default, they will be loaded using `Polymer.importHref` function. You can ommit this loading attempt by setting `elementsImported` option to `true` (look above). However, if you do this and not import nescessary files, Notifier will throw an error.

Here are all the nescessary files for each function:

<details>
  <summary>`showToast()`</summary>
  <ul>
    <li>paper-toast</li>
    <li>paper-button</li> (if includes a button)
  </ul>
</details>
<details>
  <summary>`showDialog()`</summary>
  <ul>
    <li>paper-dialog</li>
    <li>paper-dialog-scrollable</li>
  </ul>
</details>
<details>
  <summary>`askDialog()`</summary>
  <ul>
    <li>paper-dialog</li>
    <li>paper-dialog-scrollable</li>
    <li>paper-button</li> 
  </ul>
</details>
<details>
  <summary>Animations</summary>
  <ul>
    <li>neon-animation/web-animations.html</li>
    <li>neon-animation/animations/fade-in-animation.html</li>
    <li>neon-animation/animations/fade-out-animation.html</li>
    <li>neon-animation/animations/slide-from-bottom-animation.html</li>
    <li>neon-animation/animations/slide-down-animation.html</li>
  </ul>
</details>

### Helper styles

Notifer relies on a few styles applied to paper-button in paper-toast. Those styles are not mandatory but enxure there are no weird bugs such as text overlapping with button, etc.

They're automatically loaded but you can skip that by setting `stylesLoaded` option to `true` (look above).