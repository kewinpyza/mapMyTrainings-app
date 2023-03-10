import { timeout } from '../helpers';
import { TIMEOUT_SEC } from '../config';
import * as model from '../model';

class formView {
  _form = document.querySelector('.form');
  _inputDuration = document.querySelector('.form__input--duration');
  _inputType = document.querySelector('.form__input--select');
  _inputCadence = document.querySelector('.form__input--cadence');
  _inputElevation = document.querySelector('.form__input--elevation');
  _toggleInput = document.querySelector('.form__input--cadence');

  renderForm(form, editForm) {
    this._inputType.addEventListener(
      'change',
      this.toggleElevationField.bind(this)
    );

    this._form.addEventListener('submit', async e => {
      try {
        const inputTime = document.querySelector('.form__input--time');
        let handler = model.state.edit ? editForm : form;
        e.preventDefault();
        if (this.formValidation()) {
          this._form.classList.add('hidden');

          await Promise.race([handler(), timeout(TIMEOUT_SEC)]);
          this._form.reset();
          this._inputElevation
            .closest('.form__row')
            .classList.add('form__row--hidden');
          this._inputCadence
            .closest('.form__row')
            .classList.remove('form__row--hidden');
          model.state.edit = false;
          inputTime.type = 'text';
        }
      } catch (err) {
        mapView.renderError(err);
      }
    });
  }

  formValidation() {
    let checkToggleInput, checkDuration;
    this._toggleInput =
      this._inputType.value === 'running'
        ? this._inputCadence
        : this._inputElevation;

    if (this.checkRequired(this._toggleInput))
      checkToggleInput = this.checkInput(this._toggleInput);
    if (this.checkRequired(this._inputDuration))
      checkDuration = this.checkInput(this._inputDuration);

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

    if (inp.id === 'elevation') {
      if (!validInp) {
        this.showError(
          inp,
          `${this.getInputName(
            inp
          )} must be a number! Negative is also possible.`
        );
        return false;
      } else {
        this.hideError(inp);
        return true;
      }
    }
    if (!validInp || !positiveNum) {
      this.showError(
        inp,
        `${this.getInputName(inp)} must be a positive number!`
      );
      return false;
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
    this._inputElevation
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
    this._inputCadence
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
    formValues[this._toggleInput.id] = this._toggleInput.value;
    formValues.duration = this._inputDuration.value;
    formValues.type = this._inputType.value;
    return formValues;
  }
}

export default new formView();
