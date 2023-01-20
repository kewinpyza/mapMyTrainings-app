'use strict';
import { async } from 'regenerator-runtime';
import 'core-js/stable';
import 'leaflet';

import * as model from './model';
import mapView from './views/mapView';

const controlMap = async function () {
  // Get user position and location
  await model.getPosition();
  await model.getLocation();
  // Get weather location
  await model.getWeather();

  // Render Map
  mapView.renderMap(model.state.map);
};

const init = function () {
  controlMap();
};
init();
