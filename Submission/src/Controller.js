function Controller(Tree, title, commands) {

    this.runButton = createElement('button', {'innerHTML':'run >>'});
    this.nextButton = createElement('button', {'innerHTML':'next >'});
    this.prevButton = createElement('button', {'innerHTML':'prev &lt'});
    this.playback = createElement('input', {'type':'range', 'name':'playback', 'style':'position: relative; left: 50px; width:600px'});
    this.playback.label = createElement('label', {'for':'playback', 'innerHTML':'Playback: ', 'style':'position: relative; left: 50px'});
    this.speed = createElement('input', {'type':'range', 'min':'200', 'max':'2000', 'step':'100'});
    this.opSelect = createElement('select');
    this.opSelect.append(createElement('option', {'value':'insert', 'innerHTML':'Insert'}));
    this.opSelect.append(createElement('option', {'value':'delete', 'innerHTML':'Delete'}));
    this.opSelect.append(createElement('option', {'value':'find', 'innerHTML':'Find'}));
    this.operand = createElement('input', {'type':'text', 'size':'4'});
    this.submitOperand = createElement('input', {'type':'submit', 'value':'Submit'});
    this.canvas = createElement('div', {'style':'background: green; width: 1280px; height: 540px; position: relative'});
    this.canvas.append(createElement('canvas', 
        {'width':'1280', 'height':'540', 'style':'z-index:2; position: absolute'}));
    this.canvas.append(createElement('canvas', 
        {'width':'1280', 'height':'540', 'style':'z-index:3; position: absolute'}));
    this.canvas.append(createElement('canvas', 
        {'width':'1280', 'height':'540', 'style':'z-index:1; position: absolute'}));

    this.canvas.layer0 = this.canvas.childNodes[0].getContext('2d');
    this.canvas.layer1 = this.canvas.childNodes[1].getContext('2d');
    this.canvas.background = this.canvas.childNodes[2].getContext('2d');

    this.canvas.background.fillStyle = 'darkslategray';
    this.canvas.background.font = '40px consolas';
    this.canvas.background.fillText(title, 20, 40);

    this.canvas.width = 1280;
    this.canvas.height = 540;

    this.canvas.scale = (x, y) => {
        this.canvas.layer0.scale(x, y);
        this.canvas.layer1.scale(x, y);
    }

    this.canvas.resetTransform = () => {
        this.canvas.layer0.resetTransform();
        this.canvas.layer1.resetTransform();
    }

    this.canvas.clear = () => {
        clearCanvas(this.canvas.layer0);
        clearCanvas(this.canvas.layer1);
    }

    this.canvas.animInterval = () => {
        return  Number(this.speed.max) 
              - Number(this.speed.value) 
              + Number(this.speed.min);
    }

    document.body.append(this.runButton);
    document.body.append(this.prevButton);
    document.body.append(this.nextButton);
    document.body.append(createElement('br'));
    document.body.append('Speed: ', this.speed);
    document.body.append(createElement('br'));
    document.body.append(this.opSelect);
    document.body.append(this.operand);
    document.body.append(this.submitOperand);
    document.body.append(this.playback.label);
    document.body.append(this.playback);
    document.body.append(createElement('br'));
    document.body.append(this.canvas);
    document.body.append(createElement('br'));

    this.runButton.onclick = () => {this.toggleRun()};
    this.prevButton.onclick = () => {this.stepBack()};
    this.nextButton.onclick = () => {this.stepForward()};
    this.playback.oninput = () => {this.inputSlider()};
    this.playback.onmouseup = () => {this.setSlider()};
    this.submitOperand.onclick = () => {
        this.execute(this.opSelect.value, this.operand.value);
    }

    this.tree = new Tree(this);

    this.animQueue = this.tree.animQueue;

    this.playback.min = 0;
    this.playback.max = this.tree.animQueue.length;
    this.playback.value = 0;

    this.speed.value = 1000;

    this.curAnim;
    this.running = false;
    this.inputFlag = false;

    if (this.animQueue.length > 0) {
        this.animQueue[0].showFirstFrame();
        this.playQueue(0);
    } else if (commands) {
        for (let command of commands) {
            switch (command.operation) {
            case 'insert': {
                this.tree.insert(command.operand);
                break;
            }
            case 'delete':
                this.tree.delete(command.operand);
                break;
            case 'find':
                this.tree.find(command.operand);
                break;
            }
        }
    }
    this.playback.max = this.animQueue.length;
    this.playQueue(0);
    this.toggleRun();
}

function randInt(min, max) {
    return Math.floor(Math.random() * (Number(max) - Number(min) + 1)) + Number(min);
}
Controller.prototype.execute = function (operation, operand) {
    let num;
    if (operand == '*') 
        num = randInt(0, 99);
    else
        num = Number(operand);

    if (num === NaN) return;

    if (this.running) this.toggleRun();
    let i = this.playback.value = this.animQueue.length;

    switch (operation) {
    case 'insert': {
        this.tree.insert(num);
        break;
    }
    case 'delete':
        this.tree.delete(num);
        break;
    case 'find':
        this.tree.find(num);
        break;
    }

    this.playback.max = this.animQueue.length;

    this.curAnim?.abort();
    if (this.queueFinish) {
        this.queueFinish.then(() => {
            this.playQueue(i);
        });
    } else {
        this.playQueue(i);
    }

    if (!this.running) this.toggleRun();
}

Controller.prototype.stepBack = function () {
    let i = this.playback.value;

    if (this.running) this.toggleRun();

    this.curAnim?.abort();

    this.queueFinish.then(() => {
        this.playQueue(--i);
        this.curAnim?.showFirstFrame();
    });
}

Controller.prototype.stepForward = function () {
    let i = this.playback?.value;

    if (this.running) this.toggleRun();

    this.curAnim?.abort();

    this.queueFinish.then(() => {
        this.playQueue(++i);
        this.curAnim?.showLastFrame();
    });
}

Controller.prototype.toggleRun = function () {
    this.running = !(this.running);
        
    if (!this.running) {
        this.runButton.innerHTML = "run >>";
        this.curAnim?.pause();
    } else {
        this.runButton.innerHTML = "pause ||";
        if (this.playback?.value >= this.animQueue.length) {
            this.playQueue(0);
        } else {
            this.curAnim?.play();
        }
    }
}

Controller.prototype.inputSlider = function () {
    let i = this.playback?.value;

        if (!this.inputFlag) {
            this.curAnim?.abort();
        }
        this.inputFlag = true;
        

        i < this.animQueue.length ?
            this.animQueue[i].showFirstFrame() :
            this.animQueue[i-1].showLastFrame();
}

Controller.prototype.setSlider = function () {
    let i = this.playback?.value;

    if (this.inputFlag) {
        this.queueFinish.then(() => {
            this.playQueue(i);
        });
    }
    this.inputFlag = false; 
}

/**
 * Play the animations in the queue starting at i.
 * 
 * @param {Animation[]} animQueue - The array of animations to be played.
 * @param {number} i - The index of the first animation to play.
 * @returns {undefined}
 */
Controller.prototype.playQueue = function (i) {
this.queueFinish = new Promise((resolve) => {
    this.playback.value = i;

    if (i < 0) i = 0;
    
    if (i >= this.animQueue.length) {
        this.curAnim = null;
        if (this.running) {
            this.toggleRun();
        }
        resolve();
        return;
    }

    this.curAnim = this.animQueue[i];
    
    if (this.running) this.animQueue[i].play();

    this.animQueue[i].finished.then(() => {
        this.curAnim?.pause();
        this.curAnim?.reset();
        this.playQueue(++i);
    }, 
    () => {
        console.log('exited');
        this.curAnim?.pause();
        this.curAnim?.reset();
        resolve();
    });
});
}