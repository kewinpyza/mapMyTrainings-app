import { AJAX } from './helpers';

export const state = {
  map: {},
};

export const getPosition = async function () {
  return new Promise((resolve, reject) => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const { latitude, longitude } = pos.coords;
          const coords = [latitude, longitude];
          state.map.currentPosition = coords;
          resolve(coords);
        });
      }
    } catch (err) {
      console.error(err);
    }
  });
};

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, kcal, duration) {
    this.coords = coords; // [lat, lng]
    this.kcal = kcal;
    this.duration = duration; // in min
  }

  _setDateDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.dateDescription = `${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, kcal, duration, distance, cadence) {
    super(coords, kcal, duration);
    this.distance = distance; // in km
    this.cadence = cadence;
    this.calcPace();
    this._setDateDescription();
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
    this._setDateDescription();
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
    this._setDateDescription();
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
    this._setDateDescription();
  }
}

// Local Storage
export const setLocalStorage = function (workouts) {
  localStorage.setItem('workouts', JSON.stringify(workouts));
};

export const getLocalStorage = function () {
  const data = JSON.parse(localStorage.getItem('workouts'));

  if (!data) return;
  state.workouts = data;
};

const clearData = function () {
  localStorage.removeItem('workouts');
  location.reload();
};
