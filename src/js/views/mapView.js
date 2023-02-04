import { MAP_ZOOM_LEVEL } from '../config';
import { AJAX } from '../helpers';
import View from './View';
// import markerIcon from 'url:../../images/marker.png';

class mapView extends View {
  #mapData;
  #accessToken;
  #clickCount = 0;
  #pathData;
  #myMarker;
  #startMarker;
  #startMarkerPopup;
  #preserveMarker;

  #map = document.querySelector('#map');
  #form = document.querySelector('.form');
  #starterPosition = document.querySelector('.form__input--position-type');
  #parentEl = document.querySelector('.app-bar');

  constructor() {
    super();
    this.markerOnClick = this.markerOnClick();
  }

  async renderMap(mapData) {
    this.#mapData = mapData;
    mapboxgl.accessToken =
      'pk.eyJ1IjoiamFzb25jb2Rpbmc3MjMiLCJhIjoiY2tvN2FlcmF6MW1raDJvbHJhN2ptMG01NCJ9.ZDZ7zl030QE1REiaDIYWnQ';
    this.#accessToken = mapboxgl.accessToken;

    this.#map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.#mapData.currentPosition, // starting position [lng, lat]
      zoom: MAP_ZOOM_LEVEL, // starting zoom
      // pitch: 45,
      // bearing: -17.6,
      // antialias: true,
    });

    // Add handle click outside map
    this.#parentEl.addEventListener('click', async e => {
      if (
        !this.#form.classList.contains('hidden') &&
        !e.target.closest('.form')
      ) {
        // Remove marker and path when closing form
        this.#form.classList.add('hidden');
        this.#myMarker.remove();
        this.#myMarker = '';
        await this.renderPath(
          this.#mapData.currentPosition,
          this.#mapData.currentPosition
        );
      }
    });

    const geocoder = new MapboxGeocoder({
      accessToken: this.#accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });

    // Add handle click events on map
    this.#map.on('click', this._showForm.bind(this));
    this.#map.on('load', async () => {
      // Add starting pin location on map
      this.renderMarker(this.#mapData.currentPosition);
      // Add geocoder to map
      this.#map.addControl(geocoder);
      // Add full screen control on map
      this.#map.addControl(new mapboxgl.FullscreenControl());
      // Add zoom and rotation controls to the map
      this.#map.addControl(new mapboxgl.NavigationControl());
      // Disables the "double click to zoom" interaction
      this.#map.doubleClickZoom.disable();
      // Make fake path which start and end at the same point
      await this.renderPath(
        this.#mapData.currentPosition,
        this.#mapData.currentPosition
      );

      this.#starterPosition.addEventListener(
        'change',
        this._changeTrainingType.bind(this)
      );
    });
    // Render 3D building to map
    this._showBuildings3D();
  }

  async _changeTrainingType() {
    if (this.#starterPosition.selectedIndex === 1) {
      this.renderMarker(this.#mapData.currentPosition, 1);
    } else {
      this.#startMarker.remove();
      this.#startMarker = '';
      delete this.#mapData.startPositionCoords;
      await this.renderPath(
        this.#mapData.currentPosition,
        this.#mapData.destinationCoords
      );
      this.fetchInputData();
    }
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
    // Double click functionality on map
    let timeout;
    this.#clickCount++;
    if (this.#clickCount === 1) {
      timeout = setTimeout(() => {
        this.#clickCount = 0;
      }, 300);
    }
    if (this.#clickCount === 2) {
      clearTimeout(timeout);
      this.#form.classList.remove('hidden');

      // Add destination coords to #mapData
      const { lat, lng } = mapEvent.lngLat;
      const destinationCoords = [lng, lat];
      this.#mapData.destinationCoords = destinationCoords;

      // Render marker on map and path
      this.renderMarker(this.#mapData.destinationCoords, 2);
      if (this.#startMarker) {
        await this.renderPath(
          this.#mapData.startPositionCoords,
          this.#mapData.destinationCoords
        );
      } else {
        await this.renderPath(
          this.#mapData.currentPosition,
          this.#mapData.destinationCoords
        );
      }

      this.fetchInputData();
      this.#clickCount = 0;
    }
  }

  fetchInputData() {
    const inputDestinationCoords = document.querySelector('.end');
    const inputDistance = document.querySelector('.form__input--distance');

    let distance = (this.#pathData.routes[0].distance / 1000).toFixed(2);
    this.#mapData.pathDistance = distance;
    inputDistance.placeholder = `${distance}km`;
    inputDestinationCoords.placeholder = `(${this.#mapData.destinationCoords[1].toFixed(
      3
    )} , ${this.#mapData.destinationCoords[0].toFixed(3)})`;
  }

  async renderPath(startPoint, endPoint) {
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
    // Sign path parameters in mapData
    this.#mapData.pathStart = startPoint;
    this.#mapData.pathEnd = endPoint;
  }

  async renderMarker(coords, index = 0) {
    if (index === 0) this._renderStartingPin(coords);
    if (index === 1) this._changeStartingPin(coords);
    if (index === 2) this._renderMarkerTo(coords);
  }

  async _renderMarkerTo(coords) {
    if (!this.#myMarker) {
      await this._updateMarkerTo(coords);
    } else {
      this.#myMarker.remove();
      this.#myMarker = '';
      await this._updateMarkerTo(coords);
    }
  }

  _renderStartingPin(coords) {
    const startingMarkerEl = document.createElement('div');
    startingMarkerEl.className = 'pin__starter';
    new mapboxgl.Marker(startingMarkerEl).setLngLat(coords).addTo(this.#map);
  }

  async _changeStartingPin(coords) {
    const starterIcon = document.createElement('div');
    starterIcon.className = 'starter-icon';

    const markerOptions = {
      element: starterIcon,
      draggable: true,
      offset: [0, -25],
    };

    this.#startMarker = new mapboxgl.Marker(markerOptions)
      .setLngLat(coords)
      .onClick(() => {
        this.#map.flyTo({
          center: [coords[0], coords[1]],
          zoom: MAP_ZOOM_LEVEL,
          duration: 2000,
          essential: true,
        });
      })
      .addTo(this.#map);
    this.#mapData.startPositionCoords = coords;
    this.#startMarker.on('dragend', async e => {
      let { lng, lat } = e.target._lngLat;
      this.#mapData.startPositionCoords = [lng, lat];
      await this.renderPath(
        this.#mapData.startPositionCoords,
        this.#mapData.destinationCoords
      );
      this.fetchInputData();
    });
  }

  async _updateMarkerTo(coords) {
    const markerIcon = document.createElement('div');
    markerIcon.className = 'marker-icon';

    const markerOptions = {
      element: markerIcon,
      draggable: true,
      offset: [0, -25],
    };

    this.#myMarker = new mapboxgl.Marker(markerOptions)
      .setLngLat(coords)
      .onClick(() => {
        this.#map.flyTo({
          center: [coords[0], coords[1]],
          zoom: MAP_ZOOM_LEVEL,
          duration: 2000,
          essential: true,
        });
      })
      .addTo(this.#map);

    this.#myMarker.on('dragend', async e => {
      let { lng, lat } = e.target._lngLat;
      this.#mapData.destinationCoords = [lng, lat];
      if (this.#starterPosition.selectedIndex === 1) {
        await this.renderPath(
          this.#mapData.startPositionCoords,
          this.#mapData.destinationCoords
        );
        this.fetchInputData();
      } else {
        await this.renderPath(
          this.#mapData.currentPosition,
          this.#mapData.destinationCoords
        );
        this.fetchInputData();
      }
    });
  }
  async preserveMarker(coords) {
    const markerIcon = document.createElement('div');
    markerIcon.className = 'marker-icon';

    const markerOptions = {
      element: markerIcon,
      draggable: true,
      offset: [0, -25],
    };

    this.#preserveMarker = new mapboxgl.Marker(markerOptions)
      .setLngLat(coords)
      .onClick(() => {
        this.#map.flyTo({
          center: [coords[0], coords[1]],
          zoom: MAP_ZOOM_LEVEL,
          duration: 2000,
          essential: true,
        });
      })
      .addTo(this.#map);

    // Make invisible path
    await this.renderPath(
      this.#mapData.currentPosition,
      this.#mapData.currentPosition
    );
  }

  async removeStarterMarker() {
    if (this.#startMarker) {
      this.#startMarker.remove();
      this.#startMarker = '';
      // Make invisible path
      await this.renderPath(
        this.#mapData.currentPosition,
        this.#mapData.currentPosition
      );
    }
  }

  removeMarkersEdit(workout) {
    workout.Marker.remove();
    if (!this.#startMarkerPopup) return;
    this.#startMarkerPopup.remove();
  }

  async moveToWorkoutPosition(e, workouts) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const workout = workouts.find(work => work.id === workoutEl.dataset.id);
    let bound = [workout.startCoords, workout.endCoords];
    if (this.#startMarkerPopup) {
      this.#startMarkerPopup.remove();
    }
    await this.renderPath(workout.startCoords, workout.endCoords);

    this.#map.fitBounds(bound, {
      padding: { top: 70, bottom: 50, left: 50, right: 50 },
    });
  }

  markerOnClick() {
    // Override internal functionality
    mapboxgl.Marker.prototype.onClick = function (handleClick) {
      this._handleClick = handleClick;
      return this;
    };
    mapboxgl.Marker.prototype._onMapClick = function (e) {
      const targetElement = e.originalEvent.target;
      const element = this._element;
      if (
        this._handleClick &&
        (targetElement === element || element.contains(targetElement))
      ) {
        this.togglePopup();
        this._handleClick();
      }
    };
  }

  addPopupToWorkout(workout, index = 0) {
    let coords = index === 0 ? workout.startCoords : workout.endCoords;
    const markupStart = `
      <div class="${workout.type}-popup">
        <div>
          ${workout.type === 'running' ? '🏃‍♂️ ' : '🚴‍♀️ '} ${
      workout.type[0].toUpperCase() + workout.type.slice(1)
    } <span>on</span> ${workout.time.start.workoutDate}
        </div>
        <div class="city">${workout.location.starterLocationCity}, ${
      workout.location.starterLocationCountry
    }
        </div>
        <div class="street">${workout.location.starterLocationStreet}</div>
        <div class="time"><span>Start at </span>${
          workout.time.start.workoutTime
        }</div>
      </div>
    `;

    const markupEnd = `
      <div class="${workout.type}-popup">
        <div>
          ${workout.type === 'running' ? '🏃‍♂️ ' : '🚴‍♀️ '} ${
      workout.type[0].toUpperCase() + workout.type.slice(1)
    } <span>on</span> ${workout.time.end.workoutDate}
        </div>
        <div class="city">${workout.location.endLocationCity}, ${
      workout.location.endLocationCountry
    }
        </div>
        <div class="street">${workout.location.endLocationStreet}</div>
        <div class="time"><span>Arrived at </span>${
          workout.time.end.workoutTime
        }</div>
      </div>
    `;

    let markup = index === 0 ? markupStart : markupEnd;
    let popup = new mapboxgl.Popup({
      offset: [0, -40],
      closeOnClick: false,
    })
      .setLngLat(coords)
      .setHTML(markup)
      .addTo(this.#map);

    if (index === 0) {
      const startMarker = document.createElement('div');
      startMarker.className = 'starter-icon';
      this.#startMarkerPopup = new mapboxgl.Marker({
        element: startMarker,
        offset: [0, -25],
      })
        .setLngLat(coords)
        .setPopup(popup)
        .onClick(() => {
          this.#map.flyTo({
            center: [coords[0], coords[1]],
            duration: 2000,
            essential: true,
            zoom: MAP_ZOOM_LEVEL,
          });
        })
        .addTo(this.#map);
      this.#startMarkerPopup.togglePopup();
    }

    if (index === 1) {
      this.#preserveMarker.remove();
      const endMarker = document.createElement('div');
      endMarker.className = 'marker-icon';
      this.#preserveMarker = new mapboxgl.Marker({
        element: endMarker,
        offset: [0, -25],
      })
        .setLngLat(coords)
        .setPopup(popup)
        .onClick(() => {
          this.#map.flyTo({
            center: [coords[0], coords[1]],
            zoom: MAP_ZOOM_LEVEL,
            duration: 2000,
            essential: true,
          });
        })
        .addTo(this.#map);
      this.#preserveMarker.togglePopup();
      return this.#preserveMarker;
    }
  }
}

export default new mapView();
