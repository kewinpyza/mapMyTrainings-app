class buttonsApp {
  _controlBtns = document.querySelectorAll('.controls__btn');
  _overviewBtn = document.querySelector('.controls__btn--overview');
  _clearWorkoutsBtn = document.querySelector('.controls__btn--clear');
  _confirmationContainer = document.querySelector('.confirmation');
  _yesBtn = document.querySelector('.confirmation__window--button-yes');
  _noBtn = document.querySelector('.confirmation__window--button-no');

  addHandlerOverview(handler) {
    this._overviewBtn.addEventListener('click', () => handler());
  }
  addHandlerClear(handler, workouts) {
    this._clearWorkoutsBtn.addEventListener('click', () => {
      if (workouts.length === 0) return;
      setTimeout(() => {
        this._confirmationContainer.classList.remove('hidden');
        handler();
      }, 350);
    });
  }

  showConfirmationWindow() {
    if (this._confirmationContainer.classList.contains('hidden')) return;
    this._noBtn.addEventListener('click', () =>
      setTimeout(() => {
        this._confirmationContainer.classList.add('hidden');
      }, 250)
    );
    this._yesBtn.addEventListener('click', this._clearWorkouts.bind(this));
  }

  _clearWorkouts() {
    localStorage.removeItem('workouts');
    setTimeout(() => {
      this._confirmationContainer.classList.add('hidden');
      location.reload();
    }, 250);
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
