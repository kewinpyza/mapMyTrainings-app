import { async } from 'regenerator-runtime';
import { AJAX } from './helpers';
import { WEATHER_API_KEY } from './config';

export const state = {
  map: {},
  time: {
    start: {},
    end: {},
  },
  location: {},
  weather: {},
  edit: false,
};
export const workouts = [];
export const markers = [];
export const bookmarks = [];

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

export const getLocation = async (coords, pos = 'starter') => {
  try {
    const [lng, lat] = coords;
    const geoData = await AJAX(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      `If some error occurs, just try to reload the page again. I'm using this API for free, so there can be a data fetch limit at once.`
    );
    if (pos === 'starter') {
      state.location.starterLocationStreet = geoData.address.city_district;
      state.location.starterLocationCity = geoData.address.city;
      state.location.starterLocationCountry = geoData.address.country;
    }
    if (pos === 'end') {
      state.location.endLocationStreet = geoData.address.city_district;
      state.location.endLocationCity = geoData.address.city;
      state.location.endLocationCountry = geoData.address.country;
    }
  } catch (err) {
    throw err;
  }
};

export const getWeather = async coords => {
  try {
    const [lat, lng] = coords;
    const weatherData = await AJAX(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lng}, ${lat}`,
      'There was some error to load data from from openWeatherMap API!'
    );
    state.weather.icon = weatherData.current.condition.icon;
    state.weather.iconText = weatherData.current.condition.text;
    state.weather.temp = weatherData.current.temp_c;
    console.log(weatherData);
  } catch (err) {
    throw err;
  }
};

const controlBtns = document.querySelectorAll('.controls__btn');
const controls = document.querySelector('body');

export const createSpanEffect = function () {
  controlBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      let x = e.offsetX + 'px';
      let y = e.offsetY + 'px';

      const spanEffect = document.createElement('span');
      spanEffect.classList.add('span-effect');
      spanEffect.style.left = x;
      spanEffect.style.top = y;

      btn.append(spanEffect);
    });
  });
};

export const addTimeToPopup = async (min, date) => {
  let durationMs = +min * 60 * 1000;
  let currentTime = date ? date : Date.now();
  state.time.start.workoutMs = currentTime;
  let endWorkoutTime = currentTime + durationMs;
  state.time.end.workoutMs = endWorkoutTime;
  let startDate = new Date(currentTime);
  let endDate = new Date(endWorkoutTime);

  let startMinutes =
    startDate.getSeconds() < 31
      ? (startDate.getMinutes() + '').padStart(2, 0)
      : (startDate.getMinutes() + 1 + '').padStart(2, 0);
  let endMinutes =
    endDate.getSeconds() < 31
      ? (endDate.getMinutes() + '').padStart(2, 0)
      : (endDate.getMinutes() + 1 + '').padStart(2, 0);

  // prettier-ignore
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  state.time.start.workoutDate = `${
    months[startDate.getMonth()]
  } ${startDate.getDate()}`;
  state.time.start.workoutTime = `${startDate.getHours()}:${startMinutes}`;

  state.time.end.workoutDate = `${
    months[endDate.getMonth()]
  } ${startDate.getDate()}`;
  state.time.end.workoutTime = `${endDate.getHours()}:${endMinutes}`;
};

export class Workout {
  _date = new Date();
  // Creating workout ID as last 12 numbers from date
  _id = (Date.now() + '').slice(-12);

  constructor(startCoords, endCoords, duration, distance, time, weather) {
    this.id = this._id;
    this.startCoords = startCoords; // [lat, lng]
    this.endCoords = endCoords; // [lat, lng]
    this.duration = duration; // in min
    this.distance = distance; // in km
    this.time = time;
    this.weather = weather;
  }

  _setDateDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${
      this._type[0].toUpperCase() + this._type.slice(1)
    } on ${months[this._date.getMonth()]} ${this._date.getDate()}`;
  }
}

export class Running extends Workout {
  _type = 'running';
  constructor(
    startCoords,
    endCoords,
    duration,
    distance,
    time,
    weather,
    cadence
  ) {
    super(startCoords, endCoords, duration, distance, time, weather);
    this.cadence = cadence;
    this.calcPace();
    this._setDateDescription();
    this.type = this._type;
  }

  calcPace() {
    // min/km
    this.pace = parseFloat((this.duration / this.distance).toFixed(1));
    return this.pace;
  }
}

export class Cycling extends Workout {
  _type = 'cycling';
  constructor(
    startCoords,
    endCoords,
    duration,
    distance,
    time,
    weather,
    elevationGain
  ) {
    super(startCoords, endCoords, duration, distance, time, weather);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDateDescription();
    this.type = this._type;
  }

  calcSpeed() {
    // km/h
    this.speed = parseFloat((this.distance / (this.duration / 60)).toFixed(1));
    return this.speed;
  }
}

// Bookmark most liked workouts
export const bookmarkMostLikedWorkout = (e, workouts, bookmarks) => {
  const workoutEl = e.target.closest('.workout');
  if (!workoutEl) return;
  const bookmarkClick = e.target.closest('.workout__title');
  if (!bookmarkClick) return;
  const workout = workouts.find(work => work.id === workoutEl.dataset.id);
  const isBookmarked = bookmarkClick.classList.contains('bookmark');

  if (!isBookmarked) {
    bookmarkClick.classList.add('bookmark');
    workout.bookmarks = true;
    bookmarks.push(workout);
  } else {
    workout.bookmarks = false;
    bookmarkClick.classList.remove('bookmark');
    const workoutIndex = bookmarks.findIndex(
      work => work.id === workoutEl.dataset.id
    );
    bookmarks.splice(workoutIndex, 1);
  }
};

// Local Storage
export const setLocalStorage = function (workouts) {
  localStorage.setItem('workouts', JSON.stringify(workouts));
};

export const getLocalStorage = function () {
  const data = JSON.parse(localStorage.getItem('workouts'));

  if (!data) return;
  state.workouts = data;
};

export const clearData = function () {
  localStorage.removeItem('workouts');
  location.reload();
};
