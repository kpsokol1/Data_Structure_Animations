function Controller() {
    this.animQueue = [];
    this.curAnim = null;
    this.running = false;
    this.inputFlag = false;
    
    this.prev;
    this.next;
    this.run;
    this.progress;
}

Controller.prototype.stepBack = function () {
    let i = this.progress.value;
    
    this.curAnim?.finished.catch(() => {
        console.log('exited')
    });
    this.curAnim?.abort();

    if (this.running) this.toggleRun();

    this.playQueue(--i);
    this.curAnim?.showFirstFrame();
}

Controller.prototype.stepForward = function () {
    let i = this.progress.value;

    if (this.running) this.toggleRun();

    this.playQueue(++i);
    this.curAnim?.showFirstFrame();
}

Controller.prototype.toggleRun = function () {
    this.running = !(this.running);
        
    if (!this.running) {
        this.run.innerHTML = "run >>";
        this.curAnim?.pause();
    } else {
        this.run.innerHTML = "pause ||";
        if (this.progress.value >= this.animQueue.length) {
            this.playQueue(0);
        } else {
            this.curAnim?.play();
        }
    }
}

Controller.prototype.slideProgress = function () {
    let i = this.progress?.value;

    console.log(i);

        this.inputFlag = true;
        this.curAnim?.pause();

        i < this.animQueue.length ?
            this.animQueue[i].showFirstFrame() :
            this.animQueue[i-1].showLastFrame();
}

Controller.prototype.setProgress = function () {
    let i = this.progress?.value;

    if (this.inputFlag) {
        this.curAnim?.abort();
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
    this.progress.value = i;

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
        this.animQueue[i].pause();
        this.animQueue[i].reset();
        this.playQueue(++i);
    }, 
    () => {console.log('exited')});
}