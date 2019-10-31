/**
 * @author Wiktor Olejniczak <myfrom.13th@gmail.com>
 * @license MIT
 * 
 * @module notifier/style-loader
 */


if (!document) throw new Error('Notifier can\'t run without document object.');

const el = document.createElement('link');
el.setAttribute('rel', 'stylesheet');
el.setAttribute('href', '/node_modules/@myfrom/notifier/styles.css');
document.head.appendChild(el);
