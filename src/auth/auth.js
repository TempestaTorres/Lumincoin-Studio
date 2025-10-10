
import {HttpRequest} from "../utils/validation.utils.js";
import authRoutes from "./authRoutes.js";
import config from "../config/config.js";

export class Auth {
    static accessTokenKey = 'accessToken';
    static refreshTokenKey = 'refreshToken';
    static userInfo = {
        name: '',
        lastName: '',
        email: '',
        userId: 0,
    }

    static setTokens(accessToken, refreshToken) {

        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
    static getAccessToken() {
        return localStorage.getItem(this.accessTokenKey);
    }
    static getRefreshToken() {
        return localStorage.getItem(this.refreshTokenKey);
    }
    static clearAccessTokens() {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }
    static accountManager(route) {

        const accessToken = this.getAccessToken();

        if (accessToken) {

            if (route.route === config.ROUTE_SIGNUP || route.route === config.ROUTE_LOGIN) {
                return false;
            }

            let madJunInfo = localStorage.getItem("madJunUserInfo");

            if (madJunInfo) {
                let user = JSON.parse(madJunInfo);

                this.userInfo.name = user.name;
                this.userInfo.lastName = user.lastName;
                this.userInfo.email = user.email;
                this.userInfo.userId = user.userId;
            }
        }
        else if (route.route === config.ROUTE_LOGOUT || route.route === config.ROUTE_DASHBOARD) {
                return false;
        }
        return true;
    }

    static async refreshTokens() {

        const refreshToken = localStorage.getItem(this.refreshTokenKey);

        if (refreshToken) {
            const response = await HttpRequest.sendRequest(authRoutes.refresh,"POST", {
                refreshToken: refreshToken,
            });

            Auth.clearAccessTokens();
            Auth.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
        }
    }

    static logoutManager(callback) {

        const token = this.getRefreshToken();

        if (token) {

            const body = {
                refreshToken: token,
            };
            try {
                const r = this.sendLogoutRequest(authRoutes.logout,body);

                if (!r.error) {
                    this.clearAccessTokens();
                    localStorage.removeItem("madJunUserInfo");
                    this.userInfo.name = "";
                    this.userInfo.lastName = "";
                    this.userInfo.email = "";
                    this.userInfo.userId = 0;

                    localStorage.removeItem("lumincoin-studio-theme");

                    history.pushState(null, null, config.ROUTE_LOGIN);
                    callback();
                }
            }
            catch (e) {
                history.pushState(null, null, config.ROUTE_DASHBOARD);
                callback();
            }
        }
    }
    static async sendLogoutRequest(url, body) {

        return await HttpRequest.sendRequest(url,"POST",body);
    }
}