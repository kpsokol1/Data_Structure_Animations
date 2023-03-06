/*
Bulk of this file done by Chad Perry, with significant functionality done by Tyler McWilliams and Mark Chapman

This file implements the functionality of the red black tree, while the BinaryTreeAnimations.js file handles the animations
*/

// This class is a node in the red black tree
class RBTNode {
    // Constructor for the node
    constructor(key, value) {
        //seting characteristics of the node
        this.key = key;
        this.value = value;
        this.left = null;
        this.right = null;
        this.color = 'red';
        this.parent = null;
        this.isLeaf = (key == null && value == null); // boolean to check if the node is a leaf
        if (this.isLeaf) this.color = 'black'; // if the node is a leaf, it is black

        this.type = 'Binary'; // type of tree
    }
    // Function to link a node to the left of the current node
    linkLeft(node) {
        this.left = node;
        node.parent = this;
    }
    // Function to link a node to the right of the current node
    linkRight(node) {
        this.right = node;
        node.parent = this;
    }
    // Function to check if the node is red
    isRed() {
        return this.color == 'red';
    }
    // Function to check if the node is black
    isBlack() {
        return this.color == 'black';
    }
    // Function to set the color of the node to red
    setRed() {
        this.color = 'red';
    }
    // Function to set the color of the node to black
    setBlack() {
        this.color = 'black';
    }
    // Function to get the depth of the node by traversing up the tree
    getDepth() {
        let node = this;
        let depth = 0;
        while (node.parent != null) {
            node = node.parent;
            depth++;
        }
        return depth;
    }
    // Function to get the level of the node by adding 1 to the depth
    getLevel() {
        return this.getDepth() + 1;
    }
    // Function to get the size of the subtree rooted at the node
    getSize() {
        let node = this;
        let size = 1;
        if (node.left != null) size += node.left.getSize(); // if the node has a left child, add the size of the left subtree to the size
        if (node.right != null) size += node.right.getSize(); // if the node has a right child, add the size of the right subtree to the size
        return size;
    }
    // Function to get the rank of the node
    getRank() {
        let node = this;
        let key = node.key;
        let rank = 0;
        while (node.parent != null) {
            node = node.parent;
        }
        let tree = node;
        while (tree) { // while the tree is not null
            if (key < tree.key) { // if the key is less than the key of the tree set the tree to the left child of the tree
                tree = tree.left;
            }
            else if (key > tree.key) { // if the key is greater than the key of the tree 
                if (tree.left) { // if the tree has a left child, add the size of the left subtree to the rank
                    rank += 1 + tree.left.getSize();
                    tree = tree.right;
                }
                else { // otherwise, add 1 to the rank
                    rank += 1;
                    tree = tree.right;
                }
            }
            else { // if the key is equal to the key of the tree
                if (tree.left) rank += tree.left.getSize(); // if the tree has a left child, add the size of the left subtree to the rank
                return rank;
            }
        }
        return -1; // return -1 if the key is not in the tree

    }
    // Function to get the grandparent of the node
    getGrandparent() {
        if (this.parent == null) return null;
        return this.parent.parent;
    }
    // Function to get the uncle of the node 
    getUncle() {
        if (this.parent == null || this.parent.parent == null) return null;
        if (this.parent == this.parent.parent.left) return this.parent.parent.right;
        else return this.parent.parent.left;
    }
    // Function to get the sibling of the node by checking if the node is the left or right child of the parent and returning the other child
    getSibling() {
        if (this.parent == null) return null;
        if (this == this.parent.left) return this.parent.right;
        else return this.parent.left;
    }
    // Function to get the predecessor of the node
    getPredecessor() {
        let node = this;
        if (node.left != null) {
            node = node.left;
            while (node.right != null) node = node.right; // while the node has a right child, set the node to the right child of the node
            return node;
        }
        while (node.parent != null && node.parent.left == node) node = node.parent; // while the node has a parent and the node is the left child of the parent, set the node to the parent of the node
        return node.parent;
    }
    // Function to get the successor of the node
    getSuccessor() {
        let node = this;
        if (node.right != null) {
            node = node.right;
            while (node.left != null) node = node.left; // while the node has a left child, set the node to the left child of the node
            return node;
        }
        while (node.parent != null && node.parent.right == node) node = node.parent; // while the node has a parent and the node is the right child of the parent, set the node to the parent of the node
        return node.parent;
    }
    // Function to get the minimum node in the subtree rooted at the node by traversing down the tree on the left side
    getMin() {
        let node = this;
        while (node.left != null) node = node.left;
        return node;
    }
    // Function to get the maximum node in the subtree rooted at the node by traversing down the tree on the right side
    getMax() {
        let node = this;
        while (node.right != null) node = node.right;
        return node;
    }
}
// Class to store the tree and handle the node operations
class RBTree {

    constructor(controller) {
        this.root = null;
        this.size = 0;
        this.leaf = new RBTNode(null, null); // set the leaf to a new node with a null key and value

        this.canvas = controller.canvas;
        this.animQueue = [];
        this.keys = [];
    }
    // Function to get a node with the given key
    find(key) {
        let node = this.root;
        while (node != null) { // while the node is not null
            if (key < node.key) { // if the key is less than the key of the node set the node to the left child of the node
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, node, node.left)); // add an animation to the animation queue to move the cursor to the left child of the node
                node = node.left;
            }
            else if (key > node.key) { // if the key is greater than the key of the node set the node to the right child of the node
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, node, node.right));
                node = node.right;
            }
            else { //otherwise, the key is equal to the key of the node
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).select(this.root, 'yellow', node)); // add an animation to the animation queue to select the node
                return node;
            }
        }
        return null;
    }
    // Function to insert a node with the given key and value
    insert(key, value) {
        this.keys.push(key); // push the key to the keys array and sort the keys array in descending order
        this.keys.sort((a, b) => b - a);

        let node = new RBTNode(key, value); // create a new node with the given key and value and link the children
        node.linkLeft(this.leaf);
        node.linkRight(this.leaf);
        this.insertNode(node); // insert the node into the tree and increment the size of the tree
        this.size++;
        return node;
    }
    // Function to insert a node into the tree
    insertNode(node) {
        if (this.root == null) { // if the root of the tree is null the node is the root of the tree
            this.root = node;
            node.setBlack(); // set the color of the node to black
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).insert(this.root, node));
            return;
        }
        let curr = this.root;
        while (curr) { // while the current node is not null
            if (node.key < curr.key) { // if the key of the node is less than the key of the current node
                if (curr.left == this.leaf) { // if the left child of the current node is the leaf 
                    node.parent = curr;
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).insert(this.root, node));
                    curr.left = node; // set the left child of the current node to the node
                    break;
                } else { // otherwise, set the current node to the left child of the current node
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).moveCursor(this.root, curr, curr.left));
                    curr = curr.left;
                }
            } else { // otherwise, the key of the node is greater than or equal to the key of the current node
                if (curr.right == this.leaf) { // if the right child of the current node is the leaf
                    node.parent = curr;
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).insert(this.root, node));
                    curr.right = node;
                    break;
                } else {
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).moveCursor(this.root, curr, curr.right));
                    curr = curr.right;
                }
            }
        }
        this.balanceInsert(node); // balance the tree
    }
    // Function to balance the tree after inserting a node
    balanceInsert(node) {
        if (node.parent == null) { // if there is no parent of the node
            node.setBlack();
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).select(this.root, 'cyan', node));
        } else if (node.parent.isBlack()) { // if the parent of the node is black
            return;
        } else if (node.getUncle().isRed()) { // if the uncle of the node is red 
            node.parent.setBlack();
            node.getUncle().setBlack();
            node.getGrandparent().setRed();

            this.animQueue.push(
                TreeAnims.Binary(this.canvas).
                    select(this.root, 'cyan', node.parent, node.getGrandparent(), node.getUncle()));

            this.balanceInsert(node.getGrandparent());
        } else {
            if (node == node.parent.right && node.parent == node.getGrandparent().left) { // if the node is the right child of the parent and the parent is the left child of the grandparent 
                this.rotateLeft(node.parent);
                node = node.left; // set the node to the left child of the node
            } else if (node == node.parent.left && node.parent == node.getGrandparent().right) { // if the node is the left child of the parent and the parent is the right child of the grandparent
                this.rotateRight(node.parent);
                node = node.right;
            }
            // set the color of the parent and grandparent of the node to black and red respectively
            node.parent.setBlack();
            node.getGrandparent().setRed();

            this.animQueue.push(
                TreeAnims.Binary(this.canvas).
                    select(this.root, 'cyan', node.parent, node.getGrandparent()));

            if (node == node.parent.left) { // if the node is the left child of the parent rotate the tree to the right
                this.rotateRight(node.getGrandparent());
            } else { // otherwise, rotate the tree to the left
                this.rotateLeft(node.getGrandparent());
            }
        }
    }
    // Function to replace a node with another node
    replaceNode(oldNode, newNode) {
        if (oldNode.parent == null) { // if the parent of the old node is null set the root of the tree to the new node
            this.root = newNode;
        } else { // if the parent of the old node is not null
            if (oldNode == oldNode.parent.left) { // if the old node is the left child of the parent set the left child of the parent to the new node
                oldNode.parent.left = newNode;
            } else { // if the old node is the right child of the parent set the right child of the parent to the new node
                oldNode.parent.right = newNode;
            }
        }
        newNode.parent = oldNode.parent; // set the parent of the new node to the parent of the old node
    }
    // Function to rotate the tree to the left
    rotateLeft(node) {
        let _root = cloneTree(this.root); // clone the tree
        let initial = new _Animation(Timing.linear,
            () => { }, 0,
            () => {
                this.canvas.clear();
                drawTree(_root, TreeAnims.Binary.nodeSize, this.canvas.layer0);
            }); // create an animation to draw the tree

        let right = node.right; // set the right node to the right child of the node and replace the node with the right node
        this.replaceNode(node, right);
        //link the children of the node
        node.linkRight(right.left);
        right.linkLeft(node);

        let rotate = TreeAnims.Binary(this.canvas).updatePositions(this.root); // create an animation to update the positions of the nodes
        this.animQueue.push(new CompositeAnimation(initial, rotate)); // add the animation to the animation queue
    }
    // Function to rotate the tree to the right
    rotateRight(node) {
        let _root = cloneTree(this.root); // clone the tree
        let initial = new _Animation(Timing.linear,
            () => { }, 0,
            () => {
                this.canvas.clear();
                drawTree(_root, TreeAnims.Binary.nodeSize, this.canvas.layer0);
            }); // create an animation to draw the tree

        let left = node.left; // set the left node to the left child of the node and replace the node with the left node
        this.replaceNode(node, left);
        // link the children of the node
        node.linkLeft(left.right);
        left.linkRight(node);

        let rotate = TreeAnims.Binary(this.canvas).updatePositions(this.root);
        this.animQueue.push(new CompositeAnimation(initial, rotate));
    }
    // Function to get the minimum node in the tree
    getMin(node) {
        while (node.left != this.leaf) { // while the left child of the node is not the leaf, set the node to the left child of the node
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).moveCursor(this.root, node, node.left));
            node = node.left;
        }
        this.animQueue.push(
            TreeAnims.Binary(this.canvas).select(this.root, 'yellow', node));
        return node;
    }
    // Function to take the minimum node out of the tree
    extractMin() {
        if (this.keys.length > 0) { // if the tree is not empty delete the minimum node
            this.delete(this.keys.pop());
        }
    }
    // Function to delete a node from the tree
    delete(key) {
        let forRemove = this.leaf; // set the node to delete to the leaf
        let tmp = this.root;

        //search for the node to delete
        while (tmp != this.leaf) {
            if (tmp.key === key) {
                forRemove = tmp;
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).select(this.root, 'yellow', forRemove));
                break;
            }

            if (tmp.key > key) { // if the key of the node is greater than the key to delete set the node to the left child of the node
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, tmp, tmp.left));
                tmp = tmp.left;
            } else { // if the key of the node is less than the key to delete set the node to the right child of the node
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, tmp, tmp.right));
                tmp = tmp.right;
            }
        }

        // if the node does not exist in the tree, return
        if (forRemove == this.leaf) return;

        let minRight = forRemove;
        let minRightColor = minRight.color;
        let newMinRight;

        //if the node for removing has no left child we replace this by its right child
        if (forRemove.left == this.leaf) {
            newMinRight = forRemove.right;
            if (!forRemove.right.isLeaf) {
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).select(this.root, 'yellow', forRemove.right));
            }
            this.replaceNode(forRemove, forRemove.right);
        }
        // if the node for removing has no right child, we replace this by its left child
        else if (forRemove.right == this.leaf) {
            newMinRight = forRemove.left;
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).select(this.root, 'yellow', forRemove.left));
            this.replaceNode(forRemove, forRemove.left);
        }
        else {
            // if the node to be remvoed has both children
            minRight = this.getMin(forRemove.right);
            minRightColor = minRight.color;
            newMinRight = minRight.right;

            if (minRight.parent === forRemove) {
                newMinRight.parent = minRight;
            }
            else { // if the parent of the minimum node is not the node to delete replace the minimum node with the right child of the minimum node
                this.replaceNode(minRight, minRight.right); // replace the minimum node with the right child of the minimum node
                minRight.right = forRemove.right;
                minRight.right.parent = minRight;
            }

            this.replaceNode(forRemove, minRight); // replace the node to delete with the minimum node
            minRight.left = forRemove.left;
            minRight.left.parent = minRight;
            minRight.color = forRemove.color;
        }

        this.animQueue.push(
            TreeAnims.Binary(this.canvas).dropNode(this.root, forRemove));

        this.animQueue.push(
            TreeAnims.Binary(this.canvas).updatePositions(this.root));
        if (minRightColor == 'black') { // if the color of the minimum node is black balance the tree
            this.balanceDelete(newMinRight);
        }
    }
    // Function to balance the tree after a node is deleted
    balanceDelete(node) {
        while (node != this.root && node.color == 'black') { // while the node is not the root and the color of the node is black
            console.log(node);

            if (node == node.parent.left) { // if the node is the left child of its parent set the brother of the node to the right child of its parent
                let brother = node.parent.right;

                if (brother.color == 'red') { // if the color of the brother is red 
                    brother.color = 'black';
                    node.parent.color = 'red';
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, node.parent));
                    this.rotateLeft(node.parent); // rotate the parent of the node to the left
                    brother = node.parent.right;
                }

                if (brother.left.color == 'black' && brother.right.color == 'black') { //if both the left child or the right child of the brother is black
                    brother.color = 'red';
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother));
                    node = node.parent;
                } else {
                    if (brother.right.color == 'black') { // if the color of the right child of the brother is black
                        brother.left.color = 'black';
                        brother.color = 'red';
                        this.animQueue.push(
                            TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, brother.left));
                        this.rotateRight(brother); // rotate the brother to the right

                        // For some reason, brother becomes node's parent after the rotation,
                        // so I had to manually reset node's parent.
                        node.parent = brother.parent.parent;

                        brother = node.parent.right;
                    }

                    brother.color = node.parent.color;
                    node.parent.color = 'black';
                    brother.right.color = 'black';
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, brother.right, node.parent));
                    this.rotateLeft(node.parent);
                    node = this.root;
                }
            } else { // if the node is the right child of its parent
                let brother = node.parent.left
                if (brother.color == 'red') {
                    brother.color = 'black';
                    node.parent.color = 'red';
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, node.parent));
                    this.rotateRight(node.parent);
                    brother = node.parent.left;
                }

                if (brother.left.color == 'black' && brother.right.color == 'black') { //if both the left child or the right child of the brother is black
                    brother.color = 'red';
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother));
                    node = node.parent;
                } else {
                    if (brother.left.color == 'black') {
                        brother.right.color = 'black';
                        brother.color = 'red';
                        this.animQueue.push(
                            TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother));
                        this.rotateLeft(brother);


                        node.parent = brother.parent.parent;

                        brother = node.parent.left;
                    }

                    brother.color = node.parent.color;
                    node.parent.color = 'black';
                    brother.left.color = 'black';
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, brother, 'cyan', node.parent, brother.left));
                    this.rotateRight(node.parent);
                    node = this.root;
                }
            }
        }

        node.color = 'black';
        this.animQueue.push(
            TreeAnims.Binary(this.canvas).select(this.root, 'cyan', node));
    }
}