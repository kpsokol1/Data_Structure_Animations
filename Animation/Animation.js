/**
 * @author Sungmin Kim
 */

/**
 * @class Timing
 * 
 * This should strictly be a static class
 * (i.e. should never be instantiated).
 * Timing functions control the rate at
 * which an Animation progresses. For
 * Example, an ease-in would look like a 
 * curved graph. Add more functions if you'd
 * like, but linear should be enough. Timing
 * functions should return a floating-point
 * number between between 0 and 1 inclusive.
 */
class Timing {
    static linear(time) {
        return time;
    }
}

function animInterval() {
    return Number(doc.speed.max) - Number(doc.speed.value) + Number(doc.speed.min);
}

function timeByDistance(x0, y0, x1, y1, factor = 200) {
    let d = Math.sqrt((x1 - x0)**2 + (y1 - y0)**2);
    return (() => { return animInterval() * d / factor; });
}

function CompositeAnimation(...animations) {
    this.sequence = animations;
    this.finished = Promise.resolve();
    this.current = 0;
    this.paused = false;

    this.pause();
    this.reset();
}

Object.assign(CompositeAnimation.prototype, _Animation.prototype);

CompositeAnimation.prototype.play = function () {
    this.paused = false;
    this.sequence[this.current].play();
}

CompositeAnimation.prototype.pause = function () {
    this.paused = true;
    this.sequence[this.current].pause();
}

CompositeAnimation.prototype.showFirstFrame = function () {
    this.sequence[0].showFirstFrame();
}

CompositeAnimation.prototype.showLastFrame = function () {
    this.sequence[this.sequence.length - 1].showLastFrame();
}

CompositeAnimation.prototype.abort = function () {
    this.sequence[this.current].abort();
}

CompositeAnimation.prototype.reset = function () {
    this.current = 0;
    this.sequence.forEach(anim => anim.reset());

    this.finished = new Promise((resolve, reject) => {
        let playNext = () => {
            if (!this.paused) this.sequence[this.current].play();
            this.sequence[this.current].finished.then(() => {
                this.sequence[this.current].pause();
                this.sequence[this.current].reset();
                if (++this.current >= this.sequence.length) {
                    this.current = 0;
                    resolve();
                } else
                    playNext();
            }, reject);
        }
        playNext();
    });
}


/**
 * Returns an Animation object.
 * @constructor
 * @param {function} timing - Controls the rate of animation.
 * @param {function} draw - The draw function to be called every frame.
 * @param {(function|number)} duration - The duration of the animation.
 * @param {function} before - Draw function to be called before the first frame.
 * @param {function} after - Draw function to be called after the last frame.
 * @returns {_Animation}
 */

function _Animation(timing, draw, duration, before = ()=>{}, after = ()=>{}) {
    this.timing = timing;
    this.draw = draw;
    this.duration = duration;
    this.before = before;
    this.after = after;

    this.pauseLock;
    this.unpause;
    this.elapsedTime;
    this.startTime;
    this.exitLoop;
    this.paused = false;

    /**
     * Resolves when the animation finishes playing.
     * @member {Promise}
     */
    this.finished = Promise.resolve();

    this.pause();
    this.reset();
}

_Animation.prototype.play = function () {
    this.startTime = performance.now() - this.elapsedTime;
    this.paused = false;
    this.unpause();
}

_Animation.prototype.pause = function () {
    this.paused = true;

    this.pauseLock =                 // The animation loop waits on pauseLock
    new Promise((resolve) => {
        this.unpause = resolve;      // call unpause to resolve the lock
    });
}

_Animation.prototype.showFirstFrame = function () {
    this.before();
    this.draw(0);
}

_Animation.prototype.showLastFrame = function () {
    this.draw(1);
    this.after();
}

/**
 * Abort the animation by rejecting {@member finished}.
 * This can be used to break out of a chain of animation callbacks.
 */
_Animation.prototype.abort = function () {
    this.exitLoop();
}

/**
 * Initializes {@member finished} and resets the animation progress.
 */
_Animation.prototype.reset = function () {
    this.elapsedTime = 0;
    this.startTime = performance.now();
    let start = true;

    this.finished = new Promise((resolve, reject) => {
        this.exitLoop = reject;
        let animate = async(time) => {
            this.elapsedTime = time - this.startTime;

            let timeFraction = this.elapsedTime /    // Call duration if it is a function.
                (this.duration instanceof Function ? this.duration() : this.duration);
            

            if (timeFraction < 0) timeFraction = 0;
            if (timeFraction > 1) timeFraction = 1;
        
            let progress = this.timing(timeFraction);

            await this.pauseLock;    // Wait if the animation is paused.

            if (start) {
                this.before();
                start = false;
            }
            this.draw(progress);
        
            if (timeFraction < 1) {
                requestAnimationFrame(animate);     // Draw the next frame.
            } else {
                resolve();      // Resolve the promise.
                this.after();
            }
        }

        requestAnimationFrame(animate);
    });
}