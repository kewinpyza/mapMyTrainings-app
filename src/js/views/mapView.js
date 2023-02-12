import { MAP_ZOOM_LEVEL, PitchToggle, MapboxGLButtonControl } from '../config';
import { AJAX } from '../helpers';
import View from './View';
import workoutsView from './workoutsView';
import * as model from '../model';

class mapView extends View {
  _mapData;
  _accessToken;
  _clickCount = 0;
  _pathData;
  _myMarker;
  _startMarker;
  _startMarkerPopup;
  _preserveMarker;
  _preserveMarkerSaved;

  _map = document.querySelector('#map');
  _form = document.querySelector('.form');
  _starterPosition = document.querySelector('.form__input--position-type');
  _parentEl = document.querySelector('.app-bar');
  _inputCadence = document.querySelector('.form__input--cadence');
  _inputElevation = document.querySelector('.form__input--elevation');

  constructor() {
    super();
    this.markerOnClick = this.markerOnClick();
  }

  async renderMap(mapData) {
    this._mapData = mapData;
    mapboxgl.accessToken =
      'pk.eyJ1Ijoia3B5emE5OCIsImEiOiJjbGRxZmthdWEwMGVuM25wcHB3aDE0aHl4In0.pBi79GBUNKVIMtIzUc-ZAA';
    this._accessToken = mapboxgl.accessToken;

    this._map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this._mapData.currentPosition, // starting position [lng, lat]
      zoom: MAP_ZOOM_LEVEL, // starting zoom
    });

    // Add handle click outside map
    this._parentEl.addEventListener('click', async e => {
      if (model.state.edit) return;
      if (
        !this._form.classList.contains('hidden') &&
        !e.target.closest('.form')
      ) {
        // Remove marker and path when closing form
        this._form.classList.add('hidden');
        this._myMarker.remove();
        this._myMarker = '';
        if (this._startMarker) {
          this._startMarker.remove();
          this._startMarker = '';
        }
        this._form.reset();
        this._inputCadence
          .closest('.form__row')
          .classList.remove('form__row--hidden');
        this._inputElevation
          .closest('.form__row')
          .classList.add('form__row--hidden');
        await this.renderPath(
          this._mapData.currentPosition,
          this._mapData.currentPosition
        );
      }
    });

    const geocoder = new MapboxGeocoder({
      accessToken: this._accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });

    // Add handle click events on map
    this._map.on('click', this._showForm.bind(this));
    this._map.on('load', async () => {
      // Add starting pin location on map
      this.renderMarker(this._mapData.currentPosition);
      // Add geocoder to map
      this._map.addControl(geocoder);
      // Add full screen control on map
      this._map.addControl(new mapboxgl.FullscreenControl());
      // Add zoom and rotation controls to the map
      this._map.addControl(new mapboxgl.NavigationControl());
      this.addButtonsToMap();
      // Disables the "double click to zoom" interaction
      this._map.doubleClickZoom.disable();
      // Make fake path which start and end at the same point
      await this.renderPath(
        this._mapData.currentPosition,
        this._mapData.currentPosition
      );

      this._starterPosition.addEventListener(
        'change',
        this._changeTrainingType.bind(this)
      );
    });
    // Render 3D building to map
    this._showBuildings3D();
  }

  async _changeTrainingType() {
    if (this._starterPosition.selectedIndex === 1) {
      this.renderMarker(this._mapData.currentPosition, 1);
    } else {
      this._startMarker.remove();
      this._startMarker = '';
      delete this._mapData.startPositionCoords;
      await this.renderPath(
        this._mapData.currentPosition,
        this._mapData.destinationCoords
      );
      this.fetchInputData();
    }
  }

  _showBuildings3D() {
    this._map.on('style.load', () => {
      // Insert the layer beneath any symbol layer.
      const layers = this._map.getStyle().layers;
      const labelLayerId = layers.find(
        layer => layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      this._map.addLayer(
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

  addButtonsToMap() {
    const currentPosBtn = new MapboxGLButtonControl({
      className: 'mapbox-gl-draw-location',
      title: 'Show your position',
      eventHandler: this.showYourLocation.bind(this),
    });
    this._map.addControl(currentPosBtn, 'top-left');
    this._map.addControl(
      new PitchToggle({ minpitchzoom: MAP_ZOOM_LEVEL }),
      'top-left'
    );
  }

  async _showForm(mapEvent) {
    if (!model.state.edit) {
      if (this._inputCadence.value) return;
    }
    if (this._startMarkerPopup) this._startMarkerPopup.remove();
    await this._showFormDoubleClick(mapEvent);
  }

  async _showFormDoubleClick(mapEvent) {
    // Double click functionality on map
    let timeout;
    this._clickCount++;
    if (this._clickCount === 1) {
      timeout = setTimeout(() => {
        this._clickCount = 0;
      }, 300);
    }
    if (this._clickCount === 2) {
      clearTimeout(timeout);
      this._form.classList.remove('hidden');
      // Placeholder trick on datetime-local
      const dateInput = document.querySelector('.form__input--time');
      dateInput.onfocus = function (e) {
        this.type = 'datetime-local';
      };

      // Add destination coords to _mapData
      const { lat, lng } = mapEvent.lngLat;
      const destinationCoords = [lng, lat];
      this._mapData.destinationCoords = destinationCoords;

      // Render marker on map and path
      this.renderMarker(this._mapData.destinationCoords, 2);
      if (this._startMarker) {
        await this.renderPath(
          this._mapData.startPositionCoords,
          this._mapData.destinationCoords
        );
      } else {
        await this.renderPath(
          this._mapData.currentPosition,
          this._mapData.destinationCoords
        );
      }

      this.fetchInputData();
      this._clickCount = 0;
    }
  }

  fetchInputData() {
    const inputDestinationCoords = document.querySelector('.end');
    const inputDistance = document.querySelector('.form__input--distance');

    let distance = (this._pathData.routes[0].distance / 1000).toFixed(2);
    this._mapData.pathDistance = distance;
    inputDistance.placeholder = `${distance}km`;
    inputDestinationCoords.placeholder = `(${this._mapData.pathEnd[1].toFixed(
      3
    )} , ${this._mapData.pathStart[0].toFixed(3)})`;
  }

  async renderPath(startPoint, endPoint) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}?geometries=geojson&access_token=${this._accessToken}`;

    this._pathData = await AJAX(
      url,
      'There was some error to render a path :('
    );

    const data = this._pathData.routes[0];
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
    if (this._map.getSource('route')) {
      this._map.getSource('route').setData(geojson);
    }
    // Otherwise, make a new request
    else {
      this._map.addLayer({
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
    this._mapData.pathStart = startPoint;
    this._mapData.pathEnd = endPoint;
  }

  async renderMarker(coords, index = 0) {
    if (index === 0) this._renderStartingPin(coords);
    if (index === 1) this._changeStartingPin(coords);
    if (index === 2) this._renderMarkerTo(coords);
  }

  async _renderMarkerTo(coords) {
    if (!this._myMarker) {
      await this._updateMarkerTo(coords);
    } else {
      this._myMarker.remove();
      this._myMarker = '';
      await this._updateMarkerTo(coords);
    }
  }

  _renderStartingPin(coords) {
    const startingMarkerEl = document.createElement('div');
    startingMarkerEl.className = 'pin__starter';
    new mapboxgl.Marker(startingMarkerEl).setLngLat(coords).addTo(this._map);
  }

  async _changeStartingPin(coords) {
    const starterIcon = document.createElement('div');
    starterIcon.className = 'starter-icon';

    const markerOptions = {
      element: starterIcon,
      draggable: true,
      offset: [0, -25],
    };

    this._startMarker = new mapboxgl.Marker(markerOptions)
      .setLngLat(coords)
      .onClick(() => {
        this._map.flyTo({
          center: [coords[0], coords[1]],
          zoom: MAP_ZOOM_LEVEL,
          duration: 2000,
          essential: true,
        });
      })
      .addTo(this._map);
    this._mapData.startPositionCoords = coords;
    this._startMarker.on('dragend', async e => {
      let { lng, lat } = e.target._lngLat;
      this._mapData.startPositionCoords = [lng, lat];
      if (model.state.edit) {
        await this.renderPath(
          this._mapData.startPositionCoords,
          this._mapData.pathEnd
        );
      } else {
        await this.renderPath(
          this._mapData.startPositionCoords,
          this._mapData.destinationCoords
        );
      }
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

    this._myMarker = new mapboxgl.Marker(markerOptions)
      .setLngLat(coords)
      .onClick(() => {
        this._map.flyTo({
          center: [coords[0], coords[1]],
          zoom: MAP_ZOOM_LEVEL,
          duration: 2000,
          essential: true,
        });
      })
      .addTo(this._map);

    this._myMarker.on('dragend', async e => {
      let { lng, lat } = e.target._lngLat;
      this._mapData.destinationCoords = [lng, lat];
      if (this._starterPosition.selectedIndex === 1) {
        await this.renderPath(
          this._mapData.startPositionCoords,
          this._mapData.destinationCoords
        );
        this.fetchInputData();
      } else {
        await this.renderPath(
          this._mapData.currentPosition,
          this._mapData.destinationCoords
        );
        this.fetchInputData();
      }
    });
  }
  preserveMarker(coords) {
    const markerIcon = document.createElement('div');
    markerIcon.className = 'marker-icon';

    const markerOptions = {
      element: markerIcon,
      draggable: true,
      offset: [0, -25],
    };

    this._preserveMarker = new mapboxgl.Marker(markerOptions)
      .setLngLat(coords)
      .onClick(() => {
        this._map.flyTo({
          center: [coords[0], coords[1]],
          zoom: MAP_ZOOM_LEVEL,
          duration: 2000,
          essential: true,
        });
      })
      .addTo(this._map);
  }

  async removeSetUpMarkers() {
    if (this._startMarker) {
      this._startMarker.remove();
      this._startMarker = '';
    }
    if (this._myMarker) {
      this._myMarker.remove();
      this._myMarker = '';
    }
    // Make invisible path
    await this.renderPath(
      this._mapData.currentPosition,
      this._mapData.currentPosition
    );
  }

  removeMarkersEdit(workout) {
    if (this._startMarkerPopup) this._startMarkerPopup.remove();
    const markerEl = model.markers.find(m => m.id === workout.id);
    markerEl.marker.remove();
  }

  async moveToWorkoutPosition(e, workouts) {
    if (!this._map) return;
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    if (model.state.edit) return;
    const workout = workouts.find(w => w.id === workoutEl.dataset.id);
    let bound = [workout.startCoords, workout.endCoords];
    if (this._startMarkerPopup) this._startMarkerPopup.remove();
    this.addPopupToWorkout(workout);
    await this.renderPath(workout.startCoords, workout.endCoords);

    this._map.fitBounds(bound, {
      padding: { top: 150, bottom: 25, left: 125, right: 125 },
    });
  }

  async showYourLocation() {
    this._map.flyTo({
      center: [
        this._mapData.currentPosition[0],
        this._mapData.currentPosition[1],
      ],
      zoom: MAP_ZOOM_LEVEL,
      // duration: 2000,
      // essential: true,
    });

    await this.renderPath(
      this._mapData.currentPosition,
      this._mapData.currentPosition
    );
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
    } <span>on</span> ${workout.time.startWorkoutDate}
        </div>
        <div class="street">${workout.location.starterLocationStreet}</div>
        <div class="city">${workout.location.starterLocationCity}, ${
      workout.location.starterLocationCountry
    }
            </div>
        <div class="time"><span>Start at </span>${
          workout.time.startWorkout
        }</div>
      </div>
    `;

    const markupEnd = `
      <div class="${workout.type}-popup">
        <div>
          ${workout.type === 'running' ? '🏃‍♂️ ' : '🚴‍♀️ '} ${
      workout.type[0].toUpperCase() + workout.type.slice(1)
    } <span>on</span> ${workout.time.endWorkoutDate}
        </div>
        <div class="street">${workout.location.endLocationStreet}</div>
        <div class="city">${workout.location.endLocationCity}, ${
      workout.location.endLocationCountry
    }
            </div>
        <div class="time"><span>Arrived at </span>${
          workout.time.endWorkout
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
      .addTo(this._map);

    if (index === 1) {
      if (this._preserveMarker) this._preserveMarker.remove();
      const endMarker = document.createElement('div');
      endMarker.className = 'marker-icon';
      this._preserveMarkerSaved = new mapboxgl.Marker({
        element: endMarker,
        offset: [0, -25],
      })
        .setLngLat(coords)
        .setPopup(popup)
        .onClick(() => {
          this._map.flyTo({
            center: [coords[0], coords[1]],
            zoom: MAP_ZOOM_LEVEL,
            duration: 2000,
            essential: true,
          });
        })
        .addTo(this._map);
      this._preserveMarkerSaved.togglePopup();

      return this._preserveMarkerSaved;
    }

    if (index === 0) {
      const startMarker = document.createElement('div');
      startMarker.className = 'starter-icon';
      this._startMarkerPopup = new mapboxgl.Marker({
        element: startMarker,
        offset: [0, -25],
      })
        .setLngLat(coords)
        .setPopup(popup)
        .onClick(() => {
          this._map.flyTo({
            center: [coords[0], coords[1]],
            duration: 2000,
            essential: true,
            zoom: MAP_ZOOM_LEVEL,
          });
        })
        .addTo(this._map);
      this._startMarkerPopup.togglePopup();
    }
  }
}

export default new mapView();
