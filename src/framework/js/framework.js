import Layout from "./layout.js";
import PushMenu from "./pushmenu.js";
import Fullscreen from "./fullscreen.js";
import TreeView from "./treeview.js";
import CardWidget from "./cardwidget.js";

export class Framework {

    static layoutLoaded = null;
    static treeviewLoaded = null;
    static pushMenuLoaded = null;
    static fullscreenLoaded = null;
    static cardsLoaded = null;

    static loadPlugins(full = false, hasCards = false) {

        this.loadLayoutPlugin();

        if (full) {

            if (!this.pushMenuLoaded) {
                this.pushMenuLoaded = new PushMenu();
            }
            this.pushMenuLoaded.load();

            if (!this.fullscreenLoaded) {
                this.fullscreenLoaded = new Fullscreen();
            }
            this.fullscreenLoaded.load();

            if (!this.treeviewLoaded) {
                this.treeviewLoaded = new TreeView($(document));
            }
            this.treeviewLoaded.load(".has-treeview");

            if (hasCards && !this.cardsLoaded) {
                this.cardsLoaded = new CardWidget();
            }
            this.cardsLoaded.load();
        }
    }
    static loadLayoutPlugin() {

        if (!this.layoutLoaded) {
            this.layoutLoaded = new Layout();
        }

        this.layoutLoaded.load();
    }
}