/*
Bulk of this file done by Chad Perry, with significant functionality done by Tyler McWilliams and Mark Chapman

This file implements the functionality of the red black tree, while the BinaryTreeAnimations.js file handles the animations
*/

// This class is a node in the red black tree
class RBTNode {
    // Constructor for the node
    constructor(key, value) {
        this.key = key; // key of the node
        this.value = value; // value of the node
        this.left = null; // left child of the node
        this.right = null; // right child of the node
        this.color = 'red'; // color of the node
        this.parent = null; // parent of the node
        this.isLeaf = (key==null && value==null); // boolean to check if the node is a leaf
        if (this.isLeaf) this.color = 'black'; // if the node is a leaf, it is black

        this.type = 'Binary'; // type of tree
    }
    // Function to link a node to the left of the current node
    linkLeft(node) {
        this.left = node; // set the left child of the current node to the node passed in
        node.parent = this; // set the parent of the node passed in to the current node
    }
    // Function to link a node to the right of the current node
    linkRight(node) {
        this.right = node; // set the right child of the current node to the node passed in
        node.parent = this; // set the parent of the node passed in to the current node
    }
    // Function to check if the node is red
    isRed() {
        return this.color == 'red'; // return true if the node is red, false otherwise
    }
    // Function to check if the node is black
    isBlack() {
        return this.color == 'black'; // return true if the node is black, false otherwise
    }
    // Function to set the color of the node to red
    setRed() {
        this.color = 'red'; // set the color of the node to red
    }
    // Function to set the color of the node to black
    setBlack() {
        this.color = 'black'; // set the color of the node to black
    }
    // Function to get the depth of the node
    getDepth() {
        let node = this; // set the node to the current node
        let depth = 0; // set the depth to 0
        while (node.parent != null) { // while the node has a parent
            node = node.parent; // set the node to the parent of the node
            depth++; // increment the depth
        }
        return depth; // return the depth
    }
    // Function to get the level of the node
    getLevel() {
        return this.getDepth() + 1; // return the depth of the node plus 1
    }
    // Function to get the size of the subtree rooted at the node
    getSize() {
        let node = this; // set the node to the current node
        let size = 1; // set the size to 1
        if (node.left != null) size += node.left.getSize(); // if the node has a left child, add the size of the left subtree to the size
        if (node.right != null) size += node.right.getSize(); // if the node has a right child, add the size of the right subtree to the size
        return size; // return the size
    }
    // Function to get the rank of the node
    getRank() {
        let node = this; // set the node to the current node
        let key = node.key; // set the key to the key of the node
        let rank = 0; // set the rank to 0
        while (node.parent != null) { // while the node has a parent
            node = node.parent; // set the node to the parent of the node
        }
        let tree = node; // set the tree to the node
        while (tree) { // while the tree is not null
            if (key < tree.key){ // move to left subtree
                tree = tree.left; // set the tree to the left child of the tree
            }
            else if (key > tree.key) { // move to right subtree
                if (tree.left){ // if the tree has a left child
                    rank += 1 + tree.left.getSize(); // add 1 to the rank and the size of the left subtree to the rank
                    tree = tree.right; // set the tree to the right child of the tree
                }
                else {
                    rank += 1; // increment the rank
                    tree = tree.right; // set the tree to the right child of the tree
                }
            }
            else {
                if (tree.left) rank += tree.left.getSize(); // if the tree has a left child, add the size of the left subtree to the rank
                return rank; // return the rank
            }
        }
        return -1; // return -1 if the key is not in the tree
        
    }
    // Function to get the grandparent of the node
    getGrandparent() {
        if (this.parent == null) return null; // if the node has no parent, return null
        return this.parent.parent; // return the parent of the parent of the node
    }
    // Function to get the uncle of the node
    getUncle() {
        if (this.parent == null || this.parent.parent == null) return null; // if the node has no parent or grandparent, return null
        if (this.parent == this.parent.parent.left) return this.parent.parent.right; // if the parent of the node is the left child of the grandparent, return the right child of the grandparent
        else return this.parent.parent.left; // otherwise, return the left child of the grandparent
    }
    // Function to get the sibling of the node
    getSibling() {
        if (this.parent == null) return null; // if the node has no parent, return null
        if (this == this.parent.left) return this.parent.right; // if the node is the left child of the parent, return the right child of the parent
        else return this.parent.left; // otherwise, return the left child of the parent
    }
    // Function to get the predecessor of the node
    getPredecessor() {
        let node = this; // set the node to the current node
        if (node.left != null) { // if the node has a left child
            node = node.left; // set the node to the left child of the node
            while (node.right != null) node = node.right; // while the node has a right child, set the node to the right child of the node
            return node; // return the node
        }
        while (node.parent != null && node.parent.left == node) node = node.parent; // while the node has a parent and the node is the left child of the parent, set the node to the parent of the node
        return node.parent; // return the parent of the node
    }
    // Function to get the successor of the node
    getSuccessor() {
        let node = this; // set the node to the current node
        if (node.right != null) { // if the node has a right child
            node = node.right; // set the node to the right child of the node
            while (node.left != null) node = node.left; // while the node has a left child, set the node to the left child of the node
            return node; // return the node
        }
        while (node.parent != null && node.parent.right == node) node = node.parent; // while the node has a parent and the node is the right child of the parent, set the node to the parent of the node
        return node.parent; // return the parent of the node
    }
    // Function to get the minimum node in the subtree rooted at the node
    getMin() {
        let node = this; // set the node to the current node
        while (node.left != null) node = node.left; // while the node has a left child, set the node to the left child of the node
        return node; // return the node
    }
    // Function to get the maximum node in the subtree rooted at the node
    getMax() {
        let node = this; // set the node to the current node
        while (node.right != null) node = node.right; // while the node has a right child, set the node to the right child of the node
        return node; // return the node
    }
}
// Class to store the tree and handle the node operations
class RBTree {
    // Constructor to initialize the tree
    constructor(controller) {
        this.root = null; // set the root of the tree to null
        this.size = 0; // set the size of the tree to 0
        this.leaf = new RBTNode(null, null); // set the leaf of the tree to a new node with a null key and value

        this.canvas = controller.canvas; // set the canvas to the canvas of the controller
        this.animQueue = []; // set the animation queue to an empty array
        this.keys = []; // set the keys to an empty array
    }
    // Function to get a node with the given key
    find(key) {
        let node = this.root; // set the node to the root of the tree
        while (node != null) { // while the node is not null
            if (key < node.key) { // if the key is less than the key of the node
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, node, node.left)); // add an animation to the animation queue to move the cursor to the left child of the node
                node = node.left; // set the node to the left child of the node
            }
            else if (key > node.key) { // if the key is greater than the key of the node
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, node, node.right)); // add an animation to the animation queue to move the cursor to the right child of the node
                node = node.right; // set the node to the right child of the node
            } 
            else {
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).select(this.root, 'yellow', node)); // add an animation to the animation queue to select the node
                return node; // return the node
            }
        }
        return null; // return null
    }
    // Function to insert a node with the given key and value
    insert(key, value) {
        this.keys.push(key); // push the key to the keys array
        this.keys.sort((a, b) => b - a); // sort the keys array in descending order

        let node = new RBTNode(key, value); // create a new node with the given key and value
        node.linkLeft(this.leaf); // link the left child of the node to the leaf
        node.linkRight(this.leaf); // link the right child of the node to the leaf
        this.insertNode(node); // insert the node into the tree
        this.size++; // increment the size of the tree
        return node; // return the node
    }
    // Function to insert a node into the tree
    insertNode(node) {
        if (this.root == null) { // if the root of the tree is null
            this.root = node; // set the root of the tree to the node
            node.setBlack(); // set the color of the node to black
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).insert(this.root, node)); // add an animation to the animation queue to insert the node
            return; // return
        }
        let curr = this.root; // set the current node to the root of the tree
        while (curr) { // while the current node is not null
            if (node.key < curr.key) { // if the key of the node is less than the key of the current node
                if (curr.left == this.leaf) { // if the left child of the current node is the leaf
                    node.parent = curr; // set the parent of the node to the current node
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).insert(this.root, node)); // add an animation to the animation queue to insert the node
                    curr.left = node; // set the left child of the current node to the node
                    break; // break
                } else {
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).moveCursor(this.root, curr, curr.left)); // add an animation to the animation queue to move the cursor to the left child of the current node
                    curr = curr.left; // set the current node to the left child of the current node
                }
            } else {
                if (curr.right == this.leaf) { // if the right child of the current node is the leaf
                    node.parent = curr; // set the parent of the node to the current node
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).insert(this.root, node)); // add an animation to the animation queue to insert the node
                    curr.right = node; // set the right child of the current node to the node
                    break;
                } else {
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).moveCursor(this.root, curr, curr.right)); // add an animation to the animation queue to move the cursor to the right child of the current node
                    curr = curr.right; // set the current node to the right child of the current node
                }
            }
        }
        this.balanceInsert(node); // balance the tree
    }
    // Function to balance the tree after inserting a node
    balanceInsert(node) {
        if (node.parent == null) { // if the parent of the node is null
            node.setBlack(); // set the color of the node to black
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).select(this.root, 'cyan', node)); // add an animation to the animation queue to select the node
        } else if (node.parent.isBlack()) { // if the parent of the node is black
            return; // return
        } else if (node.getUncle().isRed()) { // if the uncle of the node is red
            node.parent.setBlack(); // set the color of the parent of the node to black
            node.getUncle().setBlack(); // set the color of the uncle of the node to black
            node.getGrandparent().setRed(); // set the color of the grandparent of the node to red

            this.animQueue.push(
                TreeAnims.Binary(this.canvas).
                select(this.root, 'cyan', node.parent, node.getGrandparent(), node.getUncle())); // add an animation to the animation queue to select the parent, grandparent, and uncle of the node

            this.balanceInsert(node.getGrandparent()); // balance the tree
        } else {
            if (node == node.parent.right && node.parent == node.getGrandparent().left) { // if the node is the right child of the parent and the parent is the left child of the grandparent
                this.rotateLeft(node.parent); // rotate the tree to the left
                node = node.left; // set the node to the left child of the node
            } else if (node == node.parent.left && node.parent == node.getGrandparent().right) { // if the node is the left child of the parent and the parent is the right child of the grandparent
                this.rotateRight(node.parent); // rotate the tree to the right
                node = node.right; // set the node to the right child of the node
            }
            node.parent.setBlack(); // set the color of the parent of the node to black
            node.getGrandparent().setRed(); // set the color of the grandparent of the node to red

            this.animQueue.push(
                TreeAnims.Binary(this.canvas).
                select(this.root, 'cyan', node.parent, node.getGrandparent())); // add an animation to the animation queue to select the parent and grandparent of the node

            if (node == node.parent.left) { // if the node is the left child of the parent
                this.rotateRight(node.getGrandparent()); // rotate the tree to the right
            } else {
                this.rotateLeft(node.getGrandparent()); // rotate the tree to the left
            }
        }
    }
    // Function to replace a node with another node
    replaceNode(oldNode, newNode) {
        if (oldNode.parent == null) { // if the parent of the old node is null
            this.root = newNode; // set the root of the tree to the new node
        } else { // if the parent of the old node is not null
            if (oldNode == oldNode.parent.left) { // if the old node is the left child of the parent
                oldNode.parent.left = newNode; // set the left child of the parent to the new node
            } else { // if the old node is the right child of the parent
                oldNode.parent.right = newNode; // set the right child of the parent to the new node
            } // end if
        } // end if
        newNode.parent = oldNode.parent; // set the parent of the new node to the parent of the old node
    }
    // Function to rotate the tree to the left
    rotateLeft(node) {
        let _root = cloneTree(this.root); // clone the tree
        let initial = new _Animation(Timing.linear,
            () => {}, 0,
            () => {
                this.canvas.clear();
                drawTree(_root, TreeAnims.Binary.nodeSize, this.canvas.layer0);
            }); // create an animation to draw the tree

        let right = node.right; // set the right node to the right child of the node
        this.replaceNode(node, right); // replace the node with the right node
        node.linkRight(right.left); // link the right child of the node to the left child of the right node
        right.linkLeft(node); // link the left child of the right node to the node

        let rotate = TreeAnims.Binary(this.canvas).updatePositions(this.root); // create an animation to update the positions of the nodes
        this.animQueue.push(new CompositeAnimation(initial, rotate)); // add the animation to the animation queue
    }
    // Function to rotate the tree to the right
    rotateRight(node) {
        let _root = cloneTree(this.root); // clone the tree
        let initial = new _Animation(Timing.linear,
            () => {}, 0,
            () => {
                this.canvas.clear();
                drawTree(_root, TreeAnims.Binary.nodeSize, this.canvas.layer0);
            }); // create an animation to draw the tree

        let left = node.left; // set the left node to the left child of the node
        this.replaceNode(node, left); // replace the node with the left node
        node.linkLeft(left.right); // link the left child of the node to the right child of the left node
        left.linkRight(node); // link the right child of the left node to the node

        let rotate = TreeAnims.Binary(this.canvas).updatePositions(this.root); // create an animation to update the positions of the nodes
        this.animQueue.push(new CompositeAnimation(initial, rotate)); // add the animation to the animation queue
    }
    // Function to get the minimum node in the tree
    getMin(node) {
        while (node.left != this.leaf) { // while the left child of the node is not the leaf
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).moveCursor(this.root, node, node.left)); // add an animation to the animation queue to move the cursor to the left child of the node
            node = node.left; // set the node to the left child of the node
        }
        this.animQueue.push(
            TreeAnims.Binary(this.canvas).select(this.root, 'yellow', node)); // add an animation to the animation queue to select the node
        return node; // return the node
    }
    // Function to take the minimum node out of the tree
    extractMin() {
        if (this.keys.length > 0) { // if the tree is not empty
            this.delete(this.keys.pop()); // delete the minimum node from the tree
        }
    }
    // Function to delete a node from the tree
    delete(key) {
        let forRemove = this.leaf; // set the node to delete to the leaf
        let tmp = this.root; // set the node to the root of the tree

        while (tmp != this.leaf) { // while the node is not the leaf
            if (tmp.key === key) { // if the key of the node is equal to the key to delete
                forRemove = tmp; // set the node to delete to the node
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).select(this.root, 'yellow', forRemove)); // add an animation to the animation queue to select the node
                break; // break out of the loop
            }

            if (tmp.key > key) { // if the key of the node is greater than the key to delete
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, tmp, tmp.left)); // add an animation to the animation queue to move the cursor to the left child of the node
                tmp = tmp.left; // set the node to the left child of the node
            } else {
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, tmp, tmp.right)); // add an animation to the animation queue to move the cursor to the right child of the node
                tmp = tmp.right; // set the node to the right child of the node
            }
        }

        if (forRemove == this.leaf) return;     // Avoid crashing when the key is not in the tree.

        let minRight = forRemove; // set the minimum node to the node to delete
        let minRightColor = minRight.color; // set the color of the minimum node to the color of the node to delete
        let newMinRight; // The new minimum node

        if (forRemove.left == this.leaf) { // if the left child of the node to delete is the leaf
            newMinRight = forRemove.right; // set the new minimum node to the right child of the node to delete
            if (!forRemove.right.isLeaf) { // if the right child of the node to delete is not the leaf
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).select(this.root, 'yellow', forRemove.right)); // add an animation to the animation queue to select the right child of the node to delete
            }
            this.replaceNode(forRemove, forRemove.right); // replace the node to delete with the right child of the node to delete
        }
        else if (forRemove.right == this.leaf) { // if the right child of the node to delete is the leaf
            newMinRight = forRemove.left; // set the new minimum node to the left child of the node to delete
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).select(this.root, 'yellow', forRemove.left)); // add an animation to the animation queue to select the left child of the node to delete
            this.replaceNode(forRemove, forRemove.left); // replace the node to delete with the left child of the node to delete
        }
        else {
            minRight = this.getMin(forRemove.right); // set the minimum node to the minimum node in the right subtree of the node to delete
            minRightColor = minRight.color; // set the color of the minimum node to the color of the minimum node
            newMinRight = minRight.right; // set the new minimum node to the right child of the minimum node

            if (minRight.parent === forRemove) { // if the parent of the minimum node is the node to delete
                newMinRight.parent = minRight; // set the parent of the new minimum node to the minimum node
            }
            else {
                this.replaceNode(minRight, minRight.right); // replace the minimum node with the right child of the minimum node
                minRight.right = forRemove.right; // set the right child of the minimum node to the right child of the node to delete
                minRight.right.parent = minRight; // set the parent of the right child of the minimum node to the minimum node
            }

            this.replaceNode(forRemove, minRight); // replace the node to delete with the minimum node
            minRight.left = forRemove.left; // set the left child of the minimum node to the left child of the node to delete
            minRight.left.parent = minRight; // set the parent of the left child of the minimum node to the minimum node
            minRight.color = forRemove.color; // set the color of the minimum node to the color of the node to delete
        }

        this.animQueue.push(
            TreeAnims.Binary(this.canvas).dropNode(this.root, forRemove)); // add an animation to the animation queue to drop the node to delete

        this.animQueue.push(
            TreeAnims.Binary(this.canvas).updatePositions(this.root)); // add an animation to the animation queue to update the positions of the nodes

        if (minRightColor == 'black') { // if the color of the minimum node is black
            this.balanceDelete(newMinRight); // balance the tree
        }
    }
    // Function to balance the tree after a node is deleted
    balanceDelete(node) {
        while (node != this.root && node.color == 'black') { // while the node is not the root and the color of the node is black
            console.log(node); // log the node

            if (node == node.parent.left) { // if the node is the left child of its parent
                let brother = node.parent.right; // set the brother of the node to the right child of its parent

                if (brother.color == 'red') { // if the color of the brother is red
                    brother.color = 'black'; // set the color of the brother to black
                    node.parent.color = 'red'; // set the color of the parent of the node to red
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, node.parent)); // add an animation to the animation queue to select the brother and the parent of the node
                    this.rotateLeft(node.parent); // rotate the parent of the node to the left
                    brother = node.parent.right; // set the brother of the node to the right child of its parent
                }

                if (
                    brother.left.color == 'black' && // if the color of the left child of the brother is black
                    brother.right.color == 'black' // and the color of the right child of the brother is black
                ) {
                    brother.color = 'red'; // set the color of the brother to red
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother)); // add an animation to the animation queue to select the brother
                    node = node.parent; // set the node to its parent
                } else {
                    if (brother.right.color == 'black') { // if the color of the right child of the brother is black
                        brother.left.color = 'black'; // set the color of the left child of the brother to black
                        brother.color = 'red'; // set the color of the brother to red
                        this.animQueue.push(
                            TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, brother.left)); // add an animation to the animation queue to select the brother and the left child of the brother
                        this.rotateRight(brother); // rotate the brother to the right

                        // For some reason, brother becomes node's parent after the rotation,
                        // so I had to manually reset node's parent.
                        node.parent = brother.parent.parent; // set the parent of the node to the parent of the parent of the brother

                        brother = node.parent.right; // set the brother of the node to the right child of its parent
                    }

                    brother.color = node.parent.color; // set the color of the brother to the color of the parent of the node
                    node.parent.color = 'black'; // set the color of the parent of the node to black
                    brother.right.color = 'black'; // set the color of the right child of the brother to black
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, brother.right, node.parent)); // add an animation to the animation queue to select the brother, the right child of the brother, and the parent of the node
                    this.rotateLeft(node.parent); // rotate the parent of the node to the left
                    node = this.root; // set the node to the root
                }
            } else {
                let brother = node.parent.left // set the brother of the node to the left child of its parent
                if (brother.color == 'red') { // if the color of the brother is red
                    brother.color = 'black'; // set the color of the brother to black
                    node.parent.color = 'red'; // set the color of the parent of the node to red
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, node.parent)); // add an animation to the animation queue to select the brother and the parent of the node
                    this.rotateRight(node.parent); // rotate the parent of the node to the right
                    brother = node.parent.left; // set the brother of the node to the left child of its parent
                }

                if (
                    brother.left.color == 'black' && // if the color of the left child of the brother is black
                    brother.right.color == 'black' // and the color of the right child of the brother is black
                ) {
                    brother.color = 'red'; // set the color of the brother to red
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother)); // add an animation to the animation queue to select the brother
                    node = node.parent; // set the node to its parent
                } else {
                    if (brother.left.color == 'black') { // if the color of the left child of the brother is black
                        brother.right.color = 'black'; // set the color of the right child of the brother to black
                        brother.color = 'red'; // set the color of the brother to red
                        this.animQueue.push( 
                            TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother)); // add an animation to the animation queue to select the brother
                        this.rotateLeft(brother); // rotate the brother to the left

                        // For some reason, brother becomes node's parent after the rotation,
                        // so I had to manually reset node's parent.
                        node.parent = brother.parent.parent; // set the parent of the node to the parent of the parent of the brother
                    
                        brother = node.parent.left; // set the brother of the node to the left child of its parent
                    }

                    brother.color = node.parent.color; // set the color of the brother to the color of the parent of the node
                    node.parent.color = 'black'; // set the color of the parent of the node to black
                    brother.left.color = 'black'; // set the color of the left child of the brother to black
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, brother, 'cyan', node.parent, brother.left)); // add an animation to the animation queue to select the brother, the left child of the brother, and the parent of the node
                    this.rotateRight(node.parent); // rotate the parent of the node to the right
                    node = this.root; // set the node to the root
                }
            }
        }

        node.color = 'black'; // set the color of the node to black
        this.animQueue.push(
            TreeAnims.Binary(this.canvas).select(this.root, 'cyan', node)); // add an animation to the animation queue to select the node
    }
}