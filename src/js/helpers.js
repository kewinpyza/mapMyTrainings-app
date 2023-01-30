import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config';

export const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, errorMsg) {
  try {
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw new Error(errorMsg);
    return data;
  } catch (err) {
    throw err;
  }
};

// VALID INPUTS
export const validInputs = (...inputs) =>
  inputs.every(inp => Number.isFinite(inp));
export const allPositive = (...inputs) => inputs.every(inp => inp > 0);

export const findWorkout = (workouts, workoutEl) => {
  const workout = workouts.find(work => work.id === workoutEl.dataset.id);

  return workout;
};
