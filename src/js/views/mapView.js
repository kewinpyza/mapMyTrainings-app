import { MAP_ZOOM_LEVEL } from '../config';
import { AJAX } from '../helpers';
import View from './View';
// import markerIcon from 'url:../../images/marker.png';

class mapView extends View {
  #mapData;
  #accessToken;
  #clickCount = 0;
  #myMarker;
  #pathData;
  #startMarker;
  #startMarkerPopup;

  #workoutsContainer = document.querySelector('.workouts');
  #map = document.querySelector('#map');
  #form = document.querySelector('.form');
  #starterPosition = document.querySelector('.form__input--position-type');

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
      // pitch: 45,
      // bearing: -17.6,
      // antialias: true,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: this.#accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });

    // Add handle click events on map
    this.#map.on('click', this._showForm.bind(this));
    this.#map.on('load', () => {
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
    });

    // Render 3D building to map
    this._showBuildings3D();

    this.#starterPosition.addEventListener('change', () => {
      if (this.#starterPosition.selectedIndex === 1) {
        this.renderMarker(this.#mapData.currentPosition, 1);
      } else {
        this.#startMarker.remove();
        this.#startMarker = undefined;
        delete this.#mapData.startPositionCoords;
        this._renderPath(
          this.#mapData.currentPosition,
          this.#mapData.destinationCoords
        );
        this._fetchInputData();
      }
    });
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
    // if (this.#startMarkerPopup) this.#startMarkerPopup.remove();

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
        await this._renderPath(
          this.#mapData.startPositionCoords,
          this.#mapData.destinationCoords
        );
      } else {
        await this._renderPath(
          this.#mapData.currentPosition,
          this.#mapData.destinationCoords
        );
      }

      this._fetchInputData();
      this.#clickCount = 0;
    }
  }

  _fetchInputData() {
    const inputDestinationCoords = document.querySelector('.end');
    const inputDistance = document.querySelector('.form__input--distance');

    let pathDistance = (this.#pathData.routes[0].distance / 1000).toFixed(2);
    this.#mapData.distance = pathDistance;
    inputDistance.placeholder = `${pathDistance}km`;
    inputDestinationCoords.placeholder = `(${this.#mapData.destinationCoords[1].toFixed(
      3
    )} , ${this.#mapData.destinationCoords[0].toFixed(3)})`;
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
    // Sign path parameters in mapData
    this.#mapData.pathStart = startPoint;
    this.#mapData.pathEnd = endPoint;
  }

  async renderMarker(coords, index = 0) {
    if (index === 0) {
      this._renderStartingPin(coords);
    }
    if (index === 1) {
      this._changeStartingPin(coords);
    } else {
      this._renderMarkerTo(coords);
    }
  }

  async _renderMarkerTo(coords) {
    if (!this.#myMarker) {
      await this._updateMarkerTo(coords);
    } else {
      this.#myMarker.remove();
      this.#myMarker = undefined;
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
    starterIcon.className = 'marker-icon';

    const markerOptions = {
      element: starterIcon,
      draggable: true,
      offset: [0, -25],
    };

    this.#startMarker = new mapboxgl.Marker(markerOptions)
      .setLngLat(coords)
      .addTo(this.#map);
    this.#mapData.startPositionCoords = coords;
    this.#startMarker.on('dragend', async e => {
      let { lng, lat } = e.target._lngLat;
      this.#mapData.startPositionCoords = [lng, lat];
      await this._renderPath(
        this.#mapData.startPositionCoords,
        this.#mapData.destinationCoords
      );
      this._fetchInputData();
    });
  }

  async _updateMarkerTo(coords) {
    const markerIcon = document.createElement('div');
    markerIcon.className = 'starter-icon';

    const markerOptions = {
      element: markerIcon,
      draggable: true,
      offset: [0, -25],
    };

    this.#myMarker = new mapboxgl.Marker(markerOptions)
      .setLngLat(coords)
      .addTo(this.#map);

    this.#myMarker.on('dragend', async e => {
      let { lng, lat } = e.target._lngLat;
      this.#mapData.destinationCoords = [lng, lat];
      if (this.#starterPosition.selectedIndex === 1) {
        await this._renderPath(
          this.#mapData.startPositionCoords,
          this.#mapData.destinationCoords
        );
        this._fetchInputData();
      } else {
        await this._renderPath(
          this.#mapData.currentPosition,
          this.#mapData.destinationCoords
        );
        this._fetchInputData();
      }
    });
  }

  // async _getDragPositionTo(e) {
  //   const { lng, lat } = e.target._lngLat;
  //   this.#mapData.destinationCoords = [lng, lat];
  //   if (this.#starterPosition.selectedIndex === 1) {
  //     await this._renderPath(
  //       this.#mapData.startPositionCoords,
  //       this.#mapData.destinationCoords
  //     );
  //     this._fetchInputData();
  //   } else {
  //     await this._renderPath(
  //       this.#mapData.currentPosition,
  //       this.#mapData.destinationCoords
  //     );
  //     this._fetchInputData();
  //   }
  // }

  // async _getDragPositionFrom(e) {
  //   const { lng, lat } = e.target._lngLat;
  //   this.#mapData.startPositionCoords = [lng, lat];
  //   await this._renderPath(
  //     this.#mapData.startPositionCoords,
  //     this.#mapData.destinationCoords
  //   );
  //   this._fetchInputData();
  // }

  async _getDragPositionTo(e) {}
}

export default new mapView();
