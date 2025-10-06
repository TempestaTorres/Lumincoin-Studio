//Change body parameter to place it at the end
export class HttpRequest {
    static async sendRequest(url, method = "GET",body = null, header = null) {

        const defHeaders = new Headers();
        defHeaders.append("Content-Type", "application/json; charset=UTF-8");
        defHeaders.append("Accept", "application/json");

        if (header) {
            defHeaders.append(header.name, header.value);
        }

        const params = {
            method: method,
            headers: defHeaders,
        }

        if (body) {
            params.body = JSON.stringify(body);
        }

        const request = new Request(url, params);

        const response = await fetch(request);

        const json = await response.json();

        if (response.status < 200 || (response.status >= 300 && response.status < 400)) {

            throw new TypeError(`Error, Response status: ${response.status}`);
        }
        if (response.status >= 400 && response.status < 500) {

            throw new TypeError(json.message);
        }
        const contentType = response.headers.get("Content-Type");

        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Oops, we haven't got JSON!");
        }
        return json; //await response.json();
    }
}