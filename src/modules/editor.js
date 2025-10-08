import {Dashboard} from "./dashboard.js";
import config from "../config/config.js";
import {Fsm} from "./fsm.js";
import {Url} from "../utils/qurlparams.js";
import authRoutes from "../auth/authRoutes.js";

const EDITOR_SELECTOR = ".card";
const EDITOR_SELECT_CATEGORY_ID = "inputCategory";
const EDITOR_CONTROL_SELECTOR = ".editor-control";
const EDITOR_DATE_SELECTOR = "inputDate";
const EDITOR_AMOUNT_SELECTOR = "inputAmount";
const EDITOR_COMMENTS_SELECTOR = "inputInfo";
const EDITOR_BUTTON_DISABLED = "disabled";
const EDITOR_INVALID_FIELD = "is-warning";
const EDITOR_VALID_FIELD = "is-valid";
const EDITOR_COLOR_SELECTOR = "#color-chooser";
const EDITOR_CATEGORY_SELECTOR = "new-event";
const EDITOR_ADD_COLOR_SELECTOR = ".btn-editor-add-color";
const EDITOR_ERROR_MESSAGE = "Операция выполнена с ошибкой.";

export class Editor extends Dashboard {
    constructor(dashboardName = config.DASHBOARD_CREATE_NEW, options = {
        state: config.STATE_CREATE_INCOME,
        defaultState: config.STATE_CREATE_INCOME,
        requestUrl: null,
        message: '',
    }) {
        super(dashboardName, options);

        this._selectCategory = null;
        this._select2 = null;
        this._select2Container = null;
        this._select2rendered = null;
        this._colorChooser = null;
        this._addColorButton = null;
        this._formControles = document.querySelectorAll(EDITOR_CONTROL_SELECTOR);
        this._editorButtons = document.querySelector(".editor-group-buttons");

        this._editor = document.querySelector(EDITOR_SELECTOR);
        this._picker = null;
        this._editorData = {};
        this._editorPreviouseData = {};
        this.skins = [
                "card-success",
                "card-danger",
                "card-success",
                "card-danger",
                "card-success",
                "card-danger",
                "card-success",
                "card-danger",
        ];
        this.dashboardCallbacks = [
            this.#editorCreateOperationIncomeExpenses,
            this.#editorEditIncomeExpenses,
            this.#editorCreateCategoryIncomeExpenses,
            this.#editorEditCategoryIncomeExpenses,
        ]
        this._messages = [
                "Операция успешно создана",
                "Операция успешно обновлена",
                "Категория успешно создана",
                "Категория успешно обновлена",
        ];
        this._requestUrls = [
                authRoutes.getIncomeCategories,
                authRoutes.getExpenseCategories,
                authRoutes.getIncomeCategories,
                authRoutes.getExpenseCategories,
        ]

        this._currentStateIndex = Math.floor(this.currentState / 2);

        Fsm.registerState(options.state, this.dashboardCallbacks[this._currentStateIndex].bind(this));
    }
    initialize() {

        this.setSkin(this._editor);
        super.initialize();
    }

    #editorCreateOperationIncomeExpenses() {

        this.#editorCommonOperation();

    }

    #editorEditIncomeExpenses() {

        this.#editorCommonOperation(false);
        this.targetId = Url.getLocationParam("id");
        this.dashboardRequestHandler(this.options.requestUrl + "/" + this.targetId, this.#requestOperationEditorCallback.bind(this));
    }

    #requestOperationEditorCallback(response) {

        if (response.id) {

            console.log(response);

            this._editorData.type = response.type;
            this._editorData.amount = response.amount;
            this._editorData.date = response.date;
            this._editorData.comment = response.comment;

            this._editorPreviouseData.type = response.type;
            this._editorPreviouseData.amount = response.amount;
            this._editorPreviouseData.date = response.date;
            this._editorPreviouseData.comment = response.comment;

            this._formControles[2].value = this._editorData.amount;
            this._formControles[3].value = this._editorData.date;
            this._formControles[4].value = this._editorData.comment;

            let categories = this._selectCategory.children();

            for (let category of categories) {
                if (category.textContent === response.category) {
                    category.selected = true;
                    this._editorData.category_id = parseInt(category.value, 10);
                    this._editorPreviouseData.category_id = this._editorData.category_id;
                    this._selectCategory.val(category.value);
                    this._selectCategory.trigger('change');
                    break;
                }
            }


            this.#checkControlsValid();
        }
        else {
            this.showErrorMessageBox(EDITOR_ERROR_MESSAGE);
        }
    }

    #editorCommonOperation(bCheckIsValid = true) {

        this._selectCategory = $(`#${EDITOR_SELECT_CATEGORY_ID}`);
        this._editorButtons.children[0].href = config.ROUTE_INCOME_EXPENSES;

        this._editorData = {
            type: '',
            amount: 0,
            date: '',
            comment: '',
            category_id: 0,
        };

        this.#initializeSelection();
        this.#initializeDatepicker();

        if (bCheckIsValid) {
            this.#checkControlsValid();
        }
        //Listeners
        this.#addEventListeners();
    }

    #editorCreateCategoryIncomeExpenses() {

        this.#editorCommonCategory();

    }

    #editorEditCategoryIncomeExpenses() {

        this.#editorCommonCategory(false);
        this.targetId = Url.getLocationParam("id");

        this.dashboardRequestHandler(this.options.requestUrl + "/" + this.targetId, this.#requestEditorCallback.bind(this));

    }

    #requestEditorCallback(response) {

        if (response.id) {
            this._editorData.title = response.title;
            this._formControles[0].value = response.title;
            this.#checkControlsValid();
        }
        else {
            this.showErrorMessageBox(EDITOR_ERROR_MESSAGE);
        }
    }

    #editorCommonCategory(bCheckIsValid = true) {
        this._editorData = {
            title: '',
        };
        if (this.options.state === config.STATE_CREATE_CATEGORY_INCOME || this.options.state === config.STATE_EDIT_CATEGORY_INCOME) {
            this.dashboardTtitle.textContent += " Дохода";
            this._editorButtons.children[0].href = config.ROUTE_CATEGORY_INCOME;
        }
        else {
            this.dashboardTtitle.textContent += " Расхода";
            this._editorButtons.children[0].href = config.ROUTE_CATEGORY_EXPENSE;
        }

        this._addColorButton = document.querySelector(EDITOR_ADD_COLOR_SELECTOR);
        this._colorChooser = document.querySelector(EDITOR_COLOR_SELECTOR);

        for (let i = 0; i < this._colorChooser.children.length; i++) {

            let li = this._colorChooser.children[i];
            li.firstElementChild.addEventListener("click", this.#pickColorHandler.bind(this));
        }

        this._addColorButton.addEventListener("click", this.#addColorButton.bind(this));
        this._formControles[0].addEventListener("input", this.#commonInputHandler.bind(this));
        this._editorButtons.children[1].addEventListener("click", this.#buttonSaveHandler.bind(this));

        if (bCheckIsValid) {
            this.#checkControlsValid();
        }
    }

    #initializeSelection(bValid = false) {

        //Select type
        let optionValue = this.currentState + 1;
        if (optionValue > 2) {
            optionValue -= 2;
        }
        let select = this._formControles[0];
        select[optionValue].selected = true;
        this._editorData.type = select[optionValue].value;

        //Select category Initialize Select2 Elements
        this._selectCategory.select2({
            theme: 'bootstrap4'
        });

        this._select2 = document.querySelector(".select2-selection");
        this._select2Container = document.querySelector(".select2-container");
        this._select2rendered = document.querySelector(".select2-selection__rendered");

        this.dashboardRequestHandler(this._requestUrls[this.currentState], this.#setupCategories.bind(this));

    }

    #setupCategories(response) {

        if (Array.isArray(response) && response.length > 0) {

            for (let category of response) {

                let newOption = new Option(category.title, category.id, false, false);
                this._selectCategory.append(newOption);
            }

        }
        else {
            this.showMessageBoxEx("Для этого типа нет категорий. Создайте категорию.", "bg-warning");
        }
    }

    #initializeDatepicker() {

        this._picker = $('#inputDate');
        this._picker.datetimepicker({
                    format: 'L'
                });

        this._picker.on("change.datetimepicker", this.datetimepickerHandler.bind(this));
        this.#checkControlsValid();
    }

    datetimepickerHandler(e) {
        this._editorData.date = e.date.format('YYYY-MM-DD');
        this.#checkControlsValid();
    }

    #checkControlsValid() {

        let result = true;

        for (let i = 0; i < this._formControles.length; ++i) {

            let form_cotrol = this._formControles[i];
            let value = form_cotrol.value;

            if (form_cotrol.id === EDITOR_SELECT_CATEGORY_ID && value === "Категория") {
                value = null;
            }

            if (value === "" || value === undefined || value === null) {
                result = false;

                if (form_cotrol.id === EDITOR_SELECT_CATEGORY_ID) {
                    this.#toggleSelect2(false);
                }
                else if (!form_cotrol.classList.contains(EDITOR_INVALID_FIELD)) {
                    form_cotrol.classList.add(EDITOR_INVALID_FIELD);
                    form_cotrol.classList.remove(EDITOR_VALID_FIELD);
                }
            }
            else {
                if (form_cotrol.id === EDITOR_SELECT_CATEGORY_ID) {
                    this.#toggleSelect2(true);
                }
                else if (!form_cotrol.classList.contains("is-valid")) {
                    form_cotrol.classList.remove(EDITOR_INVALID_FIELD);
                    form_cotrol.classList.add(EDITOR_VALID_FIELD);
                }
            }
        }
        this.#toggleButtonSave(result);
    }

    #toggleButtonSave(enabled) {
        if (enabled) {
            this._editorButtons.children[1].classList.remove(EDITOR_BUTTON_DISABLED);
        }
        else {
            this._editorButtons.children[1].classList.add(EDITOR_BUTTON_DISABLED);
        }
    }

    #toggleSelect2(bValid) {

        if (!bValid) {
            this._select2rendered.classList.add(EDITOR_INVALID_FIELD);
            this._select2.classList.add(EDITOR_INVALID_FIELD);
            this._select2Container.classList.add(EDITOR_INVALID_FIELD);
        }
        else {
            this._select2rendered.classList.add(EDITOR_VALID_FIELD);
            this._select2.classList.add(EDITOR_VALID_FIELD);
            this._select2Container.classList.add(EDITOR_VALID_FIELD);
        }
    }

    #addEventListeners() {

        this._editorButtons.children[1].addEventListener("click", this.#buttonSaveHandler.bind(this));

        this._formControles[0].addEventListener("change", this.#commonSelectHandler.bind(this));
        this._selectCategory.on('select2:select', this.#select2SelectHandler.bind(this));

        for (let i = 2; i < this._formControles.length; ++i) {

            if (i !== 3) {
                this._formControles[i].addEventListener("input", this.#commonInputHandler.bind(this));
            }
        }

        this._formControles[2].addEventListener("keypress", (evt) => {
            // Check if the pressed key is a char
            if (!/\d/.test(evt.key)) {
                evt.preventDefault();
            }
        });
    }

    #buttonSaveHandler(e) {
        e.preventDefault();

        if (!e.target.classList.contains(EDITOR_BUTTON_DISABLED)) {

            switch (this._currentStateIndex) {
                case 0:
                    this.#saveNewOperation();
                    break;
                case 1:
                    this.#saveNewOperation(this.options.requestUrl + "/" + this.targetId, "PUT");
                    break;
                case 2:
                    this.#saveNewCategory();
                    break;
                case 3:
                    this.#saveNewCategory(this.options.requestUrl + "/" + this.targetId, "PUT");
                    break;
            }
        }
    }

    #saveNewOperation(url = this.options.requestUrl , method = "POST") {

        if (method === "PUT") {

            if (this.#isDataChanged()) {
                console.log(this._editorData);
                this.dashboardPostRequestHandler(url, method, this._editorData, this.#responseOperationHandler.bind(this));
            }
            else {
                this.showMessageBoxEx("Внесите изменения.", "bg-warning");
            }
        }
        else {
            this.dashboardPostRequestHandler(url, method, this._editorData, this.#responseOperationHandler.bind(this));
        }
    }

    #isDataChanged() {
        let result = false;

        if (this._editorData.type !== this._editorPreviouseData.type || this._editorData.amount !== this._editorPreviouseData.amount || this._editorData.date !== this._editorPreviouseData.date || this._editorData.comment !== this._editorPreviouseData.comment
                || this._editorData.category_id !== this._editorPreviouseData.category_id) {
            result = true;
        }

        return result;
    }

    #responseOperationHandler(response) {

        if (response !== null && response.id) {
            this.showMessageBox(this._messages[this._currentStateIndex] + ": " + response.date);
        }
        else {
            this.showErrorMessageBox(EDITOR_ERROR_MESSAGE);
        }
    }

    #saveNewCategory(url = this.options.requestUrl , method = "POST") {

        this.sendRequest(this.options.requestUrl).then((response) => {

            if (Array.isArray(response)) {

                if (response.length > 0) {

                    let find = false;

                    for (let i = 0; i < response.length; i++) {
                        if (response[i].title === this._editorData.title) {
                            find = true;
                            break;
                        }
                    }
                    if (find) {
                        this.showErrorMessageBox("The category " + this._editorData.title + " already exists.");
                    }
                    else {
                        this.dashboardPostRequestHandler(url, method, this._editorData, this.#responseHandler.bind(this));
                    }
                }
                else {
                    this.dashboardPostRequestHandler(url, method, this._editorData, this.#responseHandler.bind(this));
                }
            }
        });
    }

    #responseHandler(response) {

        if (response !== null && response.id) {
            this.showMessageBox(this._messages[this._currentStateIndex] + ": " + response.title);
        }
        else {
            this.showErrorMessageBox(EDITOR_ERROR_MESSAGE);
        }
    }

    #clearCategories() {

        let ch = this._selectCategory.children();

        for (let i = 1; i < ch.length; i++) {
            ch[i].remove();
        }
    }

    #commonSelectHandler(e) {
        this._editorData.type = e.target.value;
        this.#checkControlsValid();

        this.toggleState();
        this.setSkin(this._editor);

        this.#clearCategories();
        this.dashboardRequestHandler(this._requestUrls[this.currentState], this.#setupCategories.bind(this));
    }

    #select2SelectHandler(e) {
        this._editorData.category_id = parseInt(e.target.value);
        this.#checkControlsValid();
    }

    #commonInputHandler(e) {

        switch (e.target.id) {
            case EDITOR_CATEGORY_SELECTOR:
                this._editorData.title = e.target.value;
                break;
            case EDITOR_AMOUNT_SELECTOR:
                this._editorData.amount = parseInt(e.target.value);
                break;
            case EDITOR_COMMENTS_SELECTOR:
                this._editorData.comment = e.target.value;
                break;
        }
        this.#checkControlsValid();
    }

    #pickColorHandler(e) {
        e.preventDefault();

        let currColor = $(e.currentTarget).css('color');

        $(this._addColorButton).css({
            'background-color': currColor,
            'border-color'    : currColor
        });
        this._addColorButton.dataset.index = e.currentTarget.dataset.index;
    }
    #addColorButton(e) {
        e.preventDefault();

        console.log(e.target.dataset.index);
    }
}