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
    let pauseLock = Promise.resolve();
    let unpause;
    let elapsedTime;
    let startTime;
    let abort;

    /**
     * Resolves when the animation finishes playing.
     * @member {Promise}
     */
    this.finished = Promise.resolve();

    this.play = () => {
        startTime = performance.now() - elapsedTime;
        unpause();
    }

    this.pause = () => {
        pauseLock =                 // The animation loop waits on pauseLock
        new Promise((resolve) => {
            unpause = resolve;      // call unpause to resolve the lock
        });
    }

    this.showFirstFrame = () => {
        before();
        draw(0);
    }

    this.showLastFrame = () => {
        draw(1);
        after();
    }

    /**
     * Abort the animation by rejecting {@member finished}.
     * This can be used to break out of a chain of animation callbacks.
     */
    this.abort = () => {
        abort();
        this.pause();
        this.reset();
    }

    /**
     * Initializes {@member finished} and resets the animation progress.
     */
    this.reset = () => {
        elapsedTime = 0;
        startTime = performance.now();
        let start = true;

        this.finished = new Promise((resolve, reject) => {
            abort = reject;
            let animate = async(time) => {
                elapsedTime = time - startTime;

                let timeFraction = elapsedTime /    // Call duration if it is a function.
                    (duration instanceof Function ? duration() : duration);
                

                if (timeFraction < 0) timeFraction = 0;
                if (timeFraction > 1) timeFraction = 1;
            
                let progress = timing(timeFraction);

                await pauseLock;    // Wait if the animation is paused.

                if (start) {
                    before();
                    start = false;
                }
                draw(progress);
            
                if (timeFraction < 1) {
                    requestAnimationFrame(animate);     // Draw the next frame.
                } else {
                    after();
                    this.pause();
                    this.reset();
                    resolve();      // Resolve the promise.
                }
            }

            requestAnimationFrame(animate);
        });
    }

    this.pause();
    this.reset();
}