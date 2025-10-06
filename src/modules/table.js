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

        this._tableBody = document.querySelector("tbody");

        Fsm.registerState(config.STATE_INCOME_EXPENSES, this.#commonTableMain.bind(this));
    }

    initialize() {
        this.createFilter();
        this.#buttonsInit();

        super.initialize();
    }

    #commonTableMain() {

        this.sendRequest(this.options.requestUrl).then((response) => {

            if (Array.isArray(response) && response.length > 0) {

                for (let i = 0; i < response.length; i++) {

                    this.#createTableRow(response[i], i + 1);
                }

                this.#tableInit();
            }
            else {
                this.showMessageBoxEx("Данные отсутствуют. Создайте операции.", "bg-warning");
            }
        });
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
        tdCategory.textContent = "Fuck backend";

        let tdAmount = document.createElement("td");
        tdAmount.textContent = operation.amount + "$";

        let tdDate = document.createElement("td");
        tdDate.textContent = operation.date;

        let tdComment = document.createElement("td");
        tdComment.textContent = operation.comment;

        let tdLast = document.createElement("td");

        let div = document.createElement("div");
        div.classList.add("btn-toolbar", "table-tools", "align-items-sm-center");
        div.role = "toolbar";

        let btnDelete = document.createElement("a");
        btnDelete.className = "btn";
        btnDelete.href = config.ROUTE_DELETE_OPERATION + "?id=" + operation.id;

        let iTrash = document.createElement("i");
        iTrash.className = "ti-trash";
        iTrash.dataset.target = config.ROUTE_DELETE_OPERATION + "?id=" + operation.id;

        btnDelete.appendChild(iTrash);

        let btnEdit = document.createElement("a");
        if (operation.type === "income") {
            btnEdit.href = config.ROUTE_EDIT_INCOME + "?id=" + operation.id;
        }
        else {
            btnEdit.href = config.ROUTE_EDIT_EXPENSE + "?id=" + operation.id;
        }

        let iPencil = document.createElement("i");
        iPencil.className = "ti-pencil";

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

        this._tableBody.appendChild(tr);
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
        $('#table-main').DataTable({
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
}