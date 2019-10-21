/**
 * @author Wiktor Olejniczak <myfrom.13th@gmail.com>
 * @license MIT
 * 
 * @module notifier
 */

import '@material/mwc-dialog';
import '@material/mwc-snackbar';

// For HTML markup highlihting
const html = String.raw;


if (!document) throw new Error('Notifier can\'t run without document object.');

/**
 * Main class. It contains all functions and manages mdc-dialog and mdc-toast elements currently on the page.
 * Using the default export, you don't have to worry about multiple instances.
 * 
 * @class
 * @demo demo/demo.html
 */
class Notifier {

  /**
   * Get toast element or create one if needed
   * 
   * @returns {Element} Toast element
   */
  get toast() {
    if (this._toast)
      return this._toast;
    else {
      const toastSearchRes = document.querySelector('mdc-snackbar.notifier');
      if (toastSearchRes) {
        return this._toast = toastSearchRes;
      } else {
        const toastEl = document.createElement('mdc-snackbar');
        document.body.appendChild(toastEl);
        return this._toast = toastEl;
      }
    }
  }

  /**
   * Get dialog element or create one if needed
   * 
   * @returns {Element} Dialog element
   */
  get dialog() {
    if (this._dialog)
      return this._dialog;
    else {
      const dialogSearchRes = document.querySelector('mdc-dialog.notifier');
      if (dialogSearchRes) {
        return this._dialog = dialogSearchRes;
      } else {
        const dialogEl = document.createElement('mdc-dialog');
        document.body.appendChild(dialogEl);
        return this._dialog = dialogEl;
      }
    }
  }

  /**
   * Initialise the class (only when using NotifierImpl)
   * 
   * @param {object} [options] - Options
   * @param {string} [options.mobileMediaQuery="(orientation: landscape) and (max-width: 960px),(orientation: portrait) and (max-width: 600px)"] - Media query for detecting mobile
   * @throws This will throw if run in non-browser environment
   */
  constructor(options = {}) {
    // Check for window object
    if (typeof window === 'undefined')
      throw new Error('Notifier can\'t be run in non-browser environment');
      
    this._mobileMediaQuery = options.mobileMediaQuery || '(orientation: landscape) and (max-width: 960px),(orientation: portrait) and (max-width: 600px)';
    
    // Add shortcut for layout
    this._mobileMediaQueryRef = window.matchMedia(this._mobileMediaQuery);
    this._mobileMediaQueryRef.addListener(e => this._mobile = e.matches);
    this._mobile = this._mobileMediaQueryRef.matches;
  }
  
  /**
   * Opens a toast with provided message
   * @param {string} msg Message to be shown
   * @param {object} [options]
   * @param {string} [options.btnText] Text on paper button, leave empty to not show
   * @param {EventListener} [options.btnFunction] Function to be called when button is pressed
   * @param {number} [options.duration = 5000] Time in milliseconds before dialog will close, between 4000 and 10000
   * @param {object} [options.attributes] Attributes to be passed down to the dialog, { attr: value }
   * @param {object} [options.stacked] Enables the stacked layout
   * @throws This will throw if `msg` is empty
   */
  async showToast(msg, options = {}) {
    if (!msg) throw new Error('Provided empty toast message');

    if (!options.attributes) options.attributes = [];

    const toast = this.toast;
    if (toast.opened) toast.close('new-opened');

    for (let i = 0; i < toast.attributes.length; i++) {
      const attrName = toast.attributes[i].name;
      if (options.attributes[attrName])
        toast.setAttribute(attrName, options.attributes[attrName]);
      else
        toast.removeAttribute(attrName);
    }
    Object.keys(options.attributes).forEach(attrName => {
      toast.setAttribute(attrName, options.attributes[attrName]);
    });

    toast.labelText = msg;

    // toast.innerHTML = options.btnText ? `<paper-button>${options.btnText}</paper-button>` : null;

    toast.classList.toggle('fit-bottom', this._mobile);

    toast.text = msg;

    toast.duration = typeof options.duration === 'number' ? options.duration : 5000;

    if (options.btnText && options.btnFunction) {
      const buttonHtml = html`
        <button class="material-button" slot="action">${options.btnText}</button>
      `;
      toast.addEventListener('MDCSnackbar:close', e => {
        if (e.detail.reason === 'action')
          options.btnFunction(e);
      }), { once: true };
    }

    toast.classList.add('notifier');
    toast.open();
  }
  
  /**
   * Opens a dialog
   * @param {string} header Header of the dialog
   * @param {string} content Content of the dialog, must be a string with all tags, including bottom buttons
   * @param {object} [options]
   * @param {object} [options.attributes] Attributes to be passed down to the dialog, { attr: value }
   * @param {boolean} [options.formatted=false] If true,`content` will be put directly into element, otherwise put inside a `<div>`
   * @param {Element} [options.target=window] Target element on which dialog will be appended
   * @param {function} [options.beforeClose] Function to be run after accepting but before removing the dialog, if set promise will resolve with it's resoluts
   * @returns {Promise} A promise that will resolve if dialog was accepted or reject with `error: false` when cancelled
   */
  showDialog(header, content, options = {}) {
    return new Promise((resolve, reject) => {
      if (!options.attributes) options.attributes = [];

      const dialog = this.dialog;
      if (dialog.opened) {
        // Check if currently open dialog is a modal
        if (dialog.escapeKeyAction === '')
          // Assume it's a modal when can't be dismissed by esc, cancel new dialog
          reject({error: new Error('Another modal open, cancelling new one.')});
        else
          // Assume not important dialog, can be closed
          dialog.close();
      }

      const target = options.target || document.body;
      if (dialog.parentElement !== target) target.appendChild(dialog);

      if (header)
        dialog.title = header;
      else
        dialog.removeAttribute('title');
     
      dialog.innerHTML = (options.formatted ? content : html`<div>${content}</div>`);;

      for (let i = 0; i < dialog.attributes.length; i++) {
        const attrName = dialog.attributes[i].name;
        if (options.attributes[attrName])
          dialog.setAttribute(attrName, options.attributes[attrName]);
        else
          dialog.removeAttribute(attrName);
      }
      Object.keys(options.attributes).forEach(attrName => {
        dialog.setAttribute(attrName, options.attributes[attrName]);
      });

      const closedHandler = e => {
        if (e.target !== dialog) return;
        if (e.detail.action === 'ok')
          resolve(options.beforeClose && options.beforeClose(e));
        else
          reject({ error: false });
        dialog.removeEventListener('closed', closedHandler);
      };
      dialog.addEventListener('closed', closedHandler);

      dialog.classList.add('notifier');
      dialog.open();
    });
  }

  /**
   * Predefined dialog with a yes/no question
   * @param {String} [msg='Are you sure?'] Header text
   * @param {Object} [options]
   * @param {String} [options.innerMsg] Massage in dialog body
   * @param {String} [options.cancelText='No'] Text to show in cancel button
   * @param {String} [options.acceptText='Yes'] Text to show in accept button
   * @param {object} [options.attributes] Attributes to be passed down to the dialog, { attr: value }
   * @param {boolean} [options.noBackdrop] Don't show backdrop behind dialog
   * @param {boolean} [options.formatted=false] If true,`content` will be put directly into element, otherwise put inside `<paper-scrollable-dialog>`
   * @param {Element} [options.target=window] Target element on which dialog will be appended
   * @param {function} [options.beforeClose] Function to be run after accepting but before removing the dialog, if set returned promise will resolve with it's results
   * @param {object} [options.animationConfig] animationConfig on dialog element, if unset will default to Material animation
   * @returns {Promise} A promise that will resolve if dialog was accepted or reject with `error: false` when cancelled
   */
  askDialog(msg = 'Are you sure?', options = {}) {
    const innerMsg = options.innerMsg || '',
          cancelText = options.cancelText || 'No',
          acceptText = options.acceptText || 'Yes',
          content = html`
      <div>
        ${innerMsg}
      </div>
      <button class="material-button" dialog-action="ok" slot="primaryAction" dialog-initial-focus>${acceptText}</button>
      <button class="material-button" dialog-action="cancel" slot="secondaryAction">${cancelText}</button>
    `;
    options.formatted = true;
    return this.showDialog(msg, content, options);
  }
  
}

/** Initialised Notifier class */
export default new Notifier();
export { Notifier as NotifierImpl }
