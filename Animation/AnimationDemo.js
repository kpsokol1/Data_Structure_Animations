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

    let vTree = new VisualTree(doc.canvas);
    let tree = new BinaryTree(vTree);
    let controller = new Controller(0);
    
    tree.insert(5);
    tree.insert(3);
    tree.insert(8);
    tree.insert(1);
    tree.insert(0);
    tree.insert(2);
    tree.insert(4);
    tree.insert(6);
    tree.insert(7);
    tree.insert(9);
    tree.insert(3.5);
    tree.insert(3.2);
    tree.insert(2.1);
    tree.insert(1.5);
    tree.insert(0.5);
    tree.insert(-1);
    tree.insert(5.5);
    tree.insert(4.5);
    tree.insert(8.5);
    tree.insert(10);
    
    tree.rotateRight(tree.root);
    tree.rotateRight(tree.root);
    tree.rotateLeft(tree.root);
    tree.rotateLeft(tree.root);
    tree.rotateLeft(tree.root);
    tree.rotateLeft(tree.root);
    tree.rotateRight(tree.root);
    tree.rotateRight(tree.root);
    tree.rotateRight(tree.root.left)
    tree.rotateRight(tree.root.left)
    tree.rotateLeft(tree.root.left);
    tree.rotateLeft(tree.root.left);
    tree.rotateLeft(tree.root.left);
    tree.rotateLeft(tree.root.left);
    tree.rotateRight(tree.root.left);
    tree.rotateRight(tree.root.left);
    tree.rotateRight(tree.root.right);
    tree.rotateRight(tree.root.right);
    tree.rotateLeft(tree.root.right);
    tree.rotateLeft(tree.root.right);
    tree.rotateLeft(tree.root.right);
    tree.rotateLeft(tree.root.right);
    tree.rotateRight(tree.root.right);
    tree.rotateRight(tree.root.right);

    doc.prev.onclick = function () {
        controller.stepBack();
    }

    doc.next.onclick = function () {
        controller.stepForward();
    }

    doc.run.onclick = function () {
        controller.toggleRun();
    }

    doc.progress.oninput = function () {
        controller.slideProgress();
    }
    doc.progress.onmouseup = function () {
        controller.setProgress();
    }

    controller.animQueue = tree.animQueue;
    controller.prev = doc.prev;
    controller.next = doc.next;
    controller.run = doc.run;
    controller.progress = doc.progress;

    controller.progress.min = 0;
    controller.progress.max = controller.animQueue.length;
    controller.progress.value = 0;

    controller.animQueue[0].showFirstFrame();
    controller.playQueue(0);
}

function animInterval() {
    return Number(doc.speed.max) - Number(doc.speed.value) + Number(doc.speed.min);
}