import { async } from 'regenerator-runtime';
import 'core-js/stable';
import 'leaflet';

import { MAP_ZOOM_LEVEL, MAX_ZOOM_MAP } from '../config';

class MapView {
  #map;
  #mapData;
  _form = document.querySelector('.form');
  _inputDuration = document.querySelector('.form__input-duration');

  render(mapData) {
    this.#mapData = mapData;
    this.#map = L.map('mappy').setView(
      this.#mapData.currentPosition,
      MAP_ZOOM_LEVEL
    );
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: MAX_ZOOM_MAP,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.#map);
    // Render workout marker on current position
    this.renderWorkoutMarker(this.#mapData.currentPosition);
    // Handle click on map
    this.#map.on('click', this.showForm.bind(this));
  }

  showForm(mapE) {
    this._form.classList.remove('hidden');
    this._inputDuration.focus();
  }

  renderWorkoutMarker(coords) {
    L.marker(coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `running-popup`,
        })
      )
      .setPopupContent('Popup Content')
      .openPopup();
  }
}

export default new MapView();
