class Excercise extends Step {
    #name;
    #repetitions;
    #perSide;

    #steps = [];

    constructor(excerciseInfo) {
        super();

        this.#name = excerciseInfo.name;
        this.#repetitions = excerciseInfo.repetitions ?? 1;
        this.#perSide = excerciseInfo.perSide ?? false;

        const infos = { repetitions: { value: this.#repetitions, label: `Repetitions${excerciseInfo.perSide ? " per Side" : ""}` } };

        if (excerciseInfo.duration) {
            infos.duration = { value: excerciseInfo.duration, label: "Seconds Load"};
        }

        if (excerciseInfo.rest) {
            infos.rest = { value: excerciseInfo.rest, label: "Seconds Rest"};
        }
        
        this.display = new StepDisplay(excerciseInfo.name, infos);

        if (excerciseInfo.steps) {
            for (const step of excerciseInfo.steps) {
                const excercise = new Excercise(step);
                this.#steps.push(excercise);
                this.display.appendStep(excercise);
            }
        }
        
        if (excerciseInfo.duration) {
            this.timer = new Timer();
            this.timer.setTime(excerciseInfo.duration);
            this.display.appendStep(this.timer);
        }

        if (excerciseInfo.rest) {
            const rest = new Rest(excerciseInfo.rest);
            this.#steps.push(rest);
            this.display.appendStep(rest);
        }

        if (this.#perSide && (this.#steps.length > 0 || this.timer) && !excerciseInfo.rest) {
            const switchSides = new Rest(3, "Switch Sides");
            this.#steps.push(switchSides);
            this.display.appendStep(switchSides);
        }
    }

    get name() {
        return this.#name;
    }

    get hasTimer() {
        return super.hasTimer || this.#steps.some((step) => step.hasTimer);
    }

    start() {
        super.start();

        return new Promise(async (resolve) => {
            this.resolvePromise = resolve;

            if (this.#steps.length > 0 || this.hasTimer) {
                for (let i = 1; i <= this.#repetitions + 0.5; i += this.#perSide ? 0.5 : 1) {
                    this.display.updateInfo("repetitions", `${Math.floor(i)} / ${this.#repetitions}`);

                    let timerInSteps = false;
                    let rest = null;

                    if (this.#steps) {
                        let activeStepPromises = [];
                        for (const step of this.#steps) {
                            if (step instanceof Rest && this.timer) {
                                rest = step;
                                continue;
                            }

                            if (step.hasTimer) {
                                if (activeStepPromises.length > 0) {
                                    await Promise.allSettled(activeStepPromises);
                                    activeStepPromises = [];

                                    if (!this.isActive) {
                                        return;
                                    }
                                }
                                timerInSteps = true;
                                await step.start();
                                    
                                if (!this.isActive) {
                                    return;
                                }
                            } else {
                                activeStepPromises.push(step.start());
                            }
                        }

                        if (!this.timer) {
                            await Promise.allSettled(activeStepPromises);
                            activeStepPromises = [];
                                    
                            if (!this.isActive) {
                                return;
                            }
                        }
                    }

                    if (this.timer && !timerInSteps) {
                        await this.timer.start();
                                    
                        if (!this.isActive) {
                            return;
                        }
                    }

                    if (rest) {
                        await rest.start();
                                    
                        if (!this.isActive) {
                            return;
                        }
                    }
                }
            }

            if (this.#steps.length > 0 || this.timer) {
                this.end();
            }
        });
    }

    advance() {
        for (const activeStep of this.#steps.filter((step) => step.isActive)) {
            activeStep.advance();
        }

        if (this.timer?.isRunning) {
            this.timer.reset();
        }

        // wait for promises to settle
        window.requestAnimationFrame(() => {
            if (!this.#steps.some((step) => step.isActive) && !this.timer?.isRunning) {
                this.end();
            }
        });
    }

    end() {
        for (const activeStep of this.#steps.filter((step) => step.isActive)) {
            activeStep.end();
        }
        super.end();

        this.display.updateInfo("repetitions", this.#repetitions);
    }
}