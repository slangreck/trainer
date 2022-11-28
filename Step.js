class Step {
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