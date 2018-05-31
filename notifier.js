/**
 * @author Wiktor Olejniczak <myfrom.13th@gmail.com>
 * @license MIT
 */

(function(){

  if (!document) throw new Error('Notifier can\'t run without document object.');

  'use strict'

  function importHref(src) {
    return new Promise((resolve, reject) => {
      Polymer.importHref(src, resolve, reject);
    });
  }

  const options = window.NotifierOptions || {};
  const baseUrl = options.baseComponentsURL || 'bower_components/';
  if (baseUrl.substr(baseUrl.length - 1) !== '/') baseUrl += '/';

  const loadingImports = [];

  if (!options.elementsImported) {
    [
      'paper-dialog/paper-dialog.html', 'paper-dialog-scrollable/paper-dialog-scrollable.html',
      'paper-button/paper-button.html', 'paper-toast/paper-toast.html',
      'neon-animation/web-animations.html', 'neon-animation/animations/fade-in-animation.html',
      'neon-animation/animations/fade-out-animation.html', 'neon-animation/animations/slide-from-bottom-animation.html',
      'neon-animation/animations/slide-down-animation.html'
    ].forEach(url => {
      loadingImports.push(importHref(baseUrl + url));
    });
  }
  if (!options.stylesLoaded) {
    loadingImports.push(new Promise((resolve, reject) => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'stylesheet');
      el.setAttribute('href', baseUrl + 'Notifier/styles.css');
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    }));
  }

  const mobileMediaQuery = options.mobileMediaQuery ||
    ['(orientation: landscape) and (max-width: 960px)',
    '(orientation: portrait) and (max-width: 600px)'];

  /**
   * Main class. It contains all functions and manages paper-dialog and paper-toast elements currently on the page.
   * It's recommended to have only one on page.
   * @class
   * @demo demo/demo.html
   */
  class Notifier {
    
    constructor() {
      // Check for window object
      if (String(typeof window).toLowerCase() === 'undefined')
        throw new Error('Notifier can\'t be run in non-browser environment');
        
      window.addEventListener('resize', e => {
        this._mobile = window.matchMedia(mobileMediaQuery).matches;
      });
      this._mobile = window.matchMedia(mobileMediaQuery).matches;
    }
    
    /**
     * Opens a toast with provided message
     * @param {string} msg Message to be shown
     * @param {object} [options]
     * @param {string} options.btnText Text on paper button, leave empty to not show
     * @param {function} options.btnFunction Function to be called when button is pressed
     * @param {number} [options.duration = 3000] Time in milliseconds before dialog will close, set to 0 to only allow manual close
     * @param {object} options.attributes Attributes to be passed down to the dialog, { attr: value }
     */
    showToast(msg, options = {}) {
      if (!msg) throw new Error('Provided empty toast message');
      let readyToShow = true;
      if (!this.toast) {
        /** 
         * @todo Enable on-demand components loading
         * @todo Make it independent of importHref function
         */
        if (!customElements.get('paper-toast')) {
          readyToShow = importHref('../bower_components/paper-toast/paper-toast.html')
            .then(() => readyToShow = true);
        }
        this.toast = document.createElement('paper-toast');
        document.body.appendChild(this.toast);
      }
      if (!options.attributes) options.attributes = [];
      const toast = this.toast;
      if (toast.opened) toast.close();
      toast.innerHTML = options.btnText ? `<paper-button>${options.btnText}</paper-button>` : null;
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
      toast.classList.toggle('fit-bottom', this._mobile);
      toast.text = msg;
      toast.duration = String(typeof options.duration).toLowerCase() === 'number' ? options.duration : 3000;
      if (options.btnText && options.btnFunction) {
        toast.querySelector('paper-button').addEventListener('tap', options.btnFunction);
      }
      if (options.btnText) {
        const btnWidth = toast.querySelector('paper-button').getBoundingClientRect().width;
        toast.style.paddingRight = btnWidth + 48 + 'px';
      }
      if (readyToShow === true)
        toast.open();
      else
        readyToShow.then(() => toast.open());
    }
    
    /**
     * Opens a dialog
     * @param {string} header Header of the dialog
     * @param {string} content Content of the dialog, must be a string with all tags, including bottom buttons
     * @param {object} [options]
     * @param {object} options.attributes Attributes to be passed down to the dialog, { attr: value }
     * @param {boolean} options.noBackdrop Don't show backdrop behind dialog
     * @param {boolean} [options.formatted=false] If true,`content` will be put directly into element, otherwise put inside `<paper-scrollable-dialog>`
     * @param {DOMElement} options.target Target element on which dialog will be appended
     * @param {function} options.beforeClose Function to be run after accepting but before removing the dialog, if set promise will resolve with it's resoluts
     * @param {object} options.animationConfig animationConfig on dialog element, if unset will default to Material animation
     * @returns {Promise} A promise that will resolve if dialog was accepted or reject with `error: false` when cancelled
     */
    showDialog(header, content, options = {}) {
      return new Promise((resolve, reject) => {
        let readyToShow = true;
        if (!this.dialog) {
          /** 
           * @todo Enable on-demand components loading
           * @todo Make it independent of importHref function
           */
          if (!customElements.get('paper-dialog')) {
            readyToShow = importHref('../bower_components/paper-dialog/paper-dialog.html').then(() => readyToShow = true);;
          }
          this.dialog = document.createElement('paper-dialog');
          document.body.appendChild(this.dialog);
          if (!this.MATERIAL_DIALOG_ANIMATION) {
            /**
             * @constant
             */
            this.MATERIAL_DIALOG_ANIMATION = {
              'entry': [
                {
                  'name': 'slide-from-bottom-animation',
                  'node': this.dialog,
                  'timing': {
                    'duration': 160,
                    'easing': 'ease-out'
                  }
                },
                {
                  'name': 'fade-in-animation',
                  'node': this.dialog,
                  'timing': {
                    'duration': 160,
                    'easing': 'ease-out'
                  }
                }
              ],
              'exit': [
                {
                  'name': 'slide-down-animation',
                  'node': this.dialog,
                  'timing': {
                    'duration': 160,
                    'easing': 'ease-in'
                  }
                },
                {
                  'name': 'fade-out-animation',
                  'node': this.dialog,
                  'timing': {
                    'duration': 160,
                    'easing': 'ease-in'
                  }
                }
              ]
            }
          }
        }
        if (!options.attributes) options.attributes = [];
        const dialog = this.dialog;
        if (dialog.opened) dialog.close();
        const target = options.target || document.body;
        if (dialog.parentElement !== target) target.appendChild(dialog);
        const innerHTML =
          (header ? `<h2>${header}</h2>` : '') +
          (options.formatted ? content : `<paper-dialog-scrollable>${content}</paper-dialog-scrollable>`);
        if ('ShadyDOM' in window && ShadyDOM.inUse) {
          const template = document.createElement('template');
          template.innerHTML = innerHTML;
          dialog.innerHTML = '';
          dialog.appendChild(document.importNode(template.content, true));
        } else
          dialog.innerHTML = innerHTML;
        for (let i = 0; i < dialog.attributes.length; i++) {
          const attrName = dialog.attributes[i].name;
          if (attrName === 'animation-config' && dialog.animationConfig === this.MATERIAL_DIALOG_ANIMATION)
            continue;
          else if (options.attributes[attrName])
            dialog.setAttribute(attrName, options.attributes[attrName]);
          else
            dialog.removeAttribute(attrName);
        }
        Object.keys(options.attributes).forEach(attrName => {
          dialog.setAttribute(attrName, options.attributes[attrName]);
        });
        if (!dialog.animationConfig) {
          dialog.animationConfig = this.MATERIAL_DIALOG_ANIMATION;
        }
        if (!dialog.withBackdrop && !options.noBackdrop) {
          dialog.withBackdrop = true;
        }
        dialog.addEventListener('iron-overlay-closed', e => {
          if (e.detail.confirmed)
            resolve(options.beforeClose && options.beforeClose(e));
          else
            reject({ error: false });
        }, { once: true });
        if (readyToShow === true)
          dialog.open();
        else
          readyToShow.then(() => dialog.open());
      });
    }

    /**
     * Predefined dialog with a yes/no question
     * @param {String} [msg='Are you sure?'] Header text
     * @param {Object} [options]
     * @param {String} [options.innerMsg] Massage in dialog body
     * @param {String} [options.cancelText='No'] Text to show in cancel button
     * @param {String} [options.acceptText='Yes'] Text to show in accept button
     * @param {object} options.attributes Attributes to be passed down to the dialog, { attr: value }
     * @param {boolean} options.noBackdrop Don't show backdrop behind dialog
     * @param {boolean} [options.formatted=false] If true,`content` will be put directly into element, otherwise put inside `<paper-scrollable-dialog>`
     * @param {DOMElement} options.target Target element on which dialog will be appended
     * @param {function} options.beforeClose Function to be run after accepting but before removing the dialog, if set promise will resolve with it's resoluts
     * @param {object} options.animationConfig animationConfig on dialog element, if unset will default to Material animation
     * @returns {Promise} A promise that will resolve if dialog was accepted or reject with `error: false` when cancelled
     */
    askDialog(msg = 'Are you sure?', options = {}) {
      const innerMsg = options.innerMsg || '',
            cancelText = options.cancelText || 'No',
            acceptText = options.acceptText || 'Yes',
            content = `
        <paper-dialog-scrollable>
          ${innerMsg}
        </paper-dialog-scrollable>
        <div class="buttons">
          <paper-button dialog-dismiss>${cancelText}</paper-button>
          <paper-button dialog-confirm autofocus>${acceptText}</paper-button>
        </div>
      `;
      options.formatted = true;
      return this.showDialog(msg, content, options);
    }

    // cookiesDialog() {
    //   return this.showDialog('Allow cookies and usage reporting?',`
    //     <paper-dialog-scrollable>
    //       <p>
    //         We need cookies and IDB to work offline.
    //       </p>
    //       <paper-checkbox checked autofocus>Aslo allow usage reporting</paper-checkbox>
    //       <p>
    //         It will help us make the app better and faster.
    //         The collected data isn't connected with you and is mainly related to how fast the app is and what functions of it do you use.
    //       </p>
    //     </paper-dialog-scrollable>
    //     <div class="buttons">
    //       <a href="https://docs.google.com/document/d/1v6Xmcs9SQLt3wIObW6Qpp_OiYAvugXx9Ux2gxG5h4Ik">
    //         <paper-button>learn more</paper-button>
    //       </a>
    //       <paper-button dialog-confirm>Alow</paper-button>
    //     </div>
    //   `, {
    //     attributes: {
    //       'id': 'cookiesDialog',
    //       'no-cancel-on-esc-key': true,
    //       'no-cancel-on-outside-click': true
    //     },
    //     noBackground: true
    //   });
    // }
    
    askDialog(msg = 'Are you sure?', options = {}) {
      const dialog = document.createElement('paper-dialog');
      const innerMsg = options.innerMsg || '',
            cancelText = options.cancelText || 'No',
            acceptText = options.acceptText || 'Yes',
            content =
        `<paper-dialog-scrollable>
          ${innerMsg}
        </paper-dialog-scrollable>
        <div class="buttons">
          <paper-button dialog-dismiss>${cancelText}</paper-button>
          <paper-button dialog-confirm autofocus>${acceptText}</paper-button>
        </div>`;
      options.formatted = true;
      return this.showDialog(msg, content, options);
    }
    
  }
  
  Promise.all(loadingImports).then(() => {
    window.Notifier = new Notifier();
    window.dispatchEvent(new CustomEvent('notifier-ready', { detail: window.Notifier }));
  });

})();
