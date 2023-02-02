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
var controller;

window.onload = function() {
    doc.addElement('canvas');
    doc.addElement('run');
    doc.addElement('prev');
    doc.addElement('next');
    doc.addElement('progress');
    doc.addElement('speed');
    doc.addElement('operation');
    doc.addElement('operand');

    let vHeap = new VisualBHeap(doc.canvas);
    let heap = new BinomialHeap(vHeap);

    for (let i = 0; i < 31; ++i) {
        heap.insert(i);
    }

    vHeap.drawTree(heap.head);

    controller = new Controller(heap, doc.run, doc.progress);

    controller.prev = doc.prev;
    controller.next = doc.next;
    controller.run = doc.run;
    controller.progress = doc.progress;
}