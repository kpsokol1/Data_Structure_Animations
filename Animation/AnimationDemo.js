/**
 * @file Demonstrates the use of {@link VisualTree} and {@link _Animation}
 * @author Sungmin Kim
 */

/** Stuff DOM objects into an object for easy access. */
class Doc {

    createElement(id, type, attributes, label) {
        Object.defineProperty(this, id, {value: document.createElement(type)});
        this[id].setAttribute('id', id);
        
        for (let i of attributes) {
            this[id].setAttribute(i, attributes[i]);
        }

        this[id].label = label;
    }

    addElement(id) {
        Object.defineProperty(this, id, {value: document.getElementById(id)});
    }
}

var doc = new Doc;
var running = false;
var curAnim;

window.onload = function() {
    doc.addElement('canvas');
    doc.addElement('run');
    doc.addElement('prev');
    doc.addElement('next');
    doc.addElement('progress');
    doc.addElement('speed');

    let tree = new VisualTree(doc.canvas);
    let animQueue = [];
    animQueue = animQueue.concat(tree.insert(5));
    animQueue = animQueue.concat(tree.insert(3));
    animQueue = animQueue.concat(tree.insert(8));
    animQueue = animQueue.concat(tree.insert(1));
    animQueue = animQueue.concat(tree.insert(0));
    animQueue = animQueue.concat(tree.insert(2));
    animQueue = animQueue.concat(tree.insert(4));
    animQueue = animQueue.concat(tree.insert(6));
    animQueue = animQueue.concat(tree.insert(7));
    animQueue = animQueue.concat(tree.insert(9));
    animQueue = animQueue.concat(tree.insert(3.5));
    animQueue = animQueue.concat(tree.insert(3.2));
    animQueue = animQueue.concat(tree.insert(2.1));
    animQueue = animQueue.concat(tree.insert(1.5));
    animQueue = animQueue.concat(tree.insert(0.5));
    animQueue = animQueue.concat(tree.insert(-1));
    animQueue = animQueue.concat(tree.insert(5.5));
    animQueue = animQueue.concat(tree.insert(4.5));
    animQueue = animQueue.concat(tree.insert(8.5));
    animQueue = animQueue.concat(tree.insert(10));
    animQueue = animQueue.concat(tree.rotateRight(tree.root));
    animQueue = animQueue.concat(tree.rotateRight(tree.root));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root));
    animQueue = animQueue.concat(tree.rotateRight(tree.root));
    animQueue = animQueue.concat(tree.rotateRight(tree.root));
    animQueue = animQueue.concat(tree.rotateRight(tree.root.left));
    animQueue = animQueue.concat(tree.rotateRight(tree.root.left));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root.left));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root.left));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root.left));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root.left));
    animQueue = animQueue.concat(tree.rotateRight(tree.root.left));
    animQueue = animQueue.concat(tree.rotateRight(tree.root.left));
    animQueue = animQueue.concat(tree.rotateRight(tree.root.right));
    animQueue = animQueue.concat(tree.rotateRight(tree.root.right));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root.right));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root.right));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root.right));
    animQueue = animQueue.concat(tree.rotateLeft(tree.root.right));
    animQueue = animQueue.concat(tree.rotateRight(tree.root.right));
    animQueue = animQueue.concat(tree.rotateRight(tree.root.right));

    doc.progress.min = 0;
    doc.progress.max = animQueue.length;

    doc.prev.onclick = () => {
        if (running) doc.run.click();

        curAnim?.abort();

        let i = --doc.progress.value;
        if (i < 0) i = 0;

        playQueue(animQueue, i);
        animQueue[i]?.pause();
        animQueue[i]?.showFirstFrame();
    }

    let prevAnim = null;

    doc.next.onclick = () => {
        let i = doc.progress.value;

        if (running) doc.run.click();

        prevAnim?.finished?.catch(() => {});
        prevAnim?.abort();
        animQueue[i]?.abort();
        prevAnim = animQueue[i];
        animQueue[i].play();
        animQueue[i].finished.catch(() => {});
        
        playQueue(animQueue, ++i);
        animQueue[i]?.pause();
    }

    doc.run.click = () => {
        running = !running;
        
        if (!running) {
            doc.run.innerHTML = "run >>";
            curAnim?.pause();
        } else {
            doc.run.innerHTML = "pause ||";
            if (doc.progress.value >= animQueue.length) {
                playQueue(animQueue, 0);
            } else {
                curAnim.play();
            }
        }
    }

    doc.run.onclick = doc.run.click;

    let prev = null;

    doc.progress.onmousedown = () => {
        prev = doc.progress.value;
        curAnim?.pause();
    }
    doc.progress.oninput = () => {
        let i = doc.progress.value;

        i < animQueue.length ?
            animQueue[i].showFirstFrame() :
            animQueue[i-1].showLastFrame();
    }
    doc.progress.onmouseup = () => {
        let i = doc.progress.value;

        if (prev != i) {
            animQueue[prev]?.abort();
            playQueue(animQueue, i);
        } else {
            animQueue[prev]?.play();
        }

        if (!running) animQueue[i]?.pause();
    }

    let start = animQueue.length - 32;

    animQueue[start].showFirstFrame();
    playQueue(animQueue, start);
    animQueue[start].pause();
}

/**
 * Play the animations in the queue starting at i.
 * 
 * @param {Animation[]} animQueue - The array of animations to be played.
 * @param {number} i - The index of the first animation to play.
 * @returns {undefined}
 */
function playQueue(animQueue, i) {
    doc.progress.value = i;
    
    if (i >= animQueue.length) {
        curAnim = null;
        if (running) doc.run.click();
        return;
    }

    curAnim = animQueue[i];
    
    animQueue[i].play();

    animQueue[i].finished.then(() => {
        playQueue(animQueue, ++i);
    }, 
    () => {console.log('exited')});
}

function animInterval() {
    return Number(doc.speed.max) - Number(doc.speed.value) + Number(doc.speed.min);
}