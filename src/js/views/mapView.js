import { MAP_ZOOM_LEVEL } from '../config';
import { AJAX } from '../helpers';
import View from './View';
// import markerIcon from 'url:../../images/marker.png';

class mapView extends View {
  #mapData;
  #accessToken;
  #clickCount = 0;
  #workoutMarker;
  #pathData;

  #map = document.querySelector('#map');
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
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: this.#accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });

    // Add handle click events on map
    this.#map.on('load', () => {
      // Add starting pin location on map
      this._renderStartingPin(this.#mapData.currentPosition);
      // Add geocoder to map
      this.#map.addControl(geocoder);
      // Add full screen control on map
      this.#map.addControl(new mapboxgl.FullscreenControl());
      // Add zoom and rotation controls to the map
      this.#map.addControl(new mapboxgl.NavigationControl());
      // Disables the "double click to zoom" interaction
      this.#map.doubleClickZoom.disable();
    });
    this.#map.on('click', this._showForm.bind(this));

    // Render 3D building to map
    this._showBuildings3D();
  }

  _showBuildings3D() {
    this.#map.on('style.load', () => {
      // Insert the layer beneath any symbol layer.
      const layers = this.#map.getStyle().layers;
      const labelLayerId = layers.find(
        layer => layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      this.#map.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      );
    });
  }

  async _showForm(mapEvent) {
    let timeout;
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

    this.#pathData = await AJAX(
      url,
      'There was some error to render a path :('
    );

    const data = this.#pathData.routes[0];
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
