'use strict';
import * as model from './model';
import mapView from './views/mapView';
import 'core-js/stable';
import { async } from 'regenerator-runtime';

const controlMap = async function () {
  try {
    // Get user position and location
    await model.getPosition();
    await model.getLocation();
    // Get weather location
    await model.getWeather();

    // Render Map
    mapView.renderMap(model.state.map);
  } catch (err) {
    mapView.renderError(err);
  }
};

const init = function () {
  controlMap();
};
init();
