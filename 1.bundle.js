(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

/***/ 279:
/***/ (function(module, exports) {

/**
 * @author Wiktor Olejniczak <myfrom.13th@gmail.com>
 * @license MIT
 * 
 * @module notifier/style-loader
 */
if (!document) throw new Error('Notifier can\'t run without document object.');
var styleContent = "\n  paper-toast.notifier > paper-button {\n    position: absolute;\n    top: 6px;\n    bottom: 6px;\n    height: 36px;\n    right: 24px;\n    margin: auto 0;\n    min-width: unset;\n  }\n";
var styleEl = document.createElement('style');
styleEl.innerHTML = styleContent;
document.head.appendChild(styleEl);

/***/ })

}]);