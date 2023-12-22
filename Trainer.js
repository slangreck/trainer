class Trainer {
    #prev;
    #next;
    #selection;
    #workout;
    #finished;
    #totalTime;

    #excercises = [];
    #currentExcercise = null;
    #currentPage = 0;
    #running = false;
    #startTime = 0;

    constructor(workouts) {
        this.#prev = document.querySelector("#prev-excercise");
        this.#next = document.querySelector("#next-excercise");
        this.#selection = document.querySelector("#selection > nav");
        this.#workout = document.querySelector("#workout");
        this.#finished = document.querySelector("#finished");
        this.#totalTime = document.querySelector("#total-time");

        window.addEventListener("resize", () => this.gotoPage(this.#currentPage, false, false));

        this.#prev.addEventListener("click", () => this.gotoPage(this.#currentPage - 1));
        this.#next.addEventListener("click", () => this.gotoPage(this.#currentPage + 1));

        this.#workout.addEventListener("click", () => {
            if (this.#running) {
                this.#currentExcercise?.advance();
            } else {
                this.start();
            }
        });

        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.gotoPage(this.#currentPage - 1);

                    event.preventDefault();
                    break;
                case "ArrowRight":
                    this.gotoPage(this.#currentPage + 1);

                    event.preventDefault();
                    break;
                case " ":
                    if (this.#running) {
                        this.#currentExcercise?.advance();
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
        
        this.showWorkoutChoices(workouts);
    }

    showWorkoutChoices(workouts) {
        for (const workout of workouts) {
            const option = this.#selection.appendChild(document.createElement("a"));
            option.textContent = workout.name;
            option.addEventListener("click", () => this.loadWorkout(workout));
        }
    }

    loadWorkout(workout) {
        const fragment = document.createDocumentFragment();
        this.#excercises = [];
        this.#startTime = 0;

        for (const excerciseInfo of workout.excercises) {
            const excercise = new Excercise(excerciseInfo);
            this.#excercises.push(excercise);
            fragment.appendChild(excercise.element);
        }

        while (this.#workout.firstElementChild) {
            this.#workout.firstElementChild.remove();
        }

        this.#workout.appendChild(fragment);

        this.gotoPage(1);

        Beeper.initialize();
    }

    gotoPage(index, skipExcercise = true, animate = true) {
        let restart = false;
        if (this.#running && skipExcercise && this.#excercises[index - 1] !== this.#currentExcercise) {
            this.#running = false;
            this.#currentExcercise?.end();
            this.#currentExcercise = null;

            if (index === this.#currentPage + 1 && index <= this.#excercises.length) {
                restart = true;
            }
        }

        this.#currentPage = Math.max(Math.min(index, this.#excercises.length + 1), 0);
        ScrollManager.scrollTo({ left: window.innerWidth * (this.#currentPage), top: 0, behavior: animate ? "smooth" : "instant" });

        this.#prev.textContent = this.getPageName(this.#currentPage - 1);
        this.#next.textContent = this.getPageName(this.#currentPage + 1);

        if (restart) {
            this.start();
        }
    }

    getPageName(pageIndex) {
        if (pageIndex < 0 || pageIndex > this.#excercises.length + 1) {
            return "";
        }

        if (pageIndex === 0) {
            return "Workout auswählen";
        }

        if (pageIndex === this.#excercises.length + 1) {
            return this.#finished.classList.contains("hidden") ? "" : "Fertig";
        }

        return this.#excercises[pageIndex - 1].name;
    }

    async start() {
        if (!this.#startTime) {
            this.#startTime = Date.now();
        }

        this.#running = true;

        this.#finished.classList.remove("hidden");

        for (let i = this.#currentPage - 1; i < this.#excercises.length; i++) {
            if (!this.#running) {
                this.#currentExcercise = null;
                return;
            }

            this.#currentExcercise = this.#excercises[i];

            const promise = this.#currentExcercise.start(async () => {
                if (i + 1 < this.#excercises.length) {
                    await this.#excercises[i + 1].preview();
                    this.gotoPage(i + 2, false);
                }
            });
            this.gotoPage(i + 1, false);
            await promise;
        }

        if (this.#running) {
            this.#running = false;
            this.#currentExcercise = null;

            const elapsed = Date.now() - this.#startTime;
            this.#totalTime.textContent = Timer.formatDuration(elapsed);

            this.gotoPage(this.#excercises.length + 1);
        }
    }
}