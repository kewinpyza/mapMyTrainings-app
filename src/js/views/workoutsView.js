import mapView from './mapView';

class workoutsView {
  #map = document.querySelector('#map');
  #form = document.querySelector('.form');
  #workoutsContainer = document.querySelector('.workouts');
  #inputType = document.querySelector('.form__input--select');
  #inputStartPoint = document.querySelector('.start');
  #inputEndPoint = document.querySelector('.end');
  #inputElevation = document.querySelector('.form__input--elevation');
  #inputCadence = document.querySelector('.form__input--cadence');

  handlerWorkout(handler) {
    this.#workoutsContainer.addEventListener('click', async e => {
      handler(e);
    });
  }

  newWorkout(running, cycling, data, workouts) {
    let workout;

    if (data.type === 'running') {
      workout = new Running(
        data.map.pathStart,
        data.map.pathEnd,
        data.map.pathDistance,
        data.duration,
        { ...data.time },
        { ...data.weatherData },
        data.cadence
      );
    }
    if (data.type === 'cycling') {
      workout = new Cycling(
        data.map.pathStart,
        data.map.pathEnd,
        data.map.pathDistance,
        data.duration,
        { ...data.time },
        { ...data.weatherData },
        data.elevation
      );
    }

    // Add new object to workouts array
    workouts.push(workout);
    console.log(workouts);
  }

  renderWorkout(workout) {
    const fullyHours = Math.floor(workout.duration / 60);
    const workoutTimeHour = `${fullyHours}:${(
      Math.round(workout.duration) -
      fullyHours * 60 +
      ''
    ).padStart(2, 0)}`;
    let html = `
    <li class="workout workout__${workout.type}" data-id="${workout.id}">
      <ul class="settings__dropdown hidden">
        <li class="settings__dropdown--item edit">
          <i class="icon__edit fa-solid fa-file-pen"></i>
          <span class="settings__dropdown--name">Edit</span>
        </li>
        <li class="settings__dropdown--item delete">
          <i class="icon__delete fa-solid fa-trash"></i>
          <span class="settings__dropdown--name">Delete</span>
        </li>
      </ul>
      <h2 class="workout__title">
        <span class="workout__title--circle">
          <i class="workout__title--star fa-solid fa-star"></i>
        </span>
        ${workout.description}, 18:27
      </h2>
      <i class="icon__settings fa-solid fa-gear"></i>
      <div class="workout__info">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${(workout.distance / 1000).toFixed(
          2
        )}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__info">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${
          workout.duration < 60 ? workout.duration : workoutTimeHour
        }</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__info">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">4.6</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__info">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">178</span>
        <span class="workout__unit">spm</span>
      </div>
      <div class="workout__data">
        <div class="workout__destination">
          <span class="workout__icon location">
            <img
              class="icon__card"
              src="src/images/marker.png"
              alt="Marker icon"
            />
          </span>
          <div class="workout__destination--info">
            <span class="workout__street"
              >Stanisława Eugeniusza Drobnera</span
            >
            <span class="workout__city">Wrocław</span>
          </div>
        </div>
        <div class="workout__info weather">
          <span class="weather__icon">
            <img
              class="icon__fog"
              src="src/images/cancel.png"
              alt="Weather icon"
            />
          </span>
          <span class="workout__value">2</span>
          <span class="workout__unit">°C</span>
        </div>
      </div>
    </li>
    `;
  }
}

export default new workoutsView();
