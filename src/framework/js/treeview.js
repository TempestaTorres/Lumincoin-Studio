import $ from './jquery.js';

const NAME = 'TreeView';
const DATA_KEY = 'lte.treeview';
const EVENT_KEY = `.${DATA_KEY}`;
const JQUERY_NO_CONFLICT = $.fn[NAME];

const EVENT_EXPANDED = `expanded${EVENT_KEY}`;
const EVENT_COLLAPSED = `collapsed${EVENT_KEY}`;
const EVENT_LOAD_DATA_API = `load${EVENT_KEY}`;

const SELECTOR_LI = '.nav-item';
const SELECTOR_LINK = '.nav-link';
const SELECTOR_TREEVIEW_MENU = '.nav-treeview';
const SELECTOR_OPEN = '.menu-open';
const SELECTOR_DATA_WIDGET = '[data-widget="treeview"]';

const CLASS_NAME_OPEN = 'menu-open';
const CLASS_NAME_IS_OPENING = 'menu-is-opening';
const CLASS_NAME_SIDEBAR_COLLAPSED = 'sidebar-collapse';
const CLASS_NAME_ITEM_ACTIVE = 'active';

const Default = {
    trigger: `${SELECTOR_DATA_WIDGET} ${SELECTOR_LINK}`,
    animationSpeed: 300,
    accordion: false,
    expandSidebar: false,
    sidebarButtonSelector: '[data-widget="pushmenu"]'
}

class TreeView {
    constructor(element = null, config = null) {
        this._config = $.extend({}, Default, config);
        this._element = element;
    }

    // Public
    init() {

        $(`${SELECTOR_LI}${SELECTOR_OPEN} ${SELECTOR_TREEVIEW_MENU}${SELECTOR_OPEN}`).css('display', 'block');
        this._setupListeners();
    }

    setupMenuListeners(parentLiSelector) {

        let parent = document.querySelector(parentLiSelector);
        if (parent) {

            let treeView = parent.querySelector(SELECTOR_TREEVIEW_MENU);

            for (let i = treeView.children.length - 1; i >= 0; i--) {

                treeView.children[i].firstElementChild.addEventListener("click", this._menuItemClick);
            }
        }

    }

    open(parentLiSelector) {
        let $parent = $(parentLiSelector);
        if ($parent) {
            let treeviewMenu = $parent.find(`> ${SELECTOR_TREEVIEW_MENU}`);
            this.expand($(treeviewMenu), $parent);
        }
    }
    expand(treeviewMenu, parentLi) {
        const expandedEvent = $.Event(EVENT_EXPANDED);

        if (this._config.accordion) {
            const openMenuLi = parentLi.siblings(SELECTOR_OPEN).first();
            const openTreeview = openMenuLi.find(SELECTOR_TREEVIEW_MENU).first();
            this.collapse(openTreeview, openMenuLi);
        }

        parentLi.addClass(CLASS_NAME_IS_OPENING);
        treeviewMenu.stop().slideDown(this._config.animationSpeed, () => {
            parentLi.addClass(CLASS_NAME_OPEN);
            $(this._element).trigger(expandedEvent);
        })

        if (this._config.expandSidebar) {
            this._expandSidebar();
        }
    }

    collapse(treeviewMenu, parentLi) {
        const collapsedEvent = $.Event(EVENT_COLLAPSED);

        parentLi.removeClass(`${CLASS_NAME_IS_OPENING} ${CLASS_NAME_OPEN}`);
        treeviewMenu.stop().slideUp(this._config.animationSpeed, () => {
            $(this._element).trigger(collapsedEvent);
            treeviewMenu.find(`${SELECTOR_OPEN} > ${SELECTOR_TREEVIEW_MENU}`).slideUp();
            treeviewMenu.find(SELECTOR_OPEN).removeClass(`${CLASS_NAME_IS_OPENING} ${CLASS_NAME_OPEN}`);
            this.clear(treeviewMenu);
        })
    }

    clear(treeviewMenu) {

        treeviewMenu.children().each(function () {

            $(this).children(SELECTOR_LINK).removeClass(CLASS_NAME_ITEM_ACTIVE);
        });
    }

    toggle(event) {
        const $relativeTarget = $(event.currentTarget);
        const $parent = $relativeTarget.parent();

        let treeviewMenu = $parent.find(`> ${SELECTOR_TREEVIEW_MENU}`);

        if (!treeviewMenu.is(SELECTOR_TREEVIEW_MENU)) {
            if (!$parent.is(SELECTOR_LI)) {
                treeviewMenu = $parent.parent().find(`> ${SELECTOR_TREEVIEW_MENU}`);
            }

            if (!treeviewMenu.is(SELECTOR_TREEVIEW_MENU)) {
                return
            }
        }

        event.preventDefault()

        const parentLi = $relativeTarget.parents(SELECTOR_LI).first();
        const isOpen = parentLi.hasClass(CLASS_NAME_OPEN);

        if (isOpen) {
            this.collapse($(treeviewMenu), parentLi);
        } else {
            this.expand($(treeviewMenu), parentLi);
        }
    }

    // Private

    _setupListeners() {
        const elementId = this._element.attr('id') !== undefined ? `#${this._element.attr('id')}` : ''
        $(document).on('click', `${elementId}${this._config.trigger}`, event => {
            this.toggle(event);
        })
    }

    _expandSidebar() {
        if ($('body').hasClass(CLASS_NAME_SIDEBAR_COLLAPSED)) {
            $(this._config.sidebarButtonSelector).PushMenu('expand');
        }
    }
    _menuItemClick(event) {

        let treeViewMenu = event.currentTarget.parentElement.parentElement;

        for (let i = treeViewMenu.children.length - 1; i >= 0; i--) {
            treeViewMenu.children[i].firstElementChild.classList.remove(CLASS_NAME_ITEM_ACTIVE);
        }
        event.currentTarget.classList.add(CLASS_NAME_ITEM_ACTIVE);
    }

    // Static
    load(treeView = null) {
        $(SELECTOR_DATA_WIDGET).each(function () {
            TreeView._jQueryInterface.call($(this), 'init');
        });
        if (treeView !== null) {
            this.setupMenuListeners(treeView);
        }
    }
    static _jQueryInterface(config) {
        return this.each(function () {
            let data = $(this).data(DATA_KEY);

            const _options = $.extend({}, Default, $(this).data());

            if (!data) {
                data = new TreeView($(this), _options);
                $(this).data(DATA_KEY, data);
            }

            if (config === 'init') {
                data[config]();
            }
        });
    }
}
/**
 * jQuery API
 * ====================================================
 */

$.fn[NAME] = TreeView._jQueryInterface;
$.fn[NAME].Constructor = TreeView;
$.fn[NAME].noConflict = function () {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return TreeView._jQueryInterface
}
export default TreeView;