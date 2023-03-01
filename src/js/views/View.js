import 'core-js/stable';
import 'regenerator-runtime/runtime';

export default class View {
  _windowErr = document.querySelector('.error-window');
  _textErr = document.querySelector('.error-window__text');
  _overlay = document.querySelector('.overlay');
  _btnErr = document.querySelector('.btn__close--error');
  _btnTry = document.querySelector('.error-window__btn--try');
  _workoutsContainer = document.querySelector('.workouts');

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

  updateWorkout(markups) {
    const newDOM = document.createRange().createContextualFragment(markups);
    const newElementsArr = [...newDOM.querySelectorAll('*')];
    console.log(newElementsArr);
    // slice(32) to remove all form's elements
    const curElementsArr = [
      ...this._workoutsContainer.querySelectorAll('*'),
    ].slice(32);
    console.log(curElementsArr);

    newElementsArr.forEach((newEl, i) => {
      let currentEl = curElementsArr[i];
      if (!newEl.isEqualNode(currentEl)) currentEl.outerHTML = newEl.outerHTML;
    });
  }

  updateAppbarState(workouts, type) {
    const stateType = document.querySelector('.state__type--text-workout');
    const workoutsQuantity = document.querySelector(
      '.state__number--text-quantity'
    );

    if (type) stateType.textContent = type;
    workoutsQuantity.textContent = workouts.length;
  }
}
