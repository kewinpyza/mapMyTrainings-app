import workoutsView from './workoutsView';
import 'core-js/stable';
import { async } from 'regenerator-runtime';

export default class View {
  _windowErr = document.querySelector('.error-window');
  _textErr = document.querySelector('.error-window__text');
  _overlay = document.querySelector('.overlay');
  _btnErr = document.querySelector('.error-window__btn--close');
  _btnTry = document.querySelector('.error-window__btn--try');
  _workoutsContainer = document.querySelector('.workouts');

  // updateWorkout(markup) {
  //   const newDOM = document.createRange().createContextualFragment(markup);
  //   const newElements = Array.from(newDOM.querySelectorAll('*'));
  //   const curElements = Array.from(
  //     this._workoutsContainer.querySelectorAll('*')
  //   ).slice(29);
  //   // console.log(this._containerWorkouts.querySelectorAll('*'));
  //   newElements.forEach((newEl, i) => {
  //     let curEl = curElements[i];
  //     // console.log(curEl, newEl.isEqualNode(curEl));
  //     if (!newEl.isEqualNode(curEl)) {
  //       curEl.outerHTML = newEl.outerHTML;
  //     }
  //   });
  // }

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
