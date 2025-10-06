import regexp from "./regexp.js";

const INPUT_NAME = 'name';
const INPUT_LAST_NAME = 'lastname';
const INPUT_NUMBER = 'float-number';

export class Validator {
    constructor(form, callback) {
        this.form = document.querySelector(form);
        this.callback = callback;
        this._valid = false;
        this.nameRegExp = regexp.nameRegExpBasic;
        this.numberRegExp = regexp.floatNumberRegExp;
        this.maxNumberLength = 4;
        this.formData = {};

        if (this.form) {
            this.inputs = this.form.querySelectorAll(".form-control");
        }
        this.#addEventListeners();
    }

    #addEventListeners() {

        for (let i = 0; i < this.inputs.length; i++) {

            const input = this.inputs[i];

            input.addEventListener("input", this.#inputListener.bind(this));
        }

        this.form.addEventListener("submit", this.#formValidate.bind(this));
    }

    #inputListener(event) {
        event.preventDefault();

        switch (event.target.name) {
            case INPUT_NAME:
                this.#handleInputName(event.target);
                break;
            case INPUT_LAST_NAME:
                this.#handleInputName(event.target);
                break;
            case INPUT_NUMBER:
                this.#handleInputNumber(event.target);
                break;
        }

    }

    #formValidate(event) {
        event.preventDefault();

        if (this.form.checkValidity() && this._valid) {

            this.form.reset();
            this.callback(this.formData);
        }
    }

    #handleInputName(inputName) {

        this._valid = this.#isValidName(inputName);

        if (this._valid) {
            inputName.setCustomValidity('');

            if (inputName.name === INPUT_NAME) {
                this.formData.name = inputName.value;
            }
            else {
                this.formData.lastName = INPUT_LAST_NAME;
            }
        }
        else {
            inputName.setCustomValidity('invalid');
        }
    }

    #handleInputNumber(inputNumber) {

        this._valid = this.#isValidNumber(inputNumber);

        if (this._valid) {
            inputNumber.setCustomValidity('');
            this.formData.amount = inputNumber.value;
        }
        else {
            inputNumber.setCustomValidity('invalid');
        }
    }

    #isValidName(name) {
        return name.value.length > 1 && this.nameRegExp.test(name.value);
    }
    #isValidNumber(number) {
        return number.value.length >= this.maxNumberLength && this.numberRegExp.test(number.value);
    }
}