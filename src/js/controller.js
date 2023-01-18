'use strict';
import { async } from 'regenerator-runtime';
import 'core-js/stable';
import 'leaflet';

import * as model from './model';
import mapView from './views/mapView';

const controlMap = async function () {
  // Get user position
  await model.getPosition();

  // Render Map
  mapView.render(model.state.map);
};

const init = function () {
  controlMap();
};
init();
