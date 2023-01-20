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
  #clickCount = 0;
  #workoutMarker;

  _form = document.querySelector('.form');

  renderMap(mapData) {
    this.#mapData = mapData;
    mapboxgl.accessToken =
      'pk.eyJ1IjoiamFzb25jb2Rpbmc3MjMiLCJhIjoiY2tvN2FlcmF6MW1raDJvbHJhN2ptMG01NCJ9.ZDZ7zl030QE1REiaDIYWnQ';
    this.#accessToken = mapboxgl.accessToken;

    this.#map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.#mapData.currentPosition, // starting position [lng, lat]
      zoom: MAP_ZOOM_LEVEL, // starting zoom
    });

    const geocoder = new MapboxGeocoder({
      accessToken: this.#accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });

    // Add starting pin location on map
    this._renderStartingPin(this.#mapData.currentPosition);

    // Add a geocoder to map
    this.#map.addControl(geocoder);
    // Add full screen control on map
    this.#map.addControl(new mapboxgl.FullscreenControl());
    // Add zoom and rotation controls to the map
    this.#map.addControl(new mapboxgl.NavigationControl());

    // Disables the "double click to zoom" interaction
    this.#map.doubleClickZoom.disable();
    // Handle click on map to show input form and marker
    this.#map.on('click', this._showForm.bind(this));
  }

  async _showForm(mapEvent) {
    let timeout = [];
    this.#clickCount++;

    if (this.#clickCount === 1) {
      timeout = setTimeout(() => {
        this.#clickCount = 0;
      }, 300);
    }
    if (this.#clickCount === 2) {
      clearTimeout(timeout);
      this._form.classList.remove('hidden');

      // Add destination coords to #mapData
      const { lat, lng } = mapEvent.lngLat;
      const destinationCoords = [lng, lat];
      this.#mapData.destinationCoords = destinationCoords;

      // Render marker on map and path
      this._updateWorkoutMarker(this.#mapData.destinationCoords);
      this._renderPath(
        this.#mapData.currentPosition,
        this.#mapData.destinationCoords
      );

      this.#clickCount = 0;
    }
  }

  async _renderPath(startPoint, endPoint) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${
      startPoint[0]
    },${startPoint[1]};${endPoint[0]},${
      endPoint[1]
    }?geometries=geojson&access_token=${this.#accessToken}`;

    const directionData = await AJAX(
      url,
      'There was some error to render a path :('
    );

    const data = directionData.routes[0];
    const route = data.geometry.coordinates;
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route,
      },
    };
    // Using setData to reset, if the route already exists on the map
    if (this.#map.getSource('route')) {
      this.#map.getSource('route').setData(geojson);
    }
    // Otherwise, make a new request
    else {
      this.#map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson,
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#1054AE',
          'line-width': 4,
          'line-opacity': 0.7,
        },
      });
    }
  }

  _updateWorkoutMarker(coords) {
    if (!this.#workoutMarker) {
      this._renderWorkoutMarker(coords);
    } else {
      this.#workoutMarker.remove();
      this._renderWorkoutMarker(coords);
    }
  }

  _renderStartingPin(coords) {
    const startingMarkerEl = document.createElement('div');
    startingMarkerEl.className = 'starterPin';
    new mapboxgl.Marker(startingMarkerEl).setLngLat(coords).addTo(this.#map);
  }

  _renderWorkoutMarker(coords) {
    let markerIcon = document.createElement('div');
    markerIcon.className = 'markerIcon';

    const markerOptions = {
      element: markerIcon,
      draggable: true,
      offset: [0, -25],
    };

    this.#workoutMarker = new mapboxgl.Marker(markerOptions)
      .setLngLat(coords)
      .addTo(this.#map);

    this.#workoutMarker.on('dragend', this._getDragPosition.bind(this));
  }

  _getDragPosition(e) {
    const { lng, lat } = e.target._lngLat;
    this.#mapData.destinationCoords = [lng, lat];
    this._renderPath(
      this.#mapData.currentPosition,
      this.#mapData.destinationCoords
    );
  }
}

export default new mapView();

// this.#map.on('load', () => {
//   this.#map.addLayer({
//     id: 'rpd_parks',
//     type: 'fill',
//     source: {
//       type: 'vector',
//       url: 'mapbox://mapbox.3o7ubwm8',
//     },
//     'source-layer': 'RPD_Parks',
//     layout: {
//       visibility: 'visible',
//     },
//     paint: {
//       'fill-color': 'rgba(61,153,80,0.55)',
//     },
//   });
// });
