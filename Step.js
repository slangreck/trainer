class Step {
    static #previewTimeout = 0;

    display;
    timer = null;

    resolvePromise = null;

    constructor() {}

    get element() {
        return this.display.element;
    }

    get hasTimer() {
        return this.timer !== null;
    }

    get isActive() {
        return this.display.isActive;
    }

    preview() {
        if (Step.#previewTimeout) {
            clearTimeout(Step.#previewTimeout);
        }

        return new Promise((resolve) => {
            Step.#previewTimeout = setTimeout(async () => {
                Step.#previewTimeout = 0;
                await this.display.scrollIntoView();
                resolve();
            }, 2000);
        });
    }

    start() {
        this.display.isActive = true;
    }

    advance() {}

    end() {
        this.timer?.reset();
        this.display.isActive = false;
        this.resolvePromise?.();
        this.resolvePromise = null;
    }
}