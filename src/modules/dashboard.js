import config from "../config/config.js";
import {Auth} from "../auth/auth.js";
import {Notify} from "../utils/notification.js";
import {HttpRequest} from "../utils/validation.utils.js";
import authRoutes from "../auth/authRoutes.js";
import {Validator} from "../utils/validator.js";
import {Fsm} from "./fsm.js";

const DASHBOARD_THEME_NAME = "lumincoin-studio-theme";
const DASHBOARD_SIDEBAR = ".main-sidebar";
const DASHBOARD_NAVBAR = ".main-header.navbar";
const DASHBOARD_FOOTER = ".main-footer";
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
const DASHBOARD_THEME_SWITCH_SELECTOR = "#dashboard-theme-checkbox";

export class Dashboard {
    static balance = null;

    constructor(dashboardName = config.DASHBOARD_HOME, options = {}) {

        let Default = {
            state: config.STATE_DASHBOARD,
            defaultState: config.STATE_DASHBOARD,
            requestUrl: null,
            message: '',
        }
        this.filter = null;
        this.filterOptions = ["","?period=week","?period=month","?period=year","?period=all","?period=interval&dateFrom="];
        this.filterIndex = 0;
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
        this.dashboardCallbacks = [];
        this.skins = [];
        this.currentState = (this.options.state - this.options.defaultState);
        this.previousState = this.currentState;
        this.balanceEl = document.querySelector(DASHBOARD_BALANCE_SELECTOR);
        this.dashboardDatePicker = null;
        this._isDatePickerShowing = false;
        this.targetId = null;
        this.triggerBtn = null;
        this._themeSwitch = $(DASHBOARD_THEME_SWITCH_SELECTOR);
        this._sideBar = document.querySelector(DASHBOARD_SIDEBAR);
        this._navBar = document.querySelector(DASHBOARD_NAVBAR);
        this._footer = document.querySelector(DASHBOARD_FOOTER);
        this._sideBarStates = [
                "sidebar-light-primary",
                "sidebar-dark-primary",
        ];
        this._navBarStates = [
                "navbar-white",
                "navbar-gray-dark",
        ];
        let index = localStorage.getItem(DASHBOARD_THEME_NAME);
        if (index) {
            this._sideBarIndex = parseInt(index, 10);
        }
        else {
            this._sideBarIndex = 0;
        }

        this._sideBar.classList.add(this._sideBarStates[this._sideBarIndex]);
        this._navBar.classList.add(this._navBarStates[this._sideBarIndex]);

        if (this._sideBarIndex !== 0) {
            this._footer.classList.add("footer-dark");
        }

        this._chartIncome = null;
        this._chartExpense = null;

        this._incomeCtx = null;
        this._expenseCtx = null;

        window.addEventListener("scroll", this.#setScrollObserver.bind(this));
        new Validator(DASHBOARD_FORM_ID, this.#formDataReceiver.bind(this));

        this.#setAdminName();
        this.#setActiveDashboard();
        this.#setContentHeader();
        this.#checkMessage();

        this.dashboardRequestHandler(authRoutes.getBalance, this.#setupBalance.bind(this));
        this._themeSwitch.bootstrapSwitch('onSwitchChange', this.#switch.bind(this));

        Fsm.clear();
        Fsm.registerState(config.STATE_DASHBOARD, this.#dashboardMain.bind(this));
    }

    initialize() {

        Fsm.callCurrentState(this.options.state);
    }

    #switch() {

        this._sideBar.classList.remove(this._sideBarStates[this._sideBarIndex]);
        this._navBar.classList.remove(this._navBarStates[this._sideBarIndex]);
        this._sideBarIndex ^= 1;
        this._sideBar.classList.add(this._sideBarStates[this._sideBarIndex]);
        this._navBar.classList.add(this._navBarStates[this._sideBarIndex]);

        this._footer.classList.toggle("footer-dark");

        localStorage.removeItem(DASHBOARD_THEME_NAME);
        localStorage.setItem(DASHBOARD_THEME_NAME, `${this._sideBarIndex}`);

        return true;
    }

    #setupBalance(balance) {

        if (balance !== null) {
            Dashboard.balance = balance.balance;
            this.balanceEl.textContent = balance.balance + "$";
        }
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

    updateBalance() {
        this.dashboardRequestHandler(authRoutes.getBalance, this.#setupBalance.bind(this));
    }

    #dashboardMain() {

        this.createFilter(this.#dashboardFilterHandler.bind(this));
        this.initializePicker();

        this._incomeCtx = document.getElementById(DASHBOARD_INCOME_SELECTOR).getContext("2d");
        this._expenseCtx = document.getElementById(DASHBOARD_EXPENSES_SELECTOR).getContext("2d");

        let options = {
            maintainAspectRatio : false,
            responsive : true,
            plugins: {
                legend: {
                    display: true
                }
            },
            title: {
                display: true,
                text: 'График'
            }
        };

        this._chartIncome = new Chart(this._incomeCtx, {
            type: 'pie',
            data: {},
            options: options,
        });
        this._chartExpense = new Chart(this._expenseCtx, {
            type: 'pie',
            data: {},
            options: options,
        });

        this.dashboardRequestHandler(authRoutes.getOperations, this.#setupCharts.bind(this));
    }

    createFilter(callback) {

        this.filter = document.querySelector(DASHBOARD_FILTER_SELECTOR);

        for (let i = 0; i < this.filterLabels.length; i++) {
            let label = this.filterLabels[i];
            let button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.classList.add("btn", "btn-outline-secondary");
            button.dataset.nodeIndex = `${i}`;

            if(i === 0) {
                button.classList.add("active");
            }

            this.filter.appendChild(button);
            button.addEventListener("click", callback);
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

        this.filter.appendChild(divInputGroup);
        this.triggerBtn = document.querySelector(".btn-trigger");
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

        this.dashboardDatePicker = $(name).daterangepicker(options);
        this.dashboardDatePicker.on('apply.daterangepicker', this.pickerHandler.bind(this));
    }

    pickerHandler(e, picker) {

        this.pickerUpdate(picker);
        this.#removeChartsData();

        let url = authRoutes.getOperations + this.filterOptions[5] + picker.startDate.format('YYYY-MM-DD') + "&dateTo=" + picker.endDate.format('YYYY-MM-DD');

        this.dashboardRequestHandler(url, this.#setupCharts.bind(this));

    }

    pickerUpdate(picker) {
        this.#resetFilterActiveButton();
        this.triggerBtn.classList.add("active");
        this.filterIndex = -1;
        $(this.dashboardDatePicker).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
    }

    #dashboardFilterHandler(e) {

        if (this.isFilterButtonReady(e.target)) {

            this.#removeChartsData();

            if (this.filterIndex === 0) {

                this.dashboardRequestHandler(authRoutes.getOperations, this.#setupCharts.bind(this));
            }
            else {
                this.dashboardRequestHandler(authRoutes.getOperations + this.filterOptions[this.filterIndex], this.#setupCharts.bind(this));
            }
        }
    }

    #removeChartsData() {
        this._chartIncome.data.datasets.pop();
        this._chartExpense.data.datasets.pop();
        this._chartIncome.update();
        this._chartExpense.update();
    }

    isFilterButtonReady(button) {

        let result = false;
        let btnIndex = parseInt(button.dataset.nodeIndex);

        if (btnIndex !== this.filterIndex) {
            this.filterIndex = btnIndex;
            this.setFilterActiveButton();
            $(this.dashboardDatePicker).val('');
            return true;
        }
        return result;
    }
    setFilterActiveButton() {

        this.#resetFilterActiveButton();
        this.triggerBtn.classList.remove("active");

        this.filter.children[this.filterIndex].classList.add("active");
    }

    #resetFilterActiveButton() {
        for (let i = 0; i < this.filterLabels.length; i++) {
            this.filter.children[i].classList.remove("active");
        }
    }

    #rangeButton(e) {

        this.#resetFilterActiveButton();
        this.filterIndex = -1;

        let drp = $(this.dashboardDatePicker).data('daterangepicker');

        if (this._isDatePickerShowing) {
            drp.hide(e);
            this._isDatePickerShowing = false;
            e.target.classList.toggle("active");

        } else {
            drp.show(e);
            this._isDatePickerShowing = true;
            e.target.classList.toggle("active");
        }
    }

    #setupCharts(response) {

        if (response !== null && Array.isArray(response) && response.length > 0) {

            this.data = response;
            this.dashboardRequestHandler(authRoutes.getIncomeCategories, this.#setupIncomeChart.bind(this));
            this.dashboardRequestHandler(authRoutes.getExpenseCategories, this.#setupExpenseChart.bind(this));
        }
    }

    #setupIncomeChart(response) {

        if (response !== null && Array.isArray(response) && response.length > 0) {

            let incomeChartData = {
                labels: [],
                datasets: [
                    {
                        data: [],
                        backgroundColor : [],
                    }
                ]
            }
            for (let i = 0; i < response.length; i++) {

                incomeChartData.labels.push(response[i].title);
                incomeChartData.datasets[0].backgroundColor.push(response[i].color);
                incomeChartData.datasets[0].data.push(0);
            }

            for (let i = 0; i < this.data.length; i++) {

                if(this.data[i].type === 'income') {

                    let index = this.#getIndexOfCategory(incomeChartData.labels, this.data[i].category);
                    if (index !== -1) {
                        incomeChartData.datasets[0].data[index] += this.data[i].amount;
                    }
                }
            }

            this._chartIncome.data = incomeChartData;
            this._chartIncome.options.title.text = "График Доходов";
            this._chartIncome.update();
        }
    }

    #setupExpenseChart(response) {

        if (response !== null && Array.isArray(response) && response.length > 0) {

            let expenseChartData = {
                labels: [],
                datasets: [
                    {
                        data: [],
                        backgroundColor : [],
                    }
                ]
            }

            for (let i = 0; i < response.length; i++) {

                expenseChartData.labels.push(response[i].title);
                expenseChartData.datasets[0].backgroundColor.push(response[i].color);
                expenseChartData.datasets[0].data.push(0);
            }

            for (let i = 0; i < this.data.length; i++) {

                if(this.data[i].type === 'expense') {

                    let index = this.#getIndexOfCategory(expenseChartData.labels, this.data[i].category);
                    if (index !== -1) {
                        expenseChartData.datasets[0].data[index] += this.data[i].amount;
                    }
                }
            }

            this._chartExpense.data = expenseChartData;
            this._chartExpense.options.title.text = "График Расходов";
            this._chartExpense.update();
        }
    }

    #getIndexOfCategory(categories, categoryName) {

        for (let i = 0; i < categories.length; i++) {
            if (categories[i] === categoryName) {
                return i;
            }
        }
        return -1;
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