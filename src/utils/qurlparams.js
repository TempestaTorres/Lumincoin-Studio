export class Url {
    static getLocationParam(paramName) {
        let params = new URLSearchParams(document.location.search);

        return params.get(paramName);
    }

}