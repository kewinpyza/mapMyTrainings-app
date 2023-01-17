'use strict';

// DOM Variables
const form = document.querySelector('.form');
const workoutsContainer = document.querySelector('.workouts');
const inputType = document.querySelector('.form-input-type');
const inputDistance = document.querySelector('.form-input-distance');
const inputDuration = document.querySelector('.form-input-duration');
const inputCadence = document.querySelector('.form-input-cadence');
const inputElevation = document.querySelector('.form-input-elevation');
const inputKcal = document.querySelector('.form-input-kcal');
const inputTraining = document.querySelector('.form-input-training');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, kcal, duration) {
    this.coords = coords; // [lat, lng]
    this.kcal = kcal;
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} ${
      this.type === 'gym' ? '(' + this.trainingType + ')' : ''
    } on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, kcal, duration, distance, cadence) {
    super(coords, kcal, duration);
    this.distance = distance; // in km
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = parseFloat((this.duration / this.distance).toFixed(1));
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, kcal, duration, distance, elevationGain) {
    super(coords, kcal, duration);
    this.distance = distance; // in km
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = parseFloat((this.distance / (this.duration / 60)).toFixed(1));
    return this.speed;
  }
}

class Swimming extends Workout {
  type = 'swimming';
  constructor(coords, kcal, duration, distance) {
    super(coords, kcal, duration);
    this.distance = distance; // in km
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    const swimmingSpeed = (this.duration * 60) / ((this.distance * 1000) / 50);
    this.speed = parseFloat(swimmingSpeed.toFixed(2));
  }
}

class Gym extends Workout {
  type = 'gym';
  constructor(coords, kcal, duration, training) {
    super(coords, kcal, duration);
    this.training = training;
    this.trainingType = training[0].toUpperCase() + training.slice(1);
    this._setDescription();
  }
}

////////////////////////////////////
// APPLICATION ARCHITECTURE
///////////////////////////////////

class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #workouts = [];

  constructor() {
    // Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._changeInputType);
    workoutsContainer.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('Cannot get your position')
      );
    }
  }

  _loadMap(pos) {
    const { latitude, longitude } = pos.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('mappy').setView(coords, this.#mapZoomLevel);

    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDuration.focus();
  }

  _hideForm() {
    // Make inputs empty
    const clearInputs = [
      inputKcal,
      inputDistance,
      inputCadence,
      inputElevation,
      inputDuration,
    ];
    clearInputs.forEach(inp => (inp.value = ''));
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _changeInputType() {
    const type = inputType.value;
    if (type === 'running') {
      inputCadence.closest('.form-row').classList.remove('form-row-hidden');
      inputElevation.closest('.form-row').classList.add('form-row-hidden');
      inputDistance.closest('.form-row').classList.remove('form-row-hidden');
      inputTraining.closest('.form-row').classList.add('form-row-hidden');
    }
    if (type === 'cycling') {
      inputCadence.closest('.form-row').classList.add('form-row-hidden');
      inputElevation.closest('.form-row').classList.remove('form-row-hidden');
      inputDistance.closest('.form-row').classList.remove('form-row-hidden');
      inputTraining.closest('.form-row').classList.add('form-row-hidden');
    }
    if (type === 'swimming') {
      inputCadence.closest('.form-row').classList.add('form-row-hidden');
      inputElevation.closest('.form-row').classList.add('form-row-hidden');
      inputDistance.closest('.form-row').classList.remove('form-row-hidden');
      inputTraining.closest('.form-row').classList.add('form-row-hidden');
    }
    if (type === 'gym') {
      inputCadence.closest('.form-row').classList.add('form-row-hidden');
      inputElevation.closest('.form-row').classList.add('form-row-hidden');
      inputDistance.closest('.form-row').classList.add('form-row-hidden');
      inputTraining.closest('.form-row').classList.remove('form-row-hidden');
    }
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const calories = +inputKcal.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let distance;
    let workout;

    // Create running object if workout is running
    if (type === 'running') {
      const cadence = +inputCadence.value;
      distance = +inputDistance.value;
      // Check if data is correct
      if (
        !validInputs(distance, duration, calories, cadence) ||
        !allPositive(distance, duration, calories, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], calories, duration, distance, cadence);
    }

    // Create cycling object if workout is cycling
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      distance = +inputDistance.value;
      // Check if data is correct
      if (
        !validInputs(distance, duration, calories, elevation) ||
        !allPositive(distance, duration, calories)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling(
        [lat, lng],
        calories,
        duration,
        distance,
        elevation
      );
    }

    // Create swimming object if workout is swimming
    if (type === 'swimming') {
      distance = +inputDistance.value;
      // Check if data is correct
      if (
        !validInputs(distance, duration, calories) ||
        !allPositive(distance, duration, calories)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Swimming([lat, lng], calories, duration, distance);
    }

    // Create gym object if workout is gym
    if (type === 'gym') {
      const training = inputTraining.value;
      // Check if data is correct
      if (!validInputs(duration, calories) || !allPositive(duration, calories))
        return alert('Inputs have to be positive numbers!');

      workout = new Gym([lat, lng], calories, duration, training);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout as marker on map
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + Clear inputs
    this._hideForm();

    // Set the local storage to all workouts
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${
          workout.type === 'running'
            ? '🏃‍♂️'
            : workout.type === 'cycling'
            ? '🚴‍♂️'
            : workout.type === 'swimming'
            ? '🏊‍♂️'
            : '🏋️‍♂️'
        } ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    if (workout.type === 'gym') {
      const htmlGym = `
      <li class="workout workout-${workout.type}" data-id="${workout.id}">
        <h2 class="workout-title">Gym Exercising on September 13</h2>
        <div class="workout-info">
          <span class="workout-icon">🏋️‍♂️</span>
          <span class="workout-value">${workout.trainingType}</span>
        </div>
        <div class="workout-info">
          <span class="workout-icon">⏱</span>
          <span class="workout-value">${workout.duration}</span>
          <span class="workout-unit">min</span>
        </div>
        <div class="workout-info">
          <span class="workout-icon">🔥</span>
          <span class="workout-value">${workout.kcal}</span>
          <span class="workout-unit">kcal</span>
        </div>
      </li>
    `;
      form.insertAdjacentHTML('afterend', htmlGym);
    } else {
      const cycleOrSwimIcon = workout.type === 'cycling' ? '🚴‍♂️' : '🏊‍♂️';
      let html = `
      <li class="workout workout-${workout.type}" data-id="${workout.id}">
        <h2 class="workout-title">${workout.description}</h2>
        <div class="workout-info">
          <span class="workout-icon">${
            workout.type === 'running' ? '🏃‍♂️' : cycleOrSwimIcon
          }</span>
          <span class="workout-value">${workout.distance}</span>
          <span class="workout-unit">km</span>
        </div>
        <div class="workout-info">
          <span class="workout-icon">⏱</span>
          <span class="workout-value">${workout.duration}</span>
          <span class="workout-unit">min</span>
        </div>
        <div class="workout-info">
          <span class="workout-icon">🔥</span>
          <span class="workout-value">${workout.kcal}</span>
          <span class="workout-unit">kcal</span>
        </div>
  `;
      if (workout.type === 'running') {
        html += `
        <div class="workout-info">
          <span class="workout-icon">⚡</span>
          <span class="workout-value">${workout.pace}</span>
          <span class="workout-unit">min/km</span>
        </div>
        <div class="workout-info">
          <span class="workout-icon">🦶</span>
          <span class="workout-value">${workout.cadence}</span>
          <span class="workout-unit">spm</span>
        </div>
      </li>
        `;
      }
      if (workout.type === 'cycling') {
        html += `
        <div class="workout-info">
          <span class="workout-icon">⚡</span>
          <span class="workout-value">${workout.speed}</span>
          <span class="workout-unit">km/h</span>
        </div>
        <div class="workout-info">
          <span class="workout-icon">⛰</span>
          <span class="workout-value">${workout.elevationGain}</span>
          <span class="workout-unit">m</span>
        </div>
      </li>
      `;
      }
      if (workout.type === 'swimming') {
        html += `
        <div class="workout-info">
          <span class="workout-icon">⚡</span>
          <span class="workout-value">${workout.speed}</span>
          <span class="workout-unit">s/50m</span>
        </div>
      </li>
      `;
      }

      form.insertAdjacentHTML('afterend', html);
    }
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  clearData() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
