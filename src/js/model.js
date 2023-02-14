import 'regenerator-runtime/runtime';
import { AJAX } from './helpers';
import { WEATHER_API_KEY } from './config';

export const state = {
  map: {},
  time: {},
  location: {},
  weather: {},
  edit: false,
  sortOption: false,
  sortType: 'All',
};
export let workouts = [];
export let markers = [];
export let bookmarks = [];

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
      console.log(geoData.address);
      state.location.starterLocationStreet = geoData.address.road
        ? geoData.address.road
        : geoData.address.municipality
        ? geoData.address.municipality
        : geoData.address.county;
      state.location.starterLocationCity = geoData.address.city
        ? geoData.address.city
        : geoData.address.town
        ? geoData.address.town
        : geoData.address.village
        ? geoData.address.village
        : geoData.address.municipality;
      state.location.starterLocationCountry = geoData.address.country;
    }
    if (pos === 'end') {
      console.log(geoData.address);
      state.location.endLocationStreet = geoData.address.road
        ? geoData.address.road
        : geoData.address.municipality
        ? geoData.address.municipality
        : geoData.address.county;
      state.location.endLocationCity = geoData.address.city
        ? geoData.address.city
        : geoData.address.town
        ? geoData.address.town
        : geoData.address.village
        ? geoData.address.village
        : geoData.address.municipality;
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
  } catch (err) {
    throw err;
  }
};

export const getWorkoutTime = async (min, date) => {
  // prettier-ignore
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const inputTime = document.querySelector('.form__input--time');
  // Convert workout duration on ms and create variables
  let durationMs = +min * 60 * 1000;
  let currentTime, endWorkoutTime, startDate, endDate, startMinutes, endMinutes;

  // Set current time accroding to input type
  if (inputTime.type === 'text' || !inputTime.value)
    currentTime = date ? date : Date.now();
  else currentTime = +new Date(inputTime.value);

  endWorkoutTime = currentTime + durationMs;
  startDate = new Date(currentTime);
  endDate = new Date(endWorkoutTime);
  // Minutes to pattern 2 signs '00'
  startMinutes =
    startDate.getSeconds() < 31
      ? (startDate.getMinutes() + '').padStart(2, 0)
      : (startDate.getMinutes() + 1 + '').padStart(2, 0);
  endMinutes =
    endDate.getSeconds() < 31
      ? (endDate.getMinutes() + '').padStart(2, 0)
      : (endDate.getMinutes() + 1 + '').padStart(2, 0);
  // Get start/end workout date
  state.time.startWorkoutDate = `${startDate.getDate()} ${
    months[startDate.getMonth()]
  } '${(startDate.getFullYear() + '').slice(-2)}`;
  state.time.endWorkoutDate = `${endDate.getDate()} ${
    months[endDate.getMonth()]
  } '${(endDate.getFullYear() + '').slice(-2)}`;
  // Get start/end workout time
  state.time.startWorkout = `${startDate.getHours()}:${startMinutes}`;
  state.time.endWorkout = `${endDate.getHours()}:${endMinutes}`;
  // Save start/end of workout date in ms
  state.time.startWorkoutMs = currentTime;
  state.time.endWorkoutMs = endWorkoutTime;
};

export class Workout {
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
    this.description = `${
      this._type[0].toUpperCase() + this._type.slice(1)
    } on ${state.time.startWorkoutDate}`;
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
  const workout = workouts.find(w => w.id === workoutEl.dataset.id);
  const isBookmarked = bookmarkClick.classList.contains('bookmark');

  if (!isBookmarked) {
    bookmarkClick.classList.add('bookmark');
    workout.bookmarks = true;
    bookmarks.push(workout);
  } else {
    workout.bookmarks = false;
    bookmarkClick.classList.remove('bookmark');
    const workoutIndex = bookmarks.findIndex(
      w => w.id === workoutEl.dataset.id
    );
    bookmarks.splice(workoutIndex, 1);
  }
};

export const initialBookmarks = workouts => {
  workouts.forEach(workout => {
    if (workout.bookmarks) bookmarks.push(workout);
  });
  const workoutsOnLoad = [...document.querySelectorAll('.workout')];
  let bookmarkedWorkouts = [];
  bookmarkedWorkouts = bookmarks.map(workout => workout.id);
  let bookmarksOnLoad = workoutsOnLoad.filter(workout =>
    bookmarkedWorkouts.includes(workout.dataset.id)
  );
  bookmarksOnLoad.forEach(bookmark =>
    bookmark.querySelector('.workout__title').classList.add('bookmark')
  );
};

// Local Storage
export const setLocalStorage = workouts =>
  localStorage.setItem('workouts', JSON.stringify(workouts));

export const getLocalStorage = () => {
  const data = JSON.parse(localStorage.getItem('workouts'));
  if (!data) return;
  workouts = data;
};
