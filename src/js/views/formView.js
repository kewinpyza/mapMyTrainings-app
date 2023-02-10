import mapView from './mapView';
import { timeout } from '../helpers';
import { TIMEOUT_SEC } from '../config';
import * as model from '../model';

class formView {
  #form = document.querySelector('.form');
  #inputDuration = document.querySelector('.form__input--duration');
  #inputType = document.querySelector('.form__input--select');
  #inputCadence = document.querySelector('.form__input--cadence');
  #inputElevation = document.querySelector('.form__input--elevation');
  #toggleInput = document.querySelector('.form__input--cadence');

  renderForm(form, editForm) {
    this.#inputType.addEventListener('change', () => {
      this.toggleElevationField();
      // this.formValidation();
    });

    this.#form.addEventListener('submit', async e => {
      try {
        const inputTime = document.querySelector('.form__input--time');
        let handler = model.state.edit ? editForm : form;
        e.preventDefault();
        if (this.formValidation()) {
          this.#form.classList.add('hidden');

          await Promise.race([handler(), timeout(TIMEOUT_SEC)]);
          this.#form.reset();
          this.#inputElevation
            .closest('.form__row')
            .classList.add('form__row--hidden');
          this.#inputCadence
            .closest('.form__row')
            .classList.remove('form__row--hidden');
          model.state.edit = false;
          inputTime.type = 'text';
        }
      } catch (err) {
        // mapView.renderError(err);
        console.log(err);
      }
    });
  }

  formValidation() {
    let checkToggleInput, checkDuration;
    this.#toggleInput =
      this.#inputType.value === 'running'
        ? this.#inputCadence
        : this.#inputElevation;

    if (this.checkRequired(this.#toggleInput))
      checkToggleInput = this.checkInput(this.#toggleInput);
    if (this.checkRequired(this.#inputDuration))
      checkDuration = this.checkInput(this.#inputDuration);

    return checkToggleInput && checkDuration;
  }

  // Check if form field is required
  checkRequired(inp) {
    let isRequired = false;
    if (inp.value.trim() === '')
      this.showError(inp, `${this.getInputName(inp)} is required!`);
    else {
      this.hideError(inp);
      isRequired = true;
    }
    return isRequired;
  }

  // Check if input is valid
  checkInput(inp) {
    const validInp = isFinite(inp.value);
    const positiveNum = inp.value > 0;
    const type = this.#inputType.value;

    if (inp.id === 'elevation' && !validInp) {
      this.showError(
        inp,
        `${this.getInputName(inp)} must be a number! Negative is also possible.`
      );
      return false;
    }
    if (inp.id === 'elevation' && validInp) {
      this.hideError(inp);
      return true;
    }
    if (!validInp || !positiveNum) {
      this.showError(
        inp,
        `${this.getInputName(inp)} must be a positive number!`
      );
    } else {
      this.hideError(inp);
      return true;
    }
  }

  // Take an input field name
  getInputName(inp) {
    return `${inp.id[0].toUpperCase()}${inp.id.slice(1)}`;
  }

  toggleElevationField() {
    this.#inputElevation
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
    this.#inputCadence
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
  }

  showError(inp, msg) {
    let id = inp.id === 'duration' ? inp.id : 'elev-cad';
    const validationEl = document.querySelector(`.validation__msg--${id}`);
    validationEl.classList.remove('hidden');
    validationEl.textContent = msg;
  }

  hideError(inp) {
    let id = inp.id === 'duration' ? inp.id : 'elev-cad';
    const validationEl = document.querySelector(`.validation__msg--${id}`);
    validationEl.classList.add('hidden');
  }

  getFormValues() {
    const formValues = {};
    formValues[this.#toggleInput.id] = this.#toggleInput.value;
    formValues.duration = this.#inputDuration.value;
    formValues.type = this.#inputType.value;
    return formValues;
  }
}

export default new formView();
