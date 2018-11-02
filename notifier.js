/**
 * @author Wiktor Olejniczak <myfrom.13th@gmail.com>
 * @license MIT
 * 
 * @module notifier
 */


if (!document) throw new Error('Notifier can\'t run without document object.');

// Read global options to local const
const options = window.NotifierOptions || {};

/** 
 * Elements that are required for full Notifier functionality
 * 
 * @constant
 */
const elementsToImport = [
  '@polymer/paper-dialog/paper-dialog.js', '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js',
  '@polymer/paper-button/paper-button.js', '@polymer/paper-toast/paper-toast.js',
  'web-animations-js/web-animations.min.js', '@polymer/neon-animation/animations/fade-in-animation.js',
  '@polymer/neon-animation/animations/fade-out-animation.js', '@polymer/neon-animation/animations/slide-from-bottom-animation.js',
  '@polymer/neon-animation/animations/slide-down-animation.js'
]

const loadingImports = [];
if (!options.elementsImported) {
  elementsToImport.forEach(url => {
    loadingImports.push(import(`../${url}`));
  });
}
if (!options.stylesLoaded)
  loadingImports.push(import('./styles-loader.js'));

const mobileMediaQuery = options.mobileMediaQuery ||
  ['(orientation: landscape) and (max-width: 960px)',
  '(orientation: portrait) and (max-width: 600px)'];

/**
 * Main class. It contains all functions and manages paper-dialog and paper-toast elements currently on the page.
 * You don't have to worry about multiple instances
 * 
 * @class
 * @demo demo/demo.html
 */
class Notifier {

  /**
   * Get toast element or create one if needed
   * 
   * @returns {Element} Toast element
   * @throws This will throw if paper-toast element isn't imported
   */
  get toast() {
    if (customElements.get('paper-toast'))
      throw new Error('You must import paper-toast for Notifier.showToast functionality to work');
    if (this._toast)
      return this._toast;
    else {
      const toastSearchRes = document.querySelector('paper-toast.notifier');
      if (toastSearchRes) {
        this._toast = toastSearchRes
      } else {
        const toastEl = document.createElement('paper-toast');
        document.body.appendChild(this.toast);
        this._toast = toastEl;
      }
    }
  }

  /**
   * Get dialog element or create one if needed
   * 
   * @returns {Element} Dialog element
   * @throws This will throw if paper-dialog element isn't imported
   */
  get dialog() {
    if (this._dialog)
      return this._dialog;
    else {
      const toastSearchRes = document.querySelector('paper-dialog.notifier');
      if (toastSearchRes) {
        this._dialog = toastSearchRes
      } else {
        const toastEl = document.createElement('paper-dialog');
        document.body.appendChild(this.toast);
        this._dialog = toastEl;
      }
    }
  }

  /**
   * @throws This will throw if run in non-browser environment
   */
  constructor() {
    // Check for window object
    if (typeof window === 'undefined')
      throw new Error('Notifier can\'t be run in non-browser environment');
      
    // Add shortcut for layout
    window.addEventListener('resize', e => {
      this._mobile = window.matchMedia(mobileMediaQuery).matches;
    });
    this._mobile = window.matchMedia(mobileMediaQuery).matches;

    // Define Material animation for dialogs
    // This is a part related to neon-animation and will be removed in future
    /** @constant */
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
  
  /**
   * Opens a toast with provided message
   * @param {string} msg Message to be shown
   * @param {object} [options]
   * @param {string} [options.btnText] Text on paper button, leave empty to not show
   * @param {EventListener} [options.btnFunction] Function to be called when button is pressed
   * @param {number} [options.duration = 3000] Time in milliseconds before dialog will close, set to 0 to only allow manual close
   * @param {object} [options.attributes] Attributes to be passed down to the dialog, { attr: value }
   * @throws This will throw if `msg` is empty
   */
  async showToast(msg, options = {}) {
    await Promise.all(loadingImports);

    if (!msg) throw new Error('Provided empty toast message');

    if (!options.attributes) options.attributes = [];

    const toast = this._toast;
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

    toast.open();
  }
  
  /**
   * Opens a dialog
   * @param {string} header Header of the dialog
   * @param {string} content Content of the dialog, must be a string with all tags, including bottom buttons
   * @param {object} [options]
   * @param {object} [options.attributes] Attributes to be passed down to the dialog, { attr: value }
   * @param {boolean} [options.noBackdrop] Don't show backdrop behind dialog
   * @param {boolean} [options.formatted=false] If true,`content` will be put directly into element, otherwise put inside `<paper-scrollable-dialog>`
   * @param {Element} [options.target=window] Target element on which dialog will be appended
   * @param {function} [options.beforeClose] Function to be run after accepting but before removing the dialog, if set promise will resolve with it's resoluts
   * @param {object} [options.animationConfig] animationConfig on dialog element, if unset will default to Material animation
   * @returns {Promise} A promise that will resolve if dialog was accepted or reject with `error: false` when cancelled
   */
  showDialog(header, content, options = {}) {
    return new Promise((resolve, reject) => {
      Promise.all(loadingImports).then(() => {
        if (!options.attributes) options.attributes = [];

        const dialog = this._dialog;
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

        dialog.open();
      });
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
  
}

export default Notifier;
export { elementsToImport };
