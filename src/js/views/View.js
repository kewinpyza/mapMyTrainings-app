import 'core-js/stable';
import 'regenerator-runtime/runtime';

export default class View {
  _windowErr = document.querySelector('.error-window');
  _textErr = document.querySelector('.error-window__text');
  _overlay = document.querySelector('.overlay');
  _btnErr = document.querySelector('.error-window__btn--close');
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

  updateWorkout(markup) {
    const newDOM = document.createRange().createContextualFragment(markup);
    const newElements = Array.from(newDOM.querySelectorAll('*'));
    console.log(newElements);
    const curElements = Array.from(
      this._workoutsContainer.querySelectorAll('*')
    ).slice(32);
    console.log(curElements);

    newElements.forEach((newEl, i) => {
      let curEl = curElements[i];
      if (!newEl.isEqualNode(curEl)) {
        curEl.outerHTML = newEl.outerHTML;
      }
    });
  }

  updateAppbarState(html) {
    const stateSection = document.querySelector('.state');
    const newDOM = document.createRange().createContextualFragment(html);
    const newElements = Array.from(newDOM.querySelectorAll('*')).slice(1);
    const currentElements = Array.from(stateSection.querySelectorAll('*'));
    console.log(newElements);
    console.log(currentElements);

    newElements.forEach((newEl, i) => {
      let curEl = currentElements[i];
      if (!newEl.isEqualNode(curEl)) curEl.outerHTML = newEl.outerHTML;
    });
  }
}
