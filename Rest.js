class Rest extends Step {
    #isSwitchSides;

    constructor(duration, label = "Erholung", isSwitchSides = false) {
        super();

        this.#isSwitchSides = isSwitchSides;

        this.display = new StepDisplay(label, { duration: { value: duration, label: "Sekunden" } });
        
        this.timer = new Timer();
        this.timer.setTime(duration);
        this.display.appendStep(this.timer);
    }

    start() {
        super.start();

        return new Promise(async (resolve) => {
            this.resolvePromise = resolve;
            
            await this.timer.start();
            this.end();
        });
    }

    advance() {
        this.end();
    }

    get isSwitchSides() {
        return this.#isSwitchSides;
    }
}