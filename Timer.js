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

        const clientBounds = this.#element.getBoundingClientRect();
        const bounds = {
            left: clientBounds.left + window.scrollX,
            right: clientBounds.right + window.scrollX,
            top: clientBounds.top + window.scrollY,
            bottom: clientBounds.bottom + window.scrollY,
        }
        const htmlElement = document.querySelector('html');

        const handleScroll = () => {
            this.#element.classList.toggle(
                'hero',
                window.scrollX > bounds.left ||
                window.scrollY > bounds.top ||
                window.scrollX + htmlElement.clientWidth < bounds.right ||
                window.scrollY + htmlElement.clientHeight < bounds.bottom
            );
        };

        document.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        let preFinishBeeps = this.#time >= 5000 ? 3 : 0;

        return new Promise((resolve) => {
            this.#resolvePromise = resolve;

            const update = () => {
                if (this.#startTime === 0) {
                    document.removeEventListener('scroll', handleScroll);
                    window.removeEventListener('resize', handleScroll);
                    resolve();
                    this.#element.classList.remove('countdown');
                    return;
                }

                const elapsed = Date.now() - this.#startTime;

                if (elapsed >= Math.abs(this.#time)) {
                    this.#displayTime(0);
                    Beeper.beep(300, 660, 100);
                    this.#element.classList.remove('countdown');

                    this.#startTime = 0
                    document.removeEventListener('scroll', handleScroll);
                    window.removeEventListener('resize', handleScroll);

                    resolve();
                    return;
                }

                const remaining = this.#time < 0 ? this.#time + elapsed : this.#time - elapsed;
                this.#displayTime(remaining);

                const secondsTillFinish = Math.abs(remaining) / 1000;
                if (secondsTillFinish < preFinishBeeps) {
                    Beeper.beep(200, 440, 100);
                    preFinishBeeps = Math.floor(secondsTillFinish);
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
        this.#element.textContent = Timer.formatDuration(milliSeconds);
        this.#element.style.setProperty("--progress", (this.#time !== 0 ? milliSeconds / this.#time * 100 : 100) + "%");
    }

    static formatDuration(milliSeconds) {        
        const seconds = Math.abs(milliSeconds) / 1000;
        const minutePart = Math.floor(seconds / 60);
        const secondPart = seconds % 60;

        return `${milliSeconds < 0 ? "-" : ""}${minutePart < 10 ? "0" + minutePart : minutePart}:${secondPart < 10 ? "0" + secondPart.toFixed(2) : secondPart.toFixed(2)}`;
    }
}