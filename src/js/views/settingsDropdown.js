class Settings {
  #parentEl = document.querySelector('.app-bar');
  #workoutsContainer = document.querySelector('.workouts');

  hideSettingsDropdown(handler) {
    this.#parentEl.addEventListener('click', e => {
      handler(e);
    });
  }
  showSettingsDropdown(handler) {
    this.#workoutsContainer.addEventListener('click', e => {
      handler(e);
    });
  }

  showSettingsContainer(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    if (e.target.classList.contains('icon__settings')) {
      // Hide settings dropdown container from other workout cards
      this._hideSettingsContainer();
      const clickedDropdown = workoutEl.querySelector('.settings__dropdown');
      clickedDropdown.classList.remove('hidden');
      const editEl = clickedDropdown.querySelector('.edit');
      const deleteEl = clickedDropdown.querySelector('.delete');
    }
  }

  hideDropdownClickOutside(e) {
    let dropdownArr = [];
    const settingsEl = this.#parentEl.querySelectorAll('.settings__dropdown');
    settingsEl.forEach(el => dropdownArr.push(el));
    const allHidden = dropdownArr.every(item =>
      item.classList.contains('hidden')
    );
    // prettier-ignore
    if (
      e.target.classList.contains('icon__settings') ||
      e.target.closest('.settings__dropdown--item') ||
      allHidden
    ) return;

    this._hideSettingsContainer();
  }

  _hideSettingsContainer() {
    const dropdownItems = this.#workoutsContainer.querySelectorAll(
      '.settings__dropdown'
    );
    if (!dropdownItems) return;
    dropdownItems.forEach(item => {
      if (item.classList.contains('hidden')) return;
      item.classList.add('hidden');
    });
  }
}
export default new Settings();
