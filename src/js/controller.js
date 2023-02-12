'use strict';
import * as model from './model';
import mapView from './views/mapView';
import formView from './views/formView';
import workoutsView from './views/workoutsView';
import settingsDropdown from './views/settingsDropdown';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

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

const controlWorkout = () => {
  model.getLocalStorage();
  model.workouts.forEach(workout => {
    workoutsView.renderWorkout(workout);
    model.markers.push({
      id: workout.id,
      marker: mapView.addPopupToWorkout(workout, 1),
    });
  });
  model.initialBookmarks(model.workouts);
};

const controlForm = async function () {
  try {
    let createNewWorkout;
    // Add form values to current state
    Object.assign(model.state, formView.getFormValues());
    // Fetch weather from start location
    await model.getWeather(model.state.map.pathStart);
    // Add time to current state
    model.getWorkoutTime(model.state.duration);
    // Make new workout object
    workoutsView.newWorkout(
      model.Running,
      model.Cycling,
      model.state,
      model.workouts
    );
    // Keep workout marker at end position
    mapView.preserveMarker(model.state.map.pathEnd);
    // Remove markers and path from current workout
    await mapView.removeSetUpMarkers();

    createNewWorkout = model.workouts[model.workouts.length - 1];
    // Save start/end location on workout object
    await model.getLocation(createNewWorkout.startCoords);
    await model.getLocation(createNewWorkout.endCoords, 'end');
    createNewWorkout.location = { ...model.state.location };
    // Save workout marker and popup in markers array
    model.markers.push({
      id: createNewWorkout.id,
      marker: mapView.addPopupToWorkout(createNewWorkout, 1),
    });
    // Render workout with markup on app bar
    workoutsView.renderWorkout(createNewWorkout);
    // Save workout in local storage
    model.setLocalStorage(model.workouts);
  } catch (err) {
    mapView.renderError(err);
  }
};

const controlEditForm = async () => {
  try {
    let editingWorkout;
    // Add form values to current state
    Object.assign(model.state, formView.getFormValues());
    // Get weather info from edited workout
    model.state.weather = model.workouts[model.state.editIndex].weather;
    // Get data when workout start
    let startWorkout =
      model.workouts[model.state.editIndex].time.startWorkoutMs;
    // Add time to current state
    model.getWorkoutTime(model.state.duration, startWorkout);

    editingWorkout = workoutsView.newWorkout(
      model.Running,
      model.Cycling,
      model.state,
      model.workouts
    );
    // Change workout description
    editingWorkout.description = `${
      editingWorkout.type[0].toUpperCase() + editingWorkout.type.slice(1)
    } on ${editingWorkout.time.startWorkoutDate}`;
    // Get workout id
    editingWorkout.id = model.workouts[model.state.editIndex].id;
    // Keep workout marker at end position
    mapView.preserveMarker(model.state.map.pathEnd);
    // Remove markers and path from current workout
    await mapView.removeSetUpMarkers();
    // Save start/end location on workout object
    await model.getLocation(editingWorkout.startCoords);
    await model.getLocation(editingWorkout.endCoords, 'end');
    editingWorkout.location = { ...model.state.location };
    const workoutsArray = [...document.querySelectorAll('.workout')].reverse();
    // Replace editing workout with outdated
    model.workouts.splice(model.state.editIndex, 1, editingWorkout);
    let editMarker = {
      id: editingWorkout.id,
      marker: mapView.addPopupToWorkout(editingWorkout, 1),
    };
    const markerIndex = model.markers.findIndex(
      m => m.id === editingWorkout.id
    );
    // Replace new marker with outdated in markers array
    model.markers.splice(markerIndex, 1, editMarker);
    // Render workout element
    workoutsView.renderEditWorkout(editingWorkout, model.state.editIndex);
    // Remove outdated workout element
    workoutsArray[model.state.editIndex].remove();
    // Save workout in local storage
    model.setLocalStorage(model.workouts);
    delete model.state.editIndex;
    // update markup on load
    // workoutsView.updateMarkupOnMap();
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

const controlWorkoutView = async e => {
  try {
    await mapView.moveToWorkoutPosition(e, model.workouts);
  } catch (err) {
    mapView.renderError(err);
  }
};

const controlMostLiked = e => {
  model.bookmarkMostLikedWorkout(e, model.workouts, model.bookmarks);
  model.setLocalStorage(model.workouts);
};

const init = async () => {
  await controlMap();
  controlWorkout();
  model.createSpanEffect();
  formView.renderForm(controlForm, controlEditForm);
  workoutsView.handlerWorkout(controlWorkoutView);
  workoutsView.handlerMostLiked(controlMostLiked);
  settingsDropdown.hideSettingsDropdown(controlDropdown);
  settingsDropdown.showSettingsDropdown(controlDropdown);
  settingsDropdown.addHandlerSettings(controlSettings);
};
init();
