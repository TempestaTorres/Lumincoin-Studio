class Loadscript {

    static  async loadScript(src, child) {
       return await this.#loadScript(src, child);
    }
    #loadScript(src, selector) {

        return new Promise((resolve, reject) => {

            let child = document.querySelector(selector);
            let script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = () => resolve("Loading script");
            script.onerror = () => reject(new Error("Could not load script"));
            document.head.insertBefore(script, child);
        });
    }
}
export default Loadscript;