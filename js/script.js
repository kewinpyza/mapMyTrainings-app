'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
}

class Running extends Workout {
  type = 'running';
  constructor(coords, kcal, duration, distance, cadence) {
    super(coords, kcal, duration);
    this.distance = distance; // in km
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
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
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class Swimming extends Workout {
  type = 'swimming';
  constructor(coords, kcal, duration, distance) {
    super(coords, kcal, duration);
    this.distance = distance; // in km
    this.calcPace();
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
  }
}

////////////////////////////////////
// APPLICATION ARCHITECTURE
///////////////////////////////////

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._changeInputType.bind(this));
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

    this.#map = L.map('mappy').setView(coords, 13);

    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDuration.focus();
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
    console.log(workout);

    // Render workout as marker on map
    this.renderWorkoutMarker(workout);

    // Render workout on list

    // Hide form + Clear inputs
    const clearInputs = [
      inputKcal,
      inputDistance,
      inputCadence,
      inputElevation,
      inputDuration,
    ];
    clearInputs.forEach(inp => (inp.value = ''));
    form.classList.add('hidden');
  }

  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 240,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

const app = new App();
