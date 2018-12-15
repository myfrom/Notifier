import "@babel/polyfill";
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/neon-animation/animations/fade-in-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
import '@polymer/neon-animation/animations/slide-from-bottom-animation.js';
import '@polymer/neon-animation/animations/slide-down-animation.js';
import { default as notifierClass } from '../notifier';

window.Notifier = notifierClass;