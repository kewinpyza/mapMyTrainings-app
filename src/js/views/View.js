import 'core-js/stable';
import { async } from 'regenerator-runtime';

export default class View {
  _windowErr = document.querySelector('.error-window');
  _textErr = document.querySelector('.error-window__text');
  _overlay = document.querySelector('.overlay');
  _btnErr = document.querySelector('error-window__btn-close');

  renderError(errorMsg) {
    this._textErr.innerHTML = errorMsg;
    this._toggleWindow();
    this._closeWindow();
  }

  _toggleWindow() {
    this._windowErr.classList.toggle('hidden');
    this._overlay.classList.toggle('hidden');
  }

  _closeWindow() {
    this._btnErr.addEventListener('click', this._toggleWindow.bind(this));
    this._overlay.addEventListener('click', this._toggleWindow.bind(this));
  }
}
