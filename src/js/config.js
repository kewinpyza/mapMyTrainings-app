export const TIMEOUT_SEC = 8;
export const MAP_ZOOM_LEVEL = 13;
export const WEATHER_API_KEY = 'd613b3a0de294e62b54141517231901';

// Original ES6 Class— https://github.com/tobinbradley/mapbox-gl-pitch-toggle-control
export class PitchToggle {
  constructor({ bearing = -20, pitch = 70, minpitchzoom = null }) {
    this._bearing = bearing;
    this._pitch = pitch;
    this._minpitchzoom = minpitchzoom;
  }

  onAdd(map) {
    this._map = map;
    let _this = this;

    this._btn = document.createElement('button');
    this._btn.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-3d';
    this._btn.type = 'button';
    this._btn['aria-label'] = 'Toggle Pitch';
    this._btn.onclick = function () {
      if (map.getPitch() === 0) {
        let options = { pitch: _this._pitch, bearing: _this._bearing };
        if (_this._minpitchzoom && map.getZoom() > _this._minpitchzoom) {
          options.zoom = _this._minpitchzoom;
        }
        map.easeTo(options);
        _this._btn.className =
          'mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-2d';
      } else {
        map.easeTo({ pitch: 0, bearing: 0 });
        _this._btn.className =
          'mapboxgl-ctrl-icon mapboxgl-ctrl-pitchtoggle-3d';
      }
    };

    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

/* Add controls to mapbox from Stack Overflow */
export class MapboxGLButtonControl {
  constructor({ className = '', title = '', eventHandler = evtHndlr }) {
    this._className = className;
    this._title = title;
    this._eventHandler = eventHandler;
  }

  onAdd(map) {
    this._btn = document.createElement('button');
    this._btn.className = 'mapboxgl-ctrl-icon' + ' ' + this._className;
    this._btn.type = 'button';
    this._btn.title = this._title;
    this._btn.onclick = this._eventHandler;

    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
