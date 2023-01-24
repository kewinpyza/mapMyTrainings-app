import 'core-js/stable';
import { async } from 'regenerator-runtime';

export default class View {
  _windowErr = document.querySelector('.error-window');
  _textErr = document.querySelector('.error-window__text');
  _overlay = document.querySelector('.overlay');
  _btnErr = document.querySelector('.error-window__btn--close');
  _btnTry = document.querySelector('.error-window__btn--try');


  renderError(errorMsg) {
    this._textErr.innerHTML = errorMsg;
    this._closeWindow();
    this._toggleError();
  }

  _toggleError() {
    [this._windowErr, this._overlay, this._btnTry].forEach(el =>
      el.classList.toggle('hidden')
    );
  }

  _closeWindow() {
    [this._btnErr, this._overlay, this._btnTry].forEach(closer =>
      closer.addEventListener('click', this._toggleError.bind(this))
    );
  }
}
