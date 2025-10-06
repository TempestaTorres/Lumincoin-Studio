import {Dashboard} from "./dashboard.js";
import config from "../config/config.js";
import {Fsm} from "./fsm.js";
import authRoutes from "../auth/authRoutes.js";

const CATEGORY_BUTTON_DELETE_ID = "#warning-dialog-button-delete";
const CATEGORY_ADD_CARD_SELECTOR = "#small-box-add";
const CATEGORY_ITEMS_WRAPPER_SELECTOR = ".category-items-wrapper";
const CATEGORY_LAST_CHILD_SELECTOR = ".last-child-item";

export class Category extends Dashboard {
    constructor(dashboardName = config.DASHBOARD_CATEGORY_INCOME, options = {
        state: config.STATE_CATEGORY_INCOME,
        defaultState: config.STATE_CATEGORY_INCOME,
        requestUrl: null,
        message: '',
    }) {
        super(dashboardName, options);

        this._targetForDelete = null;

        this.skins = [
            "success-outline",
            "danger-outline",
        ];
        this.onPageRoutes = [
            config.ROUTE_CREATE_CATEGORY_INCOME,
            config.ROUTE_CREATE_CATEGORY_EXPENSE,
        ];
        this.onCardRoutes = [
            config.ROUTE_EDIT_CATEGORY_INCOME,
            config.ROUTE_EDIT_CATEGORY_EXPENSE,
        ];
        this.onCardDeleteRoutes = [
            authRoutes.createCategoryIncome,
            authRoutes.createCategoryExpense,
        ];


        this._wrapper = document.querySelector(CATEGORY_ITEMS_WRAPPER_SELECTOR);
        this._lastCard = document.querySelector(CATEGORY_LAST_CHILD_SELECTOR);
        this._addCardSelector = document.querySelector(CATEGORY_ADD_CARD_SELECTOR);
        this._categoryButtonDel = document.querySelector(CATEGORY_BUTTON_DELETE_ID);

        Fsm.registerState(options.state, this.#categoryMain.bind(this));
    }

    initialize() {

        this.setSkin(this._addCardSelector);
        this._addCardSelector.parentElement.href = this.onPageRoutes[this.currentState];
        this._addCardSelector.firstElementChild.firstElementChild.dataset.target = this.onPageRoutes[this.currentState];
        super.initialize();
    }

    #categoryMain() {

        this.dashboardRequestHandler(this.options.requestUrl, this.#setupCategories.bind(this));

    }

    #setupCategories(response) {

        if (Array.isArray(response) && response.length > 0) {

            for (let category of response) {
                this.#setupCategory(category);
            }

            this._wrapper.addEventListener("click", this.#confirmObserver.bind(this));
            this._categoryButtonDel.addEventListener("click", this.#buttonDeleteHandler.bind(this));
        }
    }

    #confirmObserver(e) {
        e.preventDefault();

        if (e.target.nodeName === "BUTTON") {
            this.targetId = e.target.dataset.targetId;
            this._targetForDelete = e.target.parentElement.parentElement.parentElement.parentElement;
        }
        else if (e.target.nodeName === "I" && e.target.parentElement.nodeName === "BUTTON") {
            this.targetId = e.target.parentElement.dataset.targetId;
            this._targetForDelete = e.target.parentElement.parentElement.parentElement.parentElement.parentElement;
        }
        else {
            this.targetId = null;
        }
    }

    #buttonDeleteHandler(e) {
        e.preventDefault();

        if (this.targetId) {
            this.dashboardPostRequestHandler(this.onCardDeleteRoutes[this.currentState] + this.targetId, "DELETE", null, this.#requestCategoryCallback.bind(this));
        }

    }
    #requestCategoryCallback(response) {

        if (!response.error) {
            this._targetForDelete.remove();
            this.showMessageBox(response.message);
        }
        else {
            this.showErrorMessageBox(response.message);
        }
    }

    #setupCategory(category) {

        let divCol = document.createElement("div");
        divCol.classList.add("col-md-3", "col-sm-6", "col-12");
        divCol.style.padding = "7.5px";

        let smallBox = document.createElement("div");
        smallBox.classList.add("small-box", "bg-light", "flex", "h-100", this.skins[this.currentState]);

        let inner = document.createElement("div");
        inner.classList.add("inner");

        let h3 = document.createElement("h3");
        h3.className = "category-type";
        h3.textContent = category.title;

        inner.appendChild(h3);
        smallBox.appendChild(inner);

        let icon = document.createElement("div");
        icon.classList.add("icon");

        let i = document.createElement("i");
        i.classList.add("ion", "ion-stats-bars");

        icon.appendChild(i);
        smallBox.appendChild(icon);

        let smallBoxBody = document.createElement("div");
        smallBoxBody.classList.add("small-box-body");

        let div = document.createElement("div");
        div.className = "small-box-group-button";

        let btnEdit = document.createElement("a");
        btnEdit.classList.add("btn", "btn-primary");
        btnEdit.textContent = "Редактировать";
        btnEdit.href = this.onCardRoutes[this.currentState] + "?id=" + category.id;

        //Button delete
        let btnDelete = document.createElement("button");
        btnDelete.classList.add("btn", "btn-danger");
        btnDelete.type = "button";
        btnDelete.textContent = "Удалить";
        btnDelete.dataset.targetId = "/" + category.id;
        btnDelete.dataset.toggle = "modal";
        btnDelete.dataset.target = "#modal-warning";

        let trash = document.createElement("i");
        trash.classList.add("far", "fa-trash-alt");
        trash.style.paddingLeft = "6px";

        btnDelete.appendChild(trash);

        div.appendChild(btnEdit);
        div.appendChild(btnDelete);

        smallBoxBody.appendChild(div);
        smallBox.appendChild(smallBoxBody);

        divCol.appendChild(smallBox);

        this._wrapper.insertBefore(divCol, this._lastCard);

        this._lastCard.style.padding = "7.5px";
    }
}