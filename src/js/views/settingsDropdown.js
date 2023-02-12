class Settings {
  _parentEl = document.querySelector('.app-bar');
  _workoutsContainer = document.querySelector('.workouts');

  hideSettingsDropdown(handler) {
    this._parentEl.addEventListener('click', e => handler(e));
  }
  showSettingsDropdown(handler) {
    this._workoutsContainer.addEventListener('click', e => handler(e));
  }

  addHandlerSettings(handler) {
    this._parentEl.addEventListener('click', e => {
      const settingsEl = e.target.closest('.settings__dropdown--item');
      if (!settingsEl) return;
      handler(e, settingsEl);
    });
  }

  showSettingsContainer(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const settingsIcon = e.target.closest('.icon__settings');
    if (!settingsIcon) return;

    // Hide settings dropdown container from other workout cards
    this._hideSettingsContainer();
    const clickedDropdown = workoutEl.querySelector('.settings__dropdown');
    clickedDropdown.classList.remove('hidden');
  }

  hideDropdownClickOutside(e) {
    let dropdownArr = [];
    const settingsEl = this._parentEl.querySelectorAll('.settings__dropdown');
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
    const dropdownItems = this._workoutsContainer.querySelectorAll(
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
