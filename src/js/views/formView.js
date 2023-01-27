class formView {
  _form = document.querySelector('.form');
  _inputDuration = document.querySelector('.form__input--duration');
  _inputType = document.querySelector('.form__input--select');
  _inputCadence = document.querySelector('.form__input--cadence');
  _inputElevation = document.querySelector('.form__input--elevation');
  _toggleInput = document.querySelector('.form__input--cadence');

  renderForm(handler) {
    this._inputType.addEventListener(
      'change',
      this._changeInputType.bind(this)
    );

    this._form.addEventListener('submit', async e => {
      e.preventDefault();
      if (this.formValidation()) {
        this._form.classList.add('hidden');

        await handler();
        this._form.reset();
      }
    });
  }

  _changeInputType() {
    this._toggleInput =
      this._inputType.value === 'running'
        ? this._inputCadence
        : this._inputElevation;
    this.toggleElevationField();
  }

  formValidation() {
    let checkToggleInput, checkDuration;

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
    console.log(validInp);
    const positiveNum = inp.value > 0;
    const type = this._inputType.value;

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

  // Check if inputs are valid
  // checkInput(input) {
  //   const validInp = Number.isFinite(input);
  //   const positiveInp = input > 0;
  // }

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
}

export default new formView();
