import {HttpRequest} from "../utils/validation.utils.js";
import authRoutes from "../auth/authRoutes.js";
import {Auth} from "../auth/auth.js";
import config from "../config/config.js";
import regexp from "../utils/regexp.js";

export class FormValidation {

    constructor(form, callback,maxNumbers = 8) {
        this.emailRegExp = regexp.emailRegExp;
        this.nameRegExp = regexp.nameRegExpBasic;
        this.passwordRegExp = regexp.passwordStrongRegExp;
        this.valid = false;
        this.remember = false;
        this.form = document.querySelector(form);
        this.btn = this.form.querySelector("button[type='submit']");
        this.callback = callback;
        this.maxNumbers = maxNumbers;

        if(this.form) {
            this.inputs = this.form.querySelectorAll('input');
        }

        if (this.inputs) {

            for (let i = 0; i < this.inputs.length; i++) {

                const input = this.inputs[i];

                if (input.type === 'checkbox') {
                    input.addEventListener("click", this.#handleCheckbox.bind(this));
                    continue;
                }
                input.addEventListener("input", this.#handleInput.bind(this));
            }

            this.form.addEventListener("submit", this.#handleValidate.bind(this));
        }
    }

    #handleValidate(event) {
        event.preventDefault();

        if (this.form.checkValidity() && this.valid) {

            let user = {
                firstname: "",
                lastname: "",
                email: "",
                password: "",
                passwordRepeat: "",
                remember: false,
            }

            for (let i = 0; i < this.inputs.length; i++) {

                const input = this.inputs[i];

                if (input.name === 'name') {
                    user.firstname = input.value.trim();
                }
                if (input.name === 'lastname') {
                    user.lastname = input.value.trim();
                }
                if (input.type === 'email') {
                    user.email = input.value.trim();
                }
                if (input.name === 'password') {
                    user.password = input.value.trim();
                }
                if (input.name === 'reppassword') {
                    user.passwordRepeat = input.value.trim();
                }
            }

            this.form.reset();

            if (user.firstname.length > 0) {
                //Signup
                this.#requestSignup(user).then();
            }
            else {
                //Login
                this.#requestLogin(user).then();
            }
        }
    }

    async #requestSignup(user) {

        try {

            const body = {
                name: user.firstname,
                lastName: user.lastname,
                email: user.email,
                password: user.password,
                passwordRepeat: user.passwordRepeat,
            };
            const result = await HttpRequest.sendRequest(authRoutes.signup, "POST", body);

            if (result.error || !result.user.id) {
                throw new TypeError(result.message);
            }
            //Time to Party
            history.pushState(null, null, '/login');
            this.callback();
        }
        catch (error) {
            this.#setErrorMessage(error.message);
        }
    }
    async #requestLogin(user) {

        this.btn.classList.remove("is-invalid");
        this.btn.nextElementSibling.textContent = '';

        try {

            const body = {
                email: user.email,
                password: user.password,
                rememberMe: this.remember,
            };

            const result = await HttpRequest.sendRequest(authRoutes.login, "POST", body);

            //Time to Party
            Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);

            Auth.userInfo.name = result.user.name;
            Auth.userInfo.lastName = result.user.lastName;
            Auth.userInfo.email = user.email;
            Auth.userInfo.userId = result.user.id;

            localStorage.setItem("madJunUserInfo", JSON.stringify({
                name: Auth.userInfo.name,
                lastName: Auth.userInfo.lastName,
                email: Auth.userInfo.email,
                userId: Auth.userInfo.userId,
            }));

            history.pushState(null, null, config.ROUTE_DASHBOARD);
            this.callback();
        }
        catch (error) {
            this.#setErrorMessage(error.message);
        }
    }
    #setErrorMessage(message) {
        console.log(message);
        this.btn.classList.add("is-invalid");
        this.btn.nextElementSibling.textContent = message;
    }
    #handleInput(event){

        this.btn.classList.remove("is-invalid");

        switch (event.target.name) {
            case 'name':
                this.#handleInputName(event.target);
                break;
            case 'lastname':
                this.#handleInputName(event.target);
                break;
            case 'email':
                this.#handleInputUserEmail(event.target);
                break;
            case 'password':
                this.#handleInputUserPassword(event.target);
                break;
            case 'reppassword':
                this.#handleInputUserRepassword(event.target);
                break;
        }
    }

    #isValidName(name) {
        return name.value.length > 1 && this.nameRegExp.test(name.value);
    }

    #handleInputName(target){

        this.valid = this.#isValidName(target);

        if (this.valid) {
            target.classList.remove("is-invalid");
            target.parentElement.lastElementChild.textContent = '';
            target.setCustomValidity('');
        }
        else {
            target.classList.add("is-invalid");

            if (target.value.length < 2) {
                target.parentElement.lastElementChild.textContent = 'Имя не менее 2 букв';
            }
            target.setCustomValidity('invalid');
        }
    }

    #handleInputUserEmail(target) {

        this.valid = this.#isValidEmail(target);

        if (this.valid) {
            target.classList.remove("is-invalid");
            target.parentElement.lastElementChild.textContent = '';
            target.setCustomValidity('');
        }
        else {
            target.classList.add("is-invalid");
            target.parentElement.lastElementChild.textContent = 'Пожалуйста введите коррктный email адрес';
            target.setCustomValidity('invalid');
        }
    }

    #isValidEmail(target) {
        return target.value.length >= 6 && this.emailRegExp.test(target.value);
    }

    #handleInputUserPassword(target) {
        this.valid = this.#isValidPassword(target);

        if (this.valid) {
            target.classList.remove("is-invalid");
            target.parentElement.lastElementChild.textContent = '';
            target.setCustomValidity('');
        }
        else {
            if (target.value.length < this.maxNumbers) {
                target.parentElement.lastElementChild.textContent = `Минимум ${this.maxNumbers} символов`;
            }
            else {
                target.parentElement.lastElementChild.textContent = 'Пароль должен состоять из букв верхнего и нижнего регистра, цифр и миниму одного спец символа';
            }
            target.classList.add("is-invalid");
            target.setCustomValidity('invalid');
        }
    }
    #isValidPassword(target) {
        return target.value.length >= this.maxNumbers && this.passwordRegExp.test(target.value);
    }

    #handleInputUserRepassword(target) {
        let password = target.parentElement.previousElementSibling.firstElementChild.nextElementSibling.value;
        this.valid = password === target.value;

        if (this.valid) {
            target.classList.remove("is-invalid");
            target.parentElement.lastElementChild.textContent = '';
            target.setCustomValidity('');
        }
        else {
            target.parentElement.lastElementChild.textContent = 'Несовпадение!';
            target.classList.add("is-invalid");
            target.setCustomValidity('invalid');
        }
    }
    #handleCheckbox(e) {

        this.valid = e.target.checked;
        this.remember = e.target.checked;

        if (e.target.name !== "remember") {
            if (this.valid) {
                e.target.classList.remove("is-invalid");
                e.target.parentElement.lastElementChild.textContent = '';
                e.target.setCustomValidity('');
            }
            else {
                e.target.parentElement.lastElementChild.textContent = 'Please check the box';
                e.target.classList.add("is-invalid");
                e.target.setCustomValidity('invalid');
            }
        }
    }
}