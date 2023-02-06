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

    let tree = new BinaryTree(doc.canvas.getContext('2d'));
   
    tree.insert(50);
    tree.insert(30);
    tree.insert(80);
    tree.insert(10);
    tree.insert(0);
    tree.insert(20);
    tree.insert(40);
    tree.insert(60);
    tree.insert(70);
    tree.insert(90);
    tree.insert(35);
    tree.insert(32);
    tree.insert(21);
    tree.insert(15);
    tree.insert(5);
    tree.insert(-1);
    tree.insert(55);
    tree.insert(45);
    tree.insert(85);
    tree.insert(99);
    
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
    
    controller = new Controller(tree, doc.run, doc.progress);
}