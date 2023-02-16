import * as model from '../model';

class sortView {
  _sortBtn = document.querySelector('.controls__btn--sort');
  _sortContainer = document.querySelector('.sort__container');

  addHandlerSort(handler) {
    const sortButtons = document.querySelectorAll('.sort__btn');
    sortButtons.forEach(btn => btn.addEventListener('click', e => handler(e)));
  }

  addHandlerHamburger(handler) {
    const hamburgerBtn = document.querySelector('.controls__hamburger--button');
    const hamburgerItems = document.querySelectorAll(
      '.controls__hamburger--item'
    );
    hamburgerBtn.addEventListener('click', () => {
      hamburgerItems.forEach(item => {
        item.addEventListener('click', e => handler(e));
      });
    });
  }

  selectSortTypeHamburger(e) {
    const sortTypeAll = e.target.closest('.sort__all');
    const sortTypeRunning = e.target.closest('.sort__running');
    const sortTypeCycling = e.target.closest('.sort__cycling');
    const sortTypeMostLiked = e.target.closest('.sort__mliked');
    const hamburgerCheckbox = document.querySelector('#hamburger-toggle');
    e.preventDefault();

    if (sortTypeAll) model.state.sortType = 'All';
    if (sortTypeRunning) model.state.sortType = '🏃‍♂️ Running';
    if (sortTypeCycling) model.state.sortType = '🚴‍♀️ Cycling';
    if (sortTypeMostLiked) model.state.sortType = '🤩 Most liked';

    hamburgerCheckbox.checked = false;
  }

  toggleSortButtons() {
    this._sortBtn.addEventListener('click', () =>
      this._sortContainer.classList.toggle('zero-height')
    );
  }

  removeSelectedUnderline() {
    const sortBtns = document.querySelectorAll('.sort__btn');
    let sortBtnArr = Array.from(sortBtns);
    sortBtnArr.forEach(el => el.classList.remove('selected'));
  }
}

export default new sortView();
