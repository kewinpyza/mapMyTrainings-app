import * as model from '../model';

class sortView {
  _sortBtn = document.querySelector('.controls__btn--sort');
  _sortContainer = document.querySelector('.sort__container');

  addHandlerSort(handler) {
    // const sortDate = document.querySelector('.sort__btn--date');
    // const sortDistance = document.querySelector('.sort__btn--distance');
    // const sortDuration = document.querySelector('.sort__btn--duration');
    // const sortPace = document.querySelector('.sort__btn--pace');
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

  sortStateHamburger(e) {
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
    aTagsSort = Array.from(this._sortContainer.getElementsByTagName('a'));
    aTagsSort.forEach(el => el.classList.remove('selected'));
  }

  generateAppbarState(workouts) {
    const html = `
    <div class="state">
      <div class="state__type">
        <h1 class="state__type--text">
          Workout type : <span  class="state__type--text-workout">${model.state.sortType}</span>
        </h1>
      </div>
      <div class="state__number">
        <h2 class="state__number--text">
          Number of workouts :
          <span   class="state__number--text-quantity">${workouts.length}</span>
        </h2>
      </div>
    </div>
    `;
    return html;
  }
}

export default new sortView();
