class workoutsView {
  #map = document.querySelector('#map');
  #form = document.querySelector('.form');
  #workoutsContainer = document.querySelector('.workouts');
  #inputType = document.querySelector('.form__input--select');
  #inputStartPoint = document.querySelector('.start');
  #inputEndPoint = document.querySelector('.end');
  #inputElevation = document.querySelector('.form__input--elevation');
  #inputCadence = document.querySelector('.form__input--cadence');

  renderWorkout(handler) {
    this.#workoutsContainer.addEventListener('click', async () => {
      handler();
    });
  }

  //   newWorkout(running, cycling, data, workouts) {
  //     let workout;

  //     if (data.type === 'running') {
  //         workout = new Running()
  //     }
  // };
}

export default new workoutsView();
