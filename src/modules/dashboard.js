import config from "../config/config.js";
import {Auth} from "../auth/auth.js";
import {Notify} from "../utils/notification.js";
import {HttpRequest} from "../utils/validation.utils.js";
import authRoutes from "../auth/authRoutes.js";
import {Validator} from "../utils/validator.js";
import {Fsm} from "./fsm.js";

const DASHBOARD_MESSAGE_TITLE = 'MJ Lumincoin Studio';
const DASHBOARD_USER_NAME_SELECTOR = ".dashboard-user-name";
const DASHBOARD_NAV_LINK_SELECTOR = "a[data-node-type='dashboard-link']";
const DASHBOARD_NAME_SELECTOR = ".content-header-title";
const DASHBOARD_FORM_ID = "#form-deposit";
const DASHBOARD_BALANCE_SELECTOR = ".balance-info";
const DASHBOARD_INCOME_SELECTOR = "incomeChart";
const DASHBOARD_EXPENSES_SELECTOR = "expensesChart";
const DASHBOARD_FILTER_SELECTOR = ".main-filter";
const DASHBOARD_BACK_TO_TOP = ".back-top";

export class Dashboard {
    static balance = null;

    constructor(dashboardName = config.DASHBOARD_HOME, options = {}) {

        let Default = {
            state: config.STATE_DASHBOARD,
            defaultState: config.STATE_DASHBOARD,
            requestUrl: null,
            message: '',
        }
        this.filterLabels = [
                "Сегодня",
                "Неделя",
                "Месяц",
                "Год",
                "Все",
        ];

        this.options = $.extend({}, Default, options);
        this._dashboardName = dashboardName;
        this.dashboardTtitle = document.querySelector(DASHBOARD_NAME_SELECTOR);
        this.accessToken = Auth.getAccessToken();
        this.refreshToken = Auth.getRefreshToken();
        this.header = {
            name: authRoutes.headerName,
            value: this.accessToken,
        }
        this.data = null;
        this.colors = ['red', 'orange', 'yellow', 'green', 'blue'];
        this.dashboardCallbacks = [];
        this.skins = [];
        this.currentState = (this.options.state - this.options.defaultState);
        this.previousState = this.currentState;
        this.balanceEl = document.querySelector(DASHBOARD_BALANCE_SELECTOR);
        this._filter = null;
        this._dashboardDatePicker = null;
        this._isDatePickerShowing = false;
        this.targetId = null;

        this._incomeCtx = null;
        this._expensesCtx = null;

        window.addEventListener("scroll", this.#setScrollObserver.bind(this));

        this.#setAdminName();
        this.#setActiveDashboard();
        this.#setContentHeader();
        this.#checkMessage();

        if (Dashboard.balance === null) {
            this.dashboardRequestHandler(authRoutes.getBalance, this.#setupBalance.bind(this));
        }
        else {
            this.balanceEl.textContent = Dashboard.balance + "$";
        }
        new Validator(DASHBOARD_FORM_ID, this.#formDataReceiver.bind(this));

        Fsm.clear();
        Fsm.registerState(config.STATE_DASHBOARD, this.#dashboardMain.bind(this));
    }

    initialize() {
        Fsm.callCurrentState(this.options.state);
    }
    #setAdminName() {
        let userInfo = document.querySelector(DASHBOARD_USER_NAME_SELECTOR);
        if (userInfo) {
            userInfo.textContent = Auth.userInfo.name + " " + Auth.userInfo.lastName;
        }
    }

    #setActiveDashboard() {

        const dashboardLinks = document.querySelectorAll(DASHBOARD_NAV_LINK_SELECTOR);

        if (dashboardLinks.length > 0) {

            let index = 0;
            let j = 0;
            let found = false;
            let name = this._dashboardName.toLowerCase();

            dashboardLinks.forEach(link => {
                link.classList.remove("active");
                if (link.dataset.nodeName === name) {
                    index = j;
                    found = true;
                }
                ++j;
            });

            if (found) {
                dashboardLinks[index].classList.add("active");

                if (dashboardLinks[index].parentElement.parentElement.classList.contains("nav-treeview")) {
                    dashboardLinks[index].parentElement.parentElement.parentElement.classList.add("menu-is-opening", "menu-open");
                }


            }
        }
    }

    #setContentHeader() {

        if (this.dashboardTtitle) {
            this.dashboardTtitle.textContent = this._dashboardName;
        }
    }

    #checkMessage() {

        if (this.options.message !== undefined && this.options.message.length > 0) {
            this.showMessageBox(this.options.message);
        }
    }

    #setupBalance(balance) {

        if (balance !== null) {
            Dashboard.balance = balance.balance;
            this.balanceEl.textContent = balance.balance + "$";
        }
    }

    #dashboardMain() {

        this.createFilter();
        this._incomeCtx = document.getElementById(DASHBOARD_INCOME_SELECTOR).getContext("2d");
        this._expensesCtx = document.getElementById(DASHBOARD_EXPENSES_SELECTOR).getContext("2d");
        this.#setupCharts();
    }

    createFilter() {

        this._filter = document.querySelector(DASHBOARD_FILTER_SELECTOR);

        for (let i = 0; i < this.filterLabels.length; i++) {
            let label = this.filterLabels[i];
            let button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.classList.add("btn", "btn-outline-secondary");

            if(i === 0) {
                button.classList.add("active");
            }

            this._filter.appendChild(button);
        }

        let divInputGroup = document.createElement("div");
        divInputGroup.className = "input-group";

        let divPrepend = document.createElement("div");
        divPrepend.className = "input-group-prepend";

        let Divbutton = document.createElement("button");
        Divbutton.textContent = "Интервал";
        Divbutton.classList.add("btn", "btn-outline-secondary", "btn-trigger");
        Divbutton.style.width = "120px";

        let i = document.createElement("i");
        i.classList.add("fas", "fa-calendar");
        i.style.paddingLeft = "5px";

        Divbutton.appendChild(i);
        Divbutton.addEventListener("click", this.#rangeButton.bind(this));
        divPrepend.appendChild(Divbutton);

        let input = document.createElement("input");
        input.type = "text";
        input.name = "datetimepicker";

        divInputGroup.appendChild(divPrepend);
        divInputGroup.appendChild(input);

        this._filter.appendChild(divInputGroup);

        this.initializePicker();
    }

    #rangeButton(e) {

        let drp = $(this._dashboardDatePicker).data('daterangepicker');

        if (this._isDatePickerShowing) {
            drp.hide(e);
            this._isDatePickerShowing = false;
        } else {
            drp.show(e);
            this._isDatePickerShowing = true;
        }
    }

    initializePicker(name = 'input[name="datetimepicker"]', bSingle = false, autoUpdate = false) {
        let options = {
            singleDatePicker: bSingle,
            showDropdowns: true,
            minYear: 1901,
            maxYear: parseInt(moment().format('YYYY'),10),
            opens: 'right',
            drops: "down",
            autoUpdateInput: autoUpdate,
            format: "YYYY-MM-DD",
            locale: {
                cancelLabel: 'Clear'
            },
        }

        this._dashboardDatePicker = $(name).daterangepicker(options);
        this._dashboardDatePicker.on('apply.daterangepicker', this.pickerHandler.bind(this));
    }

    pickerHandler(e, picker) {

        console.log(picker.startDate.format('YYYY-MM-DD'));

    }
    #setupCharts() {

        let chartData1        = {
            labels: [
                'Red',
                'Orange',
                'Yellow',
                'Green',
                'Blue',
            ],
            datasets: [
                {
                    data: [700,500,400,600,300],
                    backgroundColor : this.colors,
                }
            ]
        }
        let chartData2        = {
            labels: [
                'Red',
                'Orange',
                'Yellow',
                'Green',
                'Blue',
            ],
            datasets: [
                {
                    data: [200,500,300,100,600],
                    backgroundColor : this.colors,
                }
            ]
        }
        let chartOptions     = {
            maintainAspectRatio : false,
            responsive : true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }

        new Chart(this._incomeCtx, {
            type: 'pie',
            data: chartData1,
            options: chartOptions
        });
        new Chart(this._expensesCtx, {
            type: 'pie',
            data: chartData2,
            options: chartOptions
        });


    }

    dashboardRequestHandler(url, callback) {
        this.sendRequest(url).then((response) => callback(response));
    }

    dashboardPostRequestHandler(url, method, body,callback) {
        this.sendRequest(url, method, body).then((response) => callback(response));
    }

    async sendRequest(url = authRoutes.getBalance, method = "GET", body = null) {

        let response = null;

        try {
            response = await HttpRequest.sendRequest(url,method,body, this.header);
        }
        catch (e) {
            this.showErrorMessageBox(e.message);

            if (e.message === "jwt expired") {

                try {
                    const r = await HttpRequest.sendRequest(authRoutes.refresh,"POST", {
                        refreshToken: this.refreshToken,
                    });

                    this.header.value = r.tokens.accessToken;
                    this.accessToken = this.header.value;
                    this.refreshToken = r.tokens.refreshToken;

                    Auth.clearAccessTokens();
                    Auth.setTokens(this.accessToken, this.refreshToken);

                    response = await HttpRequest.sendRequest(url,"GET",null, this.header);
                }
                catch (e) {
                    this.showErrorMessageBox(e.message);
                }
            }
        }
        return response;
    }

    #formDataReceiver(formData) {

        let body = {
            newBalance: parseFloat(formData.amount),
        }
        this.sendRequest(authRoutes.getBalance, "PUT", body).then((response) => {

            this.#setupBalance(response);
        });
    }

    #setScrollObserver(e) {

        let scroll = $(window).scrollTop();
        if (scroll < 400) {
            $(DASHBOARD_BACK_TO_TOP).fadeOut(500);
        } else {
            $(DASHBOARD_BACK_TO_TOP).fadeIn(500);
        }
    }

    toggleState() {
        this.currentState ^= 1;
    }

    setSkin(parent) {

        parent.classList.remove(this.skins[this.previousState]);
        parent.classList.add(this.skins[this.currentState]);
        this.previousState = this.currentState;
    }

    showErrorMessageBox(msg) {
        Notify.MessageBox(msg,DASHBOARD_MESSAGE_TITLE, 'bg-danger');
    }
    showMessageBox(msg) {
        Notify.MessageBox(msg,DASHBOARD_MESSAGE_TITLE, 'bg-success');
    }
    showMessageBoxEx(msg, type) {
        Notify.MessageBox(msg,DASHBOARD_MESSAGE_TITLE,type);
    }
}