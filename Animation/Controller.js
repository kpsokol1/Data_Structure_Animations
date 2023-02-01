function Controller(tree, runButton, slider) {
    this.tree = tree;
    this.runButton = runButton;
    this.slider = slider;

    this.animQueue = tree.animQueue;

    this.slider.min = 0;
    this.slider.max = tree.animQueue.length;
    this.slider.value = 0;

    this.curAnim;
    this.running = false;
    this.inputFlag = false;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (Number(max) - Number(min) + 1)) + Number(min);
}
Controller.prototype.execute = function (operation, operand) {
    let num;
    if (operand == '*') 
        num = randInt(-99, 99);
    else
        num = Number(operand);

    if (num === NaN) return;

    switch (operation) {
    case 'insert': {
        this.curAnim?.abort();
        let i = this.slider.value = this.animQueue.length;
        this.tree.insert(num);
        this.slider.max = this.animQueue.length;
        this.playQueue(i);
        if (!this.running) this.toggleRun();
        break;
    }
    case 'delete':
        this.tree.delete(num);
        break;
    case 'find':
        this.tree.find(num);
        break;
    }
}

Controller.prototype.stepBack = function () {
    let i = this.slider.value;
    
    this.curAnim?.finished.catch(() => {
        //console.log('exited')
    });
    this.curAnim?.abort();

    if (this.running) this.toggleRun();

    this.playQueue(--i);
    this.curAnim?.showFirstFrame();
}

Controller.prototype.stepForward = function () {
    let i = this.slider?.value;

    if (this.running) this.toggleRun();

    this.playQueue(++i);
    this.curAnim?.showFirstFrame();
}

Controller.prototype.toggleRun = function () {
    this.running = !(this.running);
        
    if (!this.running) {
        this.runButton.innerHTML = "run >>";
        this.curAnim?.pause();
    } else {
        this.runButton.innerHTML = "pause ||";
        if (this.slider?.value >= this.animQueue.length) {
            this.playQueue(0);
        } else {
            this.curAnim?.play();
        }
    }
}

Controller.prototype.inputSlider = function () {
    let i = this.slider?.value;

        if (!this.inputFlag) {
            this.curAnim?.abort();
        }
        this.inputFlag = true;
        

        i < this.animQueue.length ?
            this.animQueue[i].showFirstFrame() :
            this.animQueue[i-1].showLastFrame();
}

Controller.prototype.setSlider = function () {
    let i = this.slider?.value;

    if (this.inputFlag) {
        this.playQueue(i);
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
    this.slider.value = i;

    if (i < 0) i = 0;
    
    if (i >= this.animQueue.length) {
        this.curAnim = null;
        if (this.running) {
            this.toggleRun();
        }
        return;
    }

    this.curAnim = this.animQueue[i];
    
    if (this.running) this.animQueue[i].play();

    this.animQueue[i].finished.then(() => {
        this.playQueue(++i);
    }, 
    () => {console.log('exited')});

    console.log(this.curAnim);
    console.log(this.running);
}