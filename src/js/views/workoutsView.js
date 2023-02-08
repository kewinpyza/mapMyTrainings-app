import mapView from './mapView';
import img from 'url:../../images/marker.png';
import * as model from '../model';

class workoutsView {
  #map = document.querySelector('#map');
  #form = document.querySelector('.form');
  #workoutsContainer = document.querySelector('.workouts');
  #inputType = document.querySelector('.form__input--select');
  #inputElevation = document.querySelector('.form__input--elevation');
  #inputCadence = document.querySelector('.form__input--cadence');
  #toggleInput = document.querySelector('.form__input--cadence');
  #inputDuration = document.querySelector('.form__input--duration');
  #starterPosition = document.querySelector('.form__input--position-type');

  handlerWorkout(handler) {
    this.#workoutsContainer.addEventListener('click', e => handler(e));
  }

  handlerMostLiked(handler) {
    this.#workoutsContainer.addEventListener('click', e => handler(e));
  }

  newWorkout(running, cycling, data, workouts) {
    let workout;

    if (data.type === 'running') {
      workout = new running(
        data.map.pathStart,
        data.map.pathEnd,
        data.duration,
        data.map.pathDistance,
        { ...data.time },
        { ...data.weather },
        data.cadence
      );
    }
    if (data.type === 'cycling') {
      workout = new cycling(
        data.map.pathStart,
        data.map.pathEnd,
        data.duration,
        data.map.pathDistance,
        { ...data.time },
        { ...data.weather },
        data.elevation
      );
    }
    if (!data.edit) {
      // Add new object to workouts array
      workouts.push(workout);
    } else {
      return workout;
    }
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
      <ul id="dropdown" class="settings__dropdown hidden">
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
        ${workout.description}, ${workout.time.start.workoutTime}
      </h2>
      <i class="icon__settings fa-solid fa-gear"></i>
      <div class="workout__info">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__info">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${
          workout.duration < 60 ? workout.duration : workoutTimeHour
        }</span>
        <span class="workout__unit">${
          workout.duration < 60 ? 'min' : 'h'
        }</span>
      </div>
      <div class="workout__info">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${
          workout.type === 'running' ? workout.pace : workout.speed
        }</span>
        <span class="workout__unit">${
          workout.type === 'running' ? 'min/km' : 'km/h'
        }</span>
      </div>
      <div class="workout__info">
        <span class="workout__icon">${
          workout.type === 'running' ? '🦶🏼' : '🚵🏻‍♂️'
        }</span>
        <span class="workout__value">${
          workout.type === 'running' ? workout.cadence : workout.elevationGain
        }</span>
        <span class="workout__unit">${
          workout.type === 'running' ? 'spm' : 'm'
        }</span>
      </div>
      <div class="workout__data">
        <div class="workout__destination">
          <span class="workout__icon location">
            <img
              class="icon__card"
              src="${img}"
              alt="Marker icon"
            />
          </span>
          <div class="workout__destination--info">
            <span class="workout__street"
              >${workout.location.endLocationStreet}</span
            >
            <span class="workout__city">${workout.location.endLocationCity}, ${
      workout.location.endLocationCountry
    }
            </span>
          </div>
        </div>
        <div class="workout__info weather">
          <span class="weather__icon">
            <img
              class="icon__fog"
              src="${workout.weather.icon}"
              alt="${workout.weather.iconText}"
            />
          </span>
          <span class="workout__value">${workout.weather.temp}</span>
          <span class="workout__unit">°C</span>
        </div>
        <div class="weather__text">${workout.weather.iconText}</div>
      </div>
    </li>
    `;
    this.#form.insertAdjacentHTML('afterend', html);
  }

  async editWorkout(e, workouts) {
    const workoutEl = e.target.closest('.workout');
    const workoutEdited = workouts.find(w => w.id === workoutEl.dataset.id);
    const workoutEditedIndex = workouts.findIndex(
      w => w.id === workoutEl.dataset.id
    );
    workoutEl.classList.add('edited');
    // Show form
    this.#form.classList.remove('hidden');
    // Show workout type and current values
    this.#inputType.value = `${workoutEdited.type}`;
    this.#toggleInput =
      this.#inputType.value === 'running'
        ? this.#inputCadence
        : this.#inputElevation;
    this.#toggleInput.value =
      workoutEdited.type === 'running'
        ? +workoutEdited.cadence
        : +workoutEdited.elevationGain;

    if (workoutEdited.type === 'running') {
      this.#inputElevation
        .closest('.form__row')
        .classList.add('form__row--hidden');
      this.#inputCadence
        .closest('.form__row')
        .classList.remove('form__row--hidden');
    }
    if (workoutEdited.type === 'cycling') {
      this.#inputCadence
        .closest('.form__row')
        .classList.add('form__row--hidden');
      this.#inputElevation
        .closest('.form__row')
        .classList.remove('form__row--hidden');
    }

    // Show workout values on form
    this.#inputDuration.value = +workoutEdited.duration;
    this.#starterPosition.value = `CSP`;
    // Render starting and ending markers
    mapView.renderMarker(workoutEdited.startCoords, 1);
    mapView.renderMarker(workoutEdited.endCoords, 2);
    // Remove popup marker
    mapView.removeMarkersEdit(workoutEdited);
    // Display workout path
    await mapView.renderPath(
      workoutEdited.startCoords,
      workoutEdited.endCoords
    );
    // Show data on form
    mapView.fetchInputData();
    // Get edited workout's index
    model.state.editIndex = workoutEditedIndex;
  }

  async deleteWorkout(e, workouts) {
    const workoutEl = e.target.closest('.workout');
    const workoutDeleted = workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    const workoutDeletedIndex = workouts.findIndex(
      work => work.id === workoutEl.dataset.id
    );
    const markerDeletedIndex = model.markers.findIndex(
      marker => marker.id === workoutEl.dataset.id
    );
    workoutEl.remove();
    // Remove workout marker from map
    mapView.removeMarkersEdit(workoutDeleted);
    // Remove workout path
    await mapView.removeSetUpMarker();
    // Clear workout marker from data
    model.markers.splice(markerDeletedIndex, 1);
    workouts.splice(workoutDeletedIndex, 1);
    // Center View to current position
    await mapView.showYourLocation();
  }
}

export default new workoutsView();
