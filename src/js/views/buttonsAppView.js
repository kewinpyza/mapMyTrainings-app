class buttonsApp {
  _controlBtns = document.querySelectorAll('.controls__btn');
  _overviewBtn = document.querySelector('.controls__btn--overview');
  _sortBtn = document.querySelector('.controls__btn--overview');
  _clearWorkoutsBtn = document.querySelector('.controls__btn--clear');

  addHandlerOverview(handler) {
    this._overviewBtn.addEventListener('click', e => handler(e));
  }
  addHandlerClear(handler) {
    this._clearWorkoutsBtn.addEventListener('click', () => handler());
  }

  clearWorkouts() {
    localStorage.removeItem('workouts');
    setTimeout(() => {
      location.reload();
    }, 1000);
  }

  createSpanEffect() {
    this._controlBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        let x = e.offsetX + 'px';
        let y = e.offsetY + 'px';

        const spanEffect = document.createElement('span');
        spanEffect.classList.add('span-effect');
        spanEffect.style.left = x;
        spanEffect.style.top = y;

        btn.append(spanEffect);
      });
    });
  }
}

export default new buttonsApp();
