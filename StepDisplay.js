class StepDisplay {
    static #scrollAnimationFrame = 0;

    #element;
    #stepsElement;

    #infos = new Map();

    constructor(title, infos) {
        this.#element = document.createElement("div");
        this.#element.classList.add("excercise");

        const header = this.#element.appendChild(document.createElement("h1"));
        header.textContent = title;

        const infosElement = this.#element.appendChild(document.createElement("div"));
        infosElement.classList.add("information");

        for (const [name, info] of Object.entries(infos)) {
            const infoElement = infosElement.appendChild(document.createElement("div"));
            this.#infos.set(name, infoElement.appendChild(document.createTextNode(info.value.toString())));
            infoElement.appendChild(document.createTextNode(" " + info.label));
        }

        this.#stepsElement = this.#element.appendChild(document.createElement("div"));
        this.#stepsElement.classList.add('steps');
    }

    get element() {
        return this.#element;
    }

    set isActive(value) {
        this.#element.classList.toggle("active", value);
        if (value) {
            this.scrollIntoView();
        }
    }

    get isActive() {
        return this.#element.classList.contains("active");
    }

    scrollIntoView() {
        if (StepDisplay.#scrollAnimationFrame) {
            window.cancelAnimationFrame(StepDisplay.#scrollAnimationFrame);
        }

        return new Promise((resolve) => {
            StepDisplay.#scrollAnimationFrame = window.requestAnimationFrame(() => {
                StepDisplay.#scrollAnimationFrame = 0;
                let verticalPosition = this.#element.parentElement.id === "workout" || this.#element.offsetHeight > document.querySelector("html").clientHeight ? "start" : "center";
                this.#element.scrollIntoView({ behavior: "smooth", block: verticalPosition });
                resolve();
            });
        });
    }

    appendStep(step) {
        this.#stepsElement.appendChild(step.element);
    }

    updateInfo(name, value) {
        const node = this.#infos.get(name);

        if (node) {
            node.textContent = value.toString();
        }
    }
}