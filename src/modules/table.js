import {Dashboard} from "./dashboard.js";
import config from "../config/config.js";
import {Fsm} from "./fsm.js";
import paths from "../templates/paths.js";

const BUTTONS_WRAPPER_SELECTOR = paths.buttonsWrapper;
const BUTTON1_NAME = "Создать доход";
const BUTTON2_NAME = "Создать расход";

export class Table extends Dashboard {
    constructor(dashboardName = config.DASHBOARD_INCOME_EXPENSES, options = {
        state: config.STATE_INCOME_EXPENSES,
        defaultState: config.STATE_INCOME_EXPENSES,
        requestUrl: null,
        message: '',
    }) {
        super(dashboardName, options);

        this._dataTable = null;

        Fsm.registerState(config.STATE_INCOME_EXPENSES, this.#commonTableMain.bind(this));
    }

    initialize() {
        this.createFilter(this.#tableFilterHandler.bind(this));
        this.initializePicker();
        this.#buttonsInit();

        this.#tableInit();
        super.initialize();
    }

    #commonTableMain(url = this.options.requestUrl) {

        this.sendRequest(url).then((response) => {

            if (Array.isArray(response) && response.length > 0) {

                for (let i = 0; i < response.length; i++) {

                    this.#createTableRow(response[i], i + 1);
                }

            }
            else {
                this.showMessageBoxEx("Данные отсутствуют. Создайте операции.", "bg-warning");
            }
        });
    }

    pickerHandler(e, picker) {

        this.pickerUpdate(picker);

        this._dataTable.clear().draw();

        let url = this.options.requestUrl + this.filterOptions[5] + picker.startDate.format('YYYY-MM-DD') + "&dateTo=" + picker.endDate.format('YYYY-MM-DD');

        this.#commonTableMain(url);

    }

    #createTableRow(operation, index) {

        let tr = document.createElement("tr");

        let tdIndex = document.createElement("td");
        tdIndex.textContent = index;

        let tdType = document.createElement("td");
        if (operation.type === "income") {
            tdType.className = "text-green";
            tdType.textContent = "Доходы";
        }
        else {
            tdType.className = "text-red";
            tdType.textContent = "Расходы";
        }

        let tdCategory = document.createElement("td");
        tdCategory.textContent = operation.category;

        let tdAmount = document.createElement("td");
        tdAmount.textContent = operation.amount + "$";

        let tdDate = document.createElement("td");
        tdDate.textContent = operation.date;

        let tdComment = document.createElement("td");
        tdComment.textContent = operation.comment;

        let tdLast = document.createElement("td");

        let div = document.createElement("div");
        div.classList.add("d-flex");
        div.role = "toolbar";

        let btnDelete = document.createElement("a");
        btnDelete.classList.add("action_btn", "mr-2");
        btnDelete.href = config.ROUTE_DELETE_OPERATION + "?id=" + operation.id;

        let iTrash = document.createElement("i");
        iTrash.classList.add("fas", "fa-trash");
        iTrash.dataset.target = config.ROUTE_DELETE_OPERATION + "?id=" + operation.id;

        btnDelete.appendChild(iTrash);

        let btnEdit = document.createElement("a");
        if (operation.type === "income") {
            btnEdit.href = config.ROUTE_EDIT_INCOME + "?id=" + operation.id;
        }
        else {
            btnEdit.href = config.ROUTE_EDIT_EXPENSE + "?id=" + operation.id;
        }
        btnEdit.className = "action_btn";

        let iPencil = document.createElement("i");
        iPencil.classList.add("far", "fa-edit");

        btnEdit.appendChild(iPencil);

        div.appendChild(btnDelete);
        div.appendChild(btnEdit);
        tdLast.appendChild(div);

        tr.appendChild(tdIndex);
        tr.appendChild(tdType);
        tr.appendChild(tdCategory);
        tr.appendChild(tdAmount);
        tr.appendChild(tdDate);
        tr.appendChild(tdComment);
        tr.appendChild(tdLast);

        this._dataTable.row.add(tr).draw();
    }

    #buttonsInit() {

        let buttonsWrapper = document.querySelector(BUTTONS_WRAPPER_SELECTOR);
        buttonsWrapper.classList.add("btn-toolbar", "gap-20", "pb-40");

        this.#createButton(buttonsWrapper, "btn-success", BUTTON1_NAME, config.ROUTE_CREATE_INCOME);
        this.#createButton(buttonsWrapper, "btn-danger", BUTTON2_NAME, config.ROUTE_CREATE_EXPENSE);
    }

    #createButton(parent, type, name, href) {

        let a = document.createElement("a");
        a.href = href;
        a.role = "button";
        a.classList.add("btn_1", type);
        a.textContent = name;

        parent.appendChild(a);
    }

    #tableInit() {

        this._dataTable = $('#table-main').DataTable({
            bLengthChange: false,
            "bDestroy": false,
            language: {
                search: "<i class='ti-search'></i>",
                searchPlaceholder: 'Поиск',
                paginate: {
                    next: "<i class='ti-arrow-right'></i>",
                    previous: "<i class='ti-arrow-left'></i>"
                }
            },
            columnDefs: [{
                visible: false
            }],
            responsive: true,
            searching: true,
            info: false,
            paging: true,
        });
    }

    #tableFilterHandler(e) {

        if (this.isFilterButtonReady(e.target)) {

            this._dataTable.clear().draw();

            if (this.filterIndex === 0) {

                this.#commonTableMain();
            }
            else {
                this.#commonTableMain(this.options.requestUrl + this.filterOptions[this.filterIndex]);
            }
        }
    }

}