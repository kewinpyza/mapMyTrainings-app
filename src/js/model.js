import { async } from 'regenerator-runtime';
import { AJAX } from './helpers';
import { WEATHER_API_KEY } from './config';

export const state = {
  map: {},
  workoutData: {},
};

export const getPosition = async function () {
  return new Promise((resolve, reject) => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const { latitude: lat, longitude: lng } = pos.coords;
          const coords = [lng, lat];
          state.map.currentPosition = coords;
          resolve(coords);
        });
      }
    } catch (err) {
      throw err;
    }
  });
};

export const getLocation = async function () {
  try {
    const [lat, lng] = state.map.currentPosition;
    const geoData = await AJAX(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      `If some error occurs, just try to reload the page again. I'm using this API for free, so there can be a data fetch limit at once.`
    );
    state.workoutData.locationCountry = geoData.address.country;
    state.workoutData.locationCity = geoData.address.city;
    state.workoutData.locationName = geoData.address.city_district;
  } catch (err) {
    throw err;
  }
};

export const getWeather = async function () {
  try {
    const [lat, lng] = state.map.currentPosition;
    const weatherData = await AJAX(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat}, ${lng}`,
      'There was some error to load data from from openWeatherMap API!'
    );
    state.workoutData.weatherIcon = weatherData.current.condition.icon;
    state.workoutData.weatherText = weatherData.current.condition.text;
  } catch (err) {
    throw err;
  }
};

const controlBtns = document.querySelectorAll('.controls__btn');
const controls = document.querySelector('body');

export const createSpanEffect = function () {
  controlBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      console.log(e);
      console.log(e.clientX);
      console.log(e.clientY);
      let x = e.offsetX + 'px';
      // console.log(x);
      let y = e.offsetY + 'px';
      // console.log(y);

      const spanEffect = document.createElement('span');
      spanEffect.classList.add('span-effect');
      spanEffect.style.left = x;
      spanEffect.style.top = y;

      btn.append(spanEffect);
    });
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
  constructor(coords, duration, distance, cadence) {
    super(coords, duration);
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
  constructor(coords, duration, distance, elevationGain) {
    super(coords, duration);
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
