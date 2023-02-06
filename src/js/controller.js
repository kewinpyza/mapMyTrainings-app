'use strict';
import * as model from './model';
import mapView from './views/mapView';
import formView from './views/formView';
import workoutsView from './views/workoutsView';
import settingsDropdown from './views/settingsDropdown';
import 'core-js/stable';
import { async } from 'regenerator-runtime';

const controlMap = async function () {
  try {
    // Get user position
    await model.getPosition();
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
    workoutsView.newWorkout(
      model.Running,
      model.Cycling,
      model.state,
      model.workouts
    );
    mapView.preserveMarker(model.state.map.pathEnd);
    await mapView.removeSetUpMarker();
    createNewWorkout = model.workouts[model.workouts.length - 1];
    await model.getLocation(createNewWorkout.startCoords);
    await model.getLocation(createNewWorkout.endCoords, 'end');
    createNewWorkout.location = { ...model.state.location };
    createNewWorkout.Marker = mapView.addPopupToWorkout(createNewWorkout, 1);
    model.markers.push({
      id: createNewWorkout.id,
      marker: createNewWorkout.Marker,
    });
    workoutsView.renderWorkout(createNewWorkout);
  } catch (err) {
    mapView.renderError(err);
  }
};

const controlEditForm = async () => {
  try {
  } catch (err) {
    mapView.renderError(err);
  }
};

const controlDropdown = e => {
  settingsDropdown.showSettingsContainer(e);
  settingsDropdown.hideDropdownClickOutside(e);
};

const controlSettings = (e, element) => {
  if (!element) return;
  if (element.classList.contains('edit')) {
    model.state.edit = true;
    workoutsView.editWorkout(e, model.workouts);
  }
  if (element.classList.contains('delete')) {
    workoutsView.deleteWorkout(e, model.workouts);
  }
};

const controlWorkoutView = e => {
  try {
    mapView.moveToWorkoutPosition(e, model.workouts);
  } catch (err) {
    mapView.renderError(err);
  }
};

const controlMostLiked = e => {
  model.bookmarkMostLikedWorkout(e, model.workouts, model.bookmarks);
};

const init = async () => {
  await controlMap();
  model.createSpanEffect();
  formView.renderForm(controlForm, controlEditForm);
  workoutsView.handlerWorkout(controlWorkoutView);
  workoutsView.handlerMostLiked(controlMostLiked);
  settingsDropdown.hideSettingsDropdown(controlDropdown);
  settingsDropdown.showSettingsDropdown(controlDropdown);
  settingsDropdown.addHandlerSettings(controlSettings);
};
init();
