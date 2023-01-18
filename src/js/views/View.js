import 'regenerator-runtime';
import 'core-js/stable';
import 'leaflet';

export default class View {
  _errorWindow = document.querySelector('.error-window');
  _errorText = document.querySelector('.error-window__text');
  _errorBtn = document.querySelector('.error-window__btn-close');
  _overlay = document.querySelector('.overlay');
  _workoutsContainer = document.querySelector('.workouts');

  updateWorkout(markup) {}
}
