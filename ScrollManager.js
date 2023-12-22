class ScrollManager {
    static #animationFrameId = 0;

    static scrollTo(...args) {
        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId);
        }

        return new Promise((resolve) => {
            this.#animationFrameId = requestAnimationFrame(() => {
                this.#animationFrameId = 0;

                window.scrollTo(...args);

                resolve();
            });
        });
    }

    static scrollIntoView(element, ...args) {
        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId);
        }

        return new Promise((resolve) => {
            this.#animationFrameId = requestAnimationFrame(() => {
                this.#animationFrameId = 0;

                element.scrollIntoView(...args);

                resolve();
            });
        });
    }
}