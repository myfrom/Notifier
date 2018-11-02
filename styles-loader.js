/**
 * @author Wiktor Olejniczak <myfrom.13th@gmail.com>
 * @license MIT
 * 
 * @module notifier/style-loader
 */


if (!document) throw new Error('Notifier can\'t run without document object.');

export default (r => {
  const style = `
    paper-toast.notifier > paper-button {
      position: absolute;
      top: 6px;
      bottom: 6px;
      height: 36px;
      right: 24px;
      margin: auto 0;
      min-width: unset;
    }
  `
  document.head.insertAdjacentHTML('beforeend', style);
  r();
})();