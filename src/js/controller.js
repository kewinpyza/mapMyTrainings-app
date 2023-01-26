'use strict';
import * as model from './model';
import mapView from './views/mapView';
import formView from './views/formView';
import workoutsView from './views/workoutsView';
import 'core-js/stable';
import { async } from 'regenerator-runtime';

const controlMap = async function () {
  try {
    // Get user position
    await model.getPosition();
    // await model.getLocation();
    // Get weather location
    // await model.getWeather();

    // Render Map
    mapView.renderMap(model.state.map);
  } catch (err) {
    mapView.renderError(err);
  }
};

const controlForm = async function () {
  try {
    await console.log('Everything is working fine');
  } catch (err) {
    mapView.renderError(err);
  }
};

const controlWorkout = async function () {
  try {
  } catch (err) {
    mapView.renderError(err);
  }
};

const init = function () {
  controlMap();
  model.createSpanEffect();
  formView.renderForm(controlForm);
  // workoutsView.renderWorkout(controlWorkout);
};
init();
