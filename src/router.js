import config from "./config/config.js";
import paths from "./templates/paths.js";
import {FormValidation} from "./modules/validation.js";
import {Auth} from "./auth/auth.js";
import {Dashboard} from "./modules/dashboard.js";
import {Framework} from "./framework/js/framework.js";
import {Table} from "./modules/table.js";
import {Editor} from "./modules/editor.js";
import {Category} from "./modules/category.js";
import authRoutes from "./auth/authRoutes.js";
import {HttpRequest} from "./utils/validation.utils.js";

export class Router {
    constructor() {
        this._pageTitleId = document.querySelector('#page-title');
        this._pageWrapper = document.querySelector(paths.mainClassWrapper);
        this._currentRoute = config.STATE_NONE;
        this._layoutLoaded = false;
        this._mail = {
            message: "Welcome!",
            send: false
        };

        this._routes = [
            {
                route: config.ROUTE_LOGIN,
                name: 'Lumincoin | Login',
                template: paths.pathLogin,
                id: config.STATE_LOGIN,
                layout: {
                    use: false,
                    path: []
                },
                load: (message) => {
                    console.log('Login loaded');

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins();
                        this._layoutLoaded = true;
                    }
                    new FormValidation("#form", this.#loadRoute.bind(this));
                },
                unload: () => {
                    console.log('Login unloaded');
                }
            },
            {
                route: config.ROUTE_SIGNUP,
                name: 'Lumincoin | Signup',
                template: paths.pathSignup,
                id: config.STATE_SIGNUP,
                layout: {
                    use: false,
                    path: []
                },
                load: (message) => {
                    console.log('Signup loaded');
                    if (!this._layoutLoaded) {
                        Framework.loadPlugins();
                        this._layoutLoaded = true;
                    }

                    new FormValidation("#form", this.#loadRoute.bind(this));
                },
                unload: () => {
                    console.log('Signup unloaded');
                }
            },
            {
                route: config.ROUTE_DASHBOARD,
                name: 'Lumincoin | Dashboard',
                template: paths.pathDashboard,
                id: config.STATE_DASHBOARD,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Dashboard loaded');
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }

                    this.dashboard = new Dashboard(config.DASHBOARD_HOME, {
                        message: message
                    });

                    this.dashboard.initialize();

                },
                unload: () => {
                    console.log('Dashboard unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_LOGOUT,
                name: 'Lumincoin | Logout',
                template: "",
                id: config.STATE_LOGOUT,
                layout: {
                    use: false,
                    path: []
                },
                load: (message = "") => {
                    console.log('Logout loaded');
                    this._mail.send = false;
                    Auth.logoutManager(this.#loadRoute.bind(this));
                }
            },
            {
                route: config.ROUTE_INCOME_EXPENSES,
                name: 'Lumincoin | Income & Expenses',
                template: paths.pathItemCommon,
                id: config.STATE_INCOME_EXPENSES,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Income & Expenses loaded');

                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }

                    this.table1 = new Table(config.DASHBOARD_INCOME_EXPENSES, {
                        state: config.STATE_INCOME_EXPENSES,
                        defaultState: config.STATE_INCOME_EXPENSES,
                        requestUrl: authRoutes.getOperations,
                        message: message
                    });

                    this.table1.initialize();

                },
                unload: () => {
                    console.log('Income & Expenses unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_CREATE_INCOME,
                name: 'Lumincoin | Create & Edit',
                template: paths.pathEditor,
                id: config.STATE_CREATE_INCOME,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Create Income & Expenses loaded');

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    this.editor = new Editor(config.DASHBOARD_CREATE_NEW, {
                        state: config.STATE_CREATE_INCOME,
                        defaultState: config.STATE_CREATE_INCOME,
                        requestUrl: authRoutes.createOperation,
                        message: message
                    });

                    this.editor.initialize();

                },
                unload: () => {
                    console.log('Create Income & Expenses unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_CREATE_EXPENSE,
                name: 'Lumincoin | Create & Edit',
                template: paths.pathEditor,
                id: config.STATE_CREATE_EXPENSE,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Create Income & Expenses loaded');

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    this.editor = new Editor(config.DASHBOARD_CREATE_NEW, {
                        state: config.STATE_CREATE_EXPENSE,
                        defaultState: config.STATE_CREATE_INCOME,
                        requestUrl: authRoutes.createOperation,
                        message: message
                    });

                    this.editor.initialize();

                },
                unload: () => {
                    console.log('Create Income & Expenses unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_EDIT_INCOME,
                name: 'Lumincoin | Create & Edit',
                template: paths.pathEditor,
                id: config.STATE_EDIT_INCOME,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Edit Income & Expenses loaded');

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    this.editor = new Editor(config.DASHBOARD_EDIT_NEW, {
                        state: config.STATE_EDIT_INCOME,
                        defaultState: config.STATE_CREATE_INCOME,
                        requestUrl: authRoutes.createOperation,
                        message: message
                    });

                    this.editor.initialize();

                },
                unload: () => {
                    console.log('Edit Income & Expenses unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_EDIT_EXPENSE,
                name: 'Lumincoin | Create & Edit',
                template: paths.pathEditor,
                id: config.STATE_EDIT_EXPENSE,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Edit Income & Expenses loaded');

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    this.editor = new Editor(config.DASHBOARD_EDIT_NEW, {
                        state: config.STATE_EDIT_EXPENSE,
                        defaultState: config.STATE_CREATE_INCOME,
                        requestUrl: authRoutes.createOperation,
                        message: message
                    });

                    this.editor.initialize();

                },
                unload: () => {
                    console.log('Edit Income & Expenses unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_CREATE_CATEGORY_INCOME,
                name: 'Lumincoin | Create & Edit',
                template: paths.pathEditorCategory,
                id: config.STATE_CREATE_CATEGORY_INCOME,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Create Category loaded');

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    this.editor = new Editor(config.DASHBOARD_CREATE_CATEGORY_NEW, {
                        state: config.STATE_CREATE_CATEGORY_INCOME,
                        defaultState: config.STATE_CREATE_INCOME,
                        requestUrl: authRoutes.createCategoryIncome,
                        message: message
                    });

                    this.editor.initialize();

                },
                unload: () => {
                    console.log('Create Category unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_CREATE_CATEGORY_EXPENSE,
                name: 'Lumincoin | Create & Edit',
                template: paths.pathEditorCategory,
                id: config.STATE_CREATE_CATEGORY_EXPENSE,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Create Category loaded');

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    this.editor = new Editor(config.DASHBOARD_CREATE_CATEGORY_NEW, {
                        state: config.STATE_CREATE_CATEGORY_EXPENSE,
                        defaultState: config.STATE_CREATE_INCOME,
                        requestUrl: authRoutes.createCategoryExpense,
                        message: message
                    });

                    this.editor.initialize();

                },
                unload: () => {
                    console.log('Create Category unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_EDIT_CATEGORY_INCOME,
                name: 'Lumincoin | Edit Category',
                template: paths.pathEditorCategory,
                id: config.STATE_EDIT_CATEGORY_INCOME,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Edit Category loaded');

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    this.editor = new Editor(config.DASHBOARD_EDIT_CATEGORY, {
                        state: config.STATE_EDIT_CATEGORY_INCOME,
                        defaultState: config.STATE_CREATE_INCOME,
                        requestUrl: authRoutes.createCategoryIncome,
                        message: message
                    });

                    this.editor.initialize();

                },
                unload: () => {
                    console.log('Edit Category unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_EDIT_CATEGORY_EXPENSE,
                name: 'Lumincoin | Edit Category',
                template: paths.pathEditorCategory,
                id: config.STATE_EDIT_CATEGORY_EXPENSE,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Edit Category loaded');

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    this.editor = new Editor(config.DASHBOARD_EDIT_CATEGORY, {
                        state: config.STATE_EDIT_CATEGORY_EXPENSE,
                        defaultState: config.STATE_CREATE_INCOME,
                        requestUrl: authRoutes.createCategoryExpense,
                        message: message
                    });

                    this.editor.initialize();

                },
                unload: () => {
                    console.log('Edit Category unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_CATEGORY_INCOME,
                name: 'Lumincoin | Income',
                template: paths.pathCategory,
                id: config.STATE_CATEGORY_INCOME,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Category Income loaded');
                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    this.category = new Category(config.DASHBOARD_CATEGORY_INCOME, {
                        state: config.STATE_CATEGORY_INCOME,
                        defaultState: config.STATE_CATEGORY_INCOME,
                        requestUrl: authRoutes.getIncomeCategories,
                        message: message
                    });

                    this.category.initialize();

                },
                unload: () => {
                    console.log('Category Income unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
            {
                route: config.ROUTE_CATEGORY_EXPENSE,
                name: 'Lumincoin | Expense',
                template: paths.pathCategory,
                id: config.STATE_CATEGORY_EXPENSE,
                layout: {
                    use: true,
                    path: [
                        {
                            pathName: paths.pathMainLayout,
                            wrapper: null
                        },
                    ]
                },
                load: (message) => {
                    console.log('Category Expense loaded');
                    document.body.classList.add("sidebar-mini", "layout-fixed");

                    if (!this._layoutLoaded) {
                        Framework.loadPlugins(true, true);
                        this._layoutLoaded = true;
                    }
                    this.category = new Category(config.DASHBOARD_CATEGORY_EXPENSE, {
                        state: config.STATE_CATEGORY_EXPENSE,
                        defaultState: config.STATE_CATEGORY_INCOME,
                        requestUrl: authRoutes.getExpenseCategories,
                        message: message
                    });

                    this.category.initialize();

                },
                unload: () => {
                    console.log('Category Expense unloaded');
                    document.body.classList.remove("sidebar-mini", "layout-fixed");
                }
            },
        ];
    }

    mount() {

        window.addEventListener('DOMContentLoaded', this.#loadRoute.bind(this));
        window.addEventListener('popstate', this.#loadRoute.bind(this));
        window.addEventListener('click', this.#preventReload.bind(this));
    }

    #loadRoute(message = "") {

        let path = window.location.pathname;
        let route = this._routes.find(route => {
            return route.route === path;
        });

         if (route) {

            if (Auth.accountManager(route)) {
                this.#routeManager(route, message).then();
            }
            else if (route.route === config.ROUTE_DASHBOARD) {
                history.pushState(null, null, config.ROUTE_LOGIN);
                this.#loadRoute();
            }
            else if (route.route === config.ROUTE_LOGIN || route.route === config.ROUTE_SIGNUP) {
                history.pushState(null, null, config.ROUTE_DASHBOARD);
                this.#loadRoute();
            }
        }
        else {
            history.pushState(null, null, config.ROUTE_DASHBOARD);
            this.#loadRoute();
        }

    }

    async #routeManager(route, message = "") {

        this._pageTitleId.textContent = route.name;
        let pageWrapper = this._pageWrapper;

        if (route.layout.use) {

            for (let i = 0; i < route.layout.path.length; i++) {

                if (route.layout.path[i].wrapper !== null) {

                    pageWrapper = document.querySelector(route.layout.path[i].wrapper);
                }
                pageWrapper.innerHTML = await fetch(route.layout.path[i].pathName).then(response => response.text());
            }

            pageWrapper = document.querySelector(paths.mainContentWrapper);
        }


        if (route.route !== config.ROUTE_LOGOUT) {
            pageWrapper.innerHTML = await fetch(route.template).then(response => response.text());
        }

        // Previous route unload
        if (this._currentRoute !== config.STATE_NONE && this._currentRoute !== config.STATE_LOGOUT) {
            this._routes[this._currentRoute].unload();
        }
        this._currentRoute = route.id;

        if (this._currentRoute === config.STATE_DASHBOARD && !this._mail.send) {

            this._mail.send = true;
            route.load(this._mail.message + " " + Auth.userInfo.name + " " + Auth.userInfo.lastName);
        }
        else {
            //New route load
            route.load(message);
        }
    }

    #preventReload(e) {

        let targetLink = null;
        let path = null;

        if (e.target.nodeName === 'A') {
            targetLink = e.target;
        }
        else if (e.target.nodeName === 'I') {
            targetLink = e.target.dataset.target;
            path = e.target.dataset.target;
        }
        else if (e.target.parentElement.nodeName === 'A') {
            targetLink = e.target.parentElement;
        }
        if (targetLink !== null) {

            if (path === null) {
                path = targetLink.href.split(window.location.origin)[1];
            }

            if (path !== undefined && !path.includes('#')) {

                e.preventDefault();

                this.#deleteInfoManager(path).then((responseData) => {

                    if (responseData.response !== null && !responseData.response.error) {

                        history.pushState(null, null, responseData.newRoute);
                        this.#loadRoute("Операция удалена.");
                    }
                    else {
                        let currPath = this.#getCurrentRoute();
                        if (path !== currPath) {
                            history.pushState(null, null, path);
                            this.#loadRoute();
                        }
                    }
                });

            }
        }
    }

    #getCurrentRoute() {
        return this._routes[this._currentRoute].route;
    }

    async #deleteInfoManager(path) {

        let response = null;
        let deleteId = null;
        let bDeleteOperation = path.includes(config.ROUTE_DELETE_OPERATION);
        let deleteUrl = null;
        let responseData = {
            response: null,
            newRoute: null,
        }

        if (bDeleteOperation) {

            deleteId = path.split('=')[1];
            deleteUrl = authRoutes.deleteOperation + "/" + deleteId;
            responseData.newRoute = config.ROUTE_INCOME_EXPENSES;

            let accessToken = Auth.getAccessToken();
            let refreshToken = Auth.getRefreshToken();

            try {
                responseData.response = await HttpRequest.sendRequest(deleteUrl,"DELETE",null, {
                    name: authRoutes.headerName,
                    value: accessToken,
                });
            }
            catch (e) {

                if (e.message === "jwt expired") {

                    try {
                        response = await HttpRequest.sendRequest(authRoutes.refresh,"POST", {
                            refreshToken: refreshToken,
                        });

                        Auth.clearAccessTokens();
                        Auth.setTokens(responseData.response.accessToken, responseData.response.refreshToken);

                        responseData.response = await HttpRequest.sendRequest(deleteUrl,"DELETE",null, {
                            name: authRoutes.headerName,
                            value: responseData.response.accessToken,
                        });
                    }
                    catch (e) {
                        console.error(e.message);
                    }
                }
            }
        }
        return responseData;
    }
}