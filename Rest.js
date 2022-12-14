class Rest extends Step {
    constructor(duration, label = "Rest") {   
        super();

        this.display = new StepDisplay(label, { duration: { value: duration, label: "Seconds" } });
        
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
}