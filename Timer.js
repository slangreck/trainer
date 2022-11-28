class Timer {
    #element;

    #time = 0;
    #startTime = 0;

    #resolvePromise = null;

    constructor() {
        this.#element = document.createElement("div");
        this.#element.classList.add("timer");
        this.#displayTime(0);
    }

    get element() {
        return this.#element;
    }

    setTime(seconds) {
        this.#time = seconds * 1000;
        this.#startTime = 0;

        this.#element.style.setProperty("--time", this.#time + "ms");

        this.#displayTime(this.#time);
    }

    start() {
        if (this.#startTime !== 0) {
            return Promise.reject(new Error("Timer is already running"));
        }

        this.#startTime = Date.now();
        this.#element.classList.add('countdown');

        return new Promise((resolve) => {
            this.#resolvePromise = resolve;

            const update = () => {
                if (this.#startTime === 0) {
                    resolve();
                    this.#element.classList.remove('countdown');
                    return;
                }

                const elapsed = Date.now() - this.#startTime;

                if (elapsed >= Math.abs(this.#time)) {
                    this.#displayTime(0);
                    this.#startTime = 0
                    resolve();
                    this.#element.classList.remove('countdown');
                    return;
                }

                if (this.#time < 0) {
                    this.#displayTime(this.#time + elapsed);
                }
                else {
                    this.#displayTime(this.#time - elapsed);
                }

                window.requestAnimationFrame(update);
            };

            update();
        });
    }

    reset() {
        this.#startTime = 0;
        this.#displayTime(this.#time);
        this.#element.classList.remove('countdown');
        this.#resolvePromise();
    }

    get isRunning() {
        return this.#startTime !== 0;
    }

    #displayTime(milliSeconds) {
        const seconds = Math.abs(milliSeconds) / 1000;
        const minutePart = Math.floor(seconds / 60);
        const secondPart = seconds % 60;

        this.#element.textContent = `${milliSeconds < 0 ? "-" : ""}${minutePart < 10 ? "0" + minutePart : minutePart}:${secondPart < 10 ? "0" + secondPart.toFixed(2) : secondPart.toFixed(2)}`;
        this.#element.style.setProperty("--progress", (this.#time !== 0 ? milliSeconds / this.#time * 100 : 100) + "%");
    }
}