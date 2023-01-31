Commands = {}
CommandDescriptions = {}
Commands.help = function() {
    return Object.keys(Commands).map(key => key + ": " + CommandDescriptions[key]).join("<br>");
};
CommandDescriptions.help = "Prints this help message";
function addCommand(name, description, func) {
    Commands[name] = func;
    CommandDescriptions[name] = description;
}
function runCommand(name, args) {
    if (Commands[name]){
        return Commands[name](args);
    }
    else {
        return "Command not found";
    }
}
function executeJS(args){
    return eval(args.join(" "));
}
addCommand("js", "Evaluates the given JavaScript code", executeJS);
class Console {
    constructor() {
        this._log = [];
        this._log.push = (...args) => {
            Array.prototype.push.apply(this._log, args);
            this._logChanged();
        }
        this.style = {};
        this.element = document.createElement('div');
        //this.element.classList.add('console');
        //this.element.innerHTML = "<div class='output'></div><div class='input'><input type='text'></div>";

        this.output = document.createElement('div');
        this.output.classList.add('output');
        this.output.style.zIndex = "101";
        this.element.appendChild(this.output);
        this.input = document.createElement('input');
        this.input.classList.add('input');
        this.input.style.zIndex = "101";
        this.element.appendChild(this.input);
        this.input.addEventListener('keydown', e => {
            if (e.keyCode == 13) {
                let command = this.input.value;
                this.input.value = "";
                this.handleCommand(command);
            }
        });
        this.element.style.position = "absolute";
        this.element.style.top = "0";
        this.element.style.left = "50%";
        this.element.style.width = "50%";
        this.element.style.height = "20%";
        this.element.style.backgroundColor = "grey";
        this.element.style.color = "white";
        this.element.style.overflow = "auto";
        this.element.style.zIndex = "100";
        for (let child of this.element.children) {
            child.style.zIndex = "101";
        }

        //add a button to toggle the console
        let button = document.createElement("button");
        button.innerHTML = "Toggle Console";
        button.style.position = "absolute";
        button.style.top = "0";
        button.style.right = "0";
        button.style.zIndex = "101";
        button.addEventListener("click", () => {
            if (this.element.style.display == "none") {
                this.element.style.display = "block";
            } else {
                this.element.style.display = "none";
            }
        });
        document.body.appendChild(button);
        this.button = button;
        document.body.appendChild(this.element);
        this.element.style.display = "none";
    }
    handleCommand(command) {
        let args = command.split(" ");
        let name = args.shift();
        let result = runCommand(name, args);
        this._log.push(command);
        if (result) {
            this._log.push(result);
        }
    }
    _logChanged() {
        this.output.innerHTML = this._log.join("<br>");
    }
    _log(...args) {
        this._log.push(...args);
    }
    _warn(...args) {
        this._log.push("WARN: " + args.join(" "));
    }
}
let console = new Console();
function log(...args) {
    console._log(...args);
}
function warn(...args) {
    console._warn(...args);
}
