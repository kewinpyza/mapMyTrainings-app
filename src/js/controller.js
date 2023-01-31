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
    await mapView.renderMap(model.state.map);
  } catch (err) {
    mapView.renderError(err);
  }
};

const controlForm = async function () {
  try {
    let createNewWorkout;
    Object.assign(model.state, formView.getFormValues());
    await model.getWeather(model.state.map.pathStart);
    model.addTimeToPopup(model.state.duration);
    console.log(model.state.type);
    workoutsView.newWorkout(
      model.Running,
      model.Cycling,
      model.state,
      model.workouts
    );
    createNewWorkout = model.workouts[model.workouts.length - 1];
    await model.getLocation(createNewWorkout.startCoords);
    await model.getLocation(createNewWorkout.endCoords, 'end');
    createNewWorkout.location = { ...model.state.location };
    workoutsView.renderWorkout(createNewWorkout);
  } catch (err) {
    mapView.renderError(err);
  }
};

// const controlWorkout = async function () {
//   try {
//     // await console.log('Elo');
//   } catch (err) {
//     mapView.renderError(err);
//   }
// };

const init = async () => {
  await controlMap();
  model.createSpanEffect();
  formView.renderForm(controlForm);
  // workoutsView.renderWorkout(controlWorkout);
};
init();
