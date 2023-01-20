import { async } from 'regenerator-runtime';
import 'core-js/stable';
import 'leaflet';
import { AJAX } from '../helpers';
// import markerIcon from 'url:../../images/marker.png';

import { MAP_ZOOM_LEVEL, MAX_ZOOM_MAP } from '../config';

class mapView {
  #mapData;
  #accessToken;
  #map = document.querySelector('#map');
  #form = document.querySelector('.form');

  renderMap(mapData) {
    this.#mapData = mapData;
    mapboxgl.accessToken =
      'pk.eyJ1IjoiamFzb25jb2Rpbmc3MjMiLCJhIjoiY2tvN2FlcmF6MW1raDJvbHJhN2ptMG01NCJ9.ZDZ7zl030QE1REiaDIYWnQ';
    this.#accessToken = mapboxgl.accessToken;
    const reversedPosition = this.#mapData.currentPosition.slice().reverse(); // from [lat, lng] to [lng, lat]

    this.#map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: reversedPosition, // starting position [lng, lat]
      zoom: MAP_ZOOM_LEVEL, // starting zoom
    });

    this.#map.on('load', () => {
      this.#map.addLayer({
        id: 'rpd_parks',
        type: 'fill',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.3o7ubwm8',
        },
        'source-layer': 'RPD_Parks',
      });
    });
  }

  // async showForm(mapEvent) {
  //   this.#form.classList.remove('hidden');
  // }
}

export default new mapView();
