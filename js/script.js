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
  constructor(coords, kcal, duration) {
    super(coords, kcal, duration);
  }
}

const run1 = new Running([39, -12], 384, 38, 6.4, 208);
const cycling1 = new Cycling([56, -15], 485, 94, 40, 680);
const swimming1 = new Swimming([39, 12], 820, 48, 3.8);
const gym1 = new Gym([28, 11], 320, 95);
console.log(run1, cycling1, swimming1, gym1);

////////////////////////////////////
// APPLICATION ARCHITECTURE
///////////////////////////////////

class App {
  #map;
  #mapEvent;

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
    if (inputType.value === 'running') {
      inputCadence.closest('.form-row').classList.remove('form-row-hidden');
      inputElevation.closest('.form-row').classList.add('form-row-hidden');
      inputDistance.closest('.form-row').classList.remove('form-row-hidden');
      inputTraining.closest('.form-row').classList.add('form-row-hidden');
    }
    if (inputType.value === 'cycling') {
      inputCadence.closest('.form-row').classList.add('form-row-hidden');
      inputElevation.closest('.form-row').classList.remove('form-row-hidden');
      inputDistance.closest('.form-row').classList.remove('form-row-hidden');
      inputTraining.closest('.form-row').classList.add('form-row-hidden');
    }
    if (inputType.value === 'swimming') {
      inputCadence.closest('.form-row').classList.add('form-row-hidden');
      inputElevation.closest('.form-row').classList.add('form-row-hidden');
      inputDistance.closest('.form-row').classList.remove('form-row-hidden');
      inputTraining.closest('.form-row').classList.add('form-row-hidden');
    }
    if (inputType.value === 'gym') {
      inputCadence.closest('.form-row').classList.add('form-row-hidden');
      inputElevation.closest('.form-row').classList.add('form-row-hidden');
      inputDistance.closest('.form-row').classList.add('form-row-hidden');
      inputTraining.closest('.form-row').classList.remove('form-row-hidden');
    }
  }

  _newWorkout(e) {
    e.preventDefault();

    // Clear inputs
    inputKcal.value =
      inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';

    // Display the marker
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 240,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

const app = new App();
