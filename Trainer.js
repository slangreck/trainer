class Trainer {
    #prev;
    #next;
    #main;

    #excercises = [];
    #currentExcercise = 0;
    #running = false;

    constructor() {
        this.#prev = document.querySelector("#prev-excercise");
        this.#next = document.querySelector("#next-excercise");
        this.#main = document.querySelector("main");

        window.addEventListener("resize", () => this.gotoExcercise(this.#currentExcercise, false, false));

        this.#prev.addEventListener("click", () => this.gotoExcercise(this.#currentExcercise - 1));
        this.#next.addEventListener("click", () => this.gotoExcercise(this.#currentExcercise + 1));

        this.#main.addEventListener("click", () => {
            if (this.#running) {
                this.#excercises[this.#currentExcercise].advance();
            } else {
                this.start();
            }
        });

        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.gotoExcercise(this.#currentExcercise - 1);
                    break;
                case "ArrowRight":
                    this.gotoExcercise(this.#currentExcercise + 1);
                    break;
                case " ":
                    if (this.#running) {
                        this.#excercises[this.#currentExcercise].advance();
                    } else {
                        this.start();
                    }

                    event.preventDefault();
                    break;
            }
        });

        
        let scrollTimeoutId = 0;
        document.addEventListener("scroll", () => {
            const scrolling = scrollTimeoutId !== 0;
            /*window.clearTimeout(scrollTimeoutId);
            scrollTimeoutId = window.setTimeout(() => scrollTimeoutId = 0, 100);

            if (scrolling) {
                return;
            }

            if (window.scrollX < window.innerWidth * this.#currentExcercise) {
                this.gotoExcercise(this.#currentExcercise - 1);
            } else if (window.scrollX > window.innerWidth * this.#currentExcercise) {
                this.gotoExcercise(this.#currentExcercise + 1);
            }*/
        });
        
    }

    loadWorkout(workout) {
        const fragment = document.createDocumentFragment();

        for (const excerciseInfo of workout.excercises) {
            const excercise = new Excercise(excerciseInfo);
            this.#excercises.push(excercise);
            fragment.appendChild(excercise.element);
        }

        for (const child of this.#main.children) {
            child.remove();
        }

        this.#main.appendChild(fragment);

        this.gotoExcercise(0);
    }

    gotoExcercise(index, endExcercise = true, animate = true) {
        if (this.#running && endExcercise) {
            this.#running = false;
            this.#excercises[this.#currentExcercise].end();
        }

        this.#currentExcercise = Math.max(Math.min(index, this.#excercises.length - 1), 0);
        window.scrollTo({ left: window.innerWidth * this.#currentExcercise, top: 0, behavior: animate ? "smooth" : "instant" });

        this.#prev.textContent = this.#currentExcercise > 0 ? this.#excercises[this.#currentExcercise - 1].name : "";
        this.#next.textContent = this.#currentExcercise < this.#excercises.length - 1 ? this.#excercises[this.#currentExcercise + 1].name : "";
    }

    async start() {
        this.#running = true;
        for (let i = this.#currentExcercise; i < this.#excercises.length; i++) {
            if (!this.#running) {
                return;
            }

            const promise = this.#excercises[i].start();
            this.gotoExcercise(i, false);
            await promise;
        }

        this.#running = false;
        this.gotoExcercise(0);
    }
}