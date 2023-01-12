'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// DOM Variables
const form = document.querySelector('.form');
const workoutsContainer = document.querySelector('.workouts');
const inputType = document.querySelector('.form-input-type');
const inputDistance = document.querySelector('.form-input-distance');
const inputDuration = document.querySelector('.form-input-duration');
const inputCadence = document.querySelector('.form-input-cadence');
const inputElevation = document.querySelector('.form-input-elevation');
const inputKcal = document.querySelector('.form-input-kcal');

let map, mapEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;

      const coords = [latitude, longitude];

      map = L.map('mappy').setView(coords, 13);

      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 18,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      // Handling clicks on map
      map.on('click', mapE => {
        mapEvent = mapE;
        form.classList.remove('hidden');
        inputDuration.focus();
      });
    },
    () => alert('Cannot get your position')
  );
}

form.addEventListener('submit', e => {
  e.preventDefault();

  // Clear inputs
  inputKcal.value =
    inputDistance.value =
    inputCadence.value =
    inputDuration.value =
    inputElevation.value =
      '';

  // Display the marker
  console.log(mapEvent);
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 240,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Workout')
    .openPopup();
});

inputType.addEventListener('change', () => {
  if (inputType.value === 'running') {
    inputCadence.closest('.form-row').classList.remove('form-row-hidden');
    inputElevation.closest('.form-row').classList.add('form-row-hidden');
    inputDistance.closest('.form-row').classList.remove('form-row-hidden');
  }
  if (inputType.value === 'cycling') {
    inputCadence.closest('.form-row').classList.add('form-row-hidden');
    inputElevation.closest('.form-row').classList.remove('form-row-hidden');
    inputDistance.closest('.form-row').classList.remove('form-row-hidden');
  }
  if (inputType.value === 'swimming') {
    inputCadence.closest('.form-row').classList.add('form-row-hidden');
    inputElevation.closest('.form-row').classList.add('form-row-hidden');
    inputDistance.closest('.form-row').classList.remove('form-row-hidden');
  }
  if (inputType.value === 'gym') {
    inputCadence.closest('.form-row').classList.add('form-row-hidden');
    inputElevation.closest('.form-row').classList.add('form-row-hidden');
    inputDistance.closest('.form-row').classList.add('form-row-hidden');
  }
});
