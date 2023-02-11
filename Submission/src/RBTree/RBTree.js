class RBTNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.left = null;
        this.right = null;
        this.color = 'red';
        this.parent = null;
        this.isLeaf = (key==null && value==null);
        if (this.isLeaf) this.color = 'black';

        this.type = 'Binary';
    }
    linkLeft(node) {
        this.left = node;
        node.parent = this;
    }
    linkRight(node) {
        this.right = node;
        node.parent = this;
    }
    isRed() {
        return this.color == 'red';
    }
    isBlack() {
        return this.color == 'black';
    }
    setRed() {
        this.color = 'red';
    }
    setBlack() {
        this.color = 'black';
    }
    getDepth() {
        let node = this;
        let depth = 0;
        while (node.parent != null) {
            node = node.parent;
            depth++;
        }
        return depth;
    }
    getLevel() {
        return this.getDepth() + 1;
    }
    getSize() {
        let node = this;
        let size = 1;
        if (node.left != null) size += node.left.getSize();
        if (node.right != null) size += node.right.getSize();
        return size;
    }
    getRank() {
        let node = this;
        let key = node.key;
        let rank = 0;
        while (node.parent != null) {
            node = node.parent;
        }
        let tree = node;
        while (tree) {
            if (key < tree.key){ // move to left subtree
                tree = tree.left;
            }
            else if (key > tree.key) {
                if (tree.left){
                    rank += 1 + tree.left.getSize();
                    tree = tree.right;
                }
                else {
                    rank += 1;
                    tree = tree.right;
                }
            }
            else {
                if (tree.left) rank += tree.left.getSize();
                return rank;
            }
        }
        return -1;
        
    }
    getGrandparent() {
        if (this.parent == null) return null;
        return this.parent.parent;
    }
    getUncle() {
        if (this.parent == null || this.parent.parent == null) return null;
        if (this.parent == this.parent.parent.left) return this.parent.parent.right;
        else return this.parent.parent.left;
    }
    getSibling() {
        if (this.parent == null) return null;
        if (this == this.parent.left) return this.parent.right;
        else return this.parent.left;
    }
    getPredecessor() {
        let node = this;
        if (node.left != null) {
            node = node.left;
            while (node.right != null) node = node.right;
            return node;
        }
        while (node.parent != null && node.parent.left == node) node = node.parent;
        return node.parent;
    }
    getSuccessor() {
        let node = this;
        if (node.right != null) {
            node = node.right;
            while (node.left != null) node = node.left;
            return node;
        }
        while (node.parent != null && node.parent.right == node) node = node.parent;
        return node.parent;
    }
    getMin() {
        let node = this;
        while (node.left != null) node = node.left;
        return node;
    }
    getMax() {
        let node = this;
        while (node.right != null) node = node.right;
        return node;
    }
}

class RBTree {
    constructor(controller) {
        this.root = null;
        this.size = 0;
        this.leaf = new RBTNode(null, null);

        this.canvas = controller.canvas;
        this.animQueue = [];
    }
    find(key) {
        let node = this.root;
        while (node != null) {
            if (key < node.key) {
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, node, node.left));
                node = node.left;
            }
            else if (key > node.key) {
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, node, node.right));
                node = node.right;
            } 
            else {
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).select(this.root, 'yellow', node));
                return node;
            }
        }
        return null;
    }
    insert(key, value) {
        let node = new RBTNode(key, value);
        node.linkLeft(this.leaf);
        node.linkRight(this.leaf);
        this.insertNode(node);
        this.size++;
        return node;
    }
    insertNode(node) {
        if (this.root == null) {
            this.root = node;
            node.setBlack();
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).insert(this.root, node));
            return;
        }
        let curr = this.root;
        while (curr) {
            if (node.key < curr.key) {
                if (curr.left == this.leaf) {
                    node.parent = curr;
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).insert(this.root, node));
                    curr.left = node;
                    break;
                } else {
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).moveCursor(this.root, curr, curr.left));
                    curr = curr.left;
                }
            } else {
                if (curr.right == this.leaf) {
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
        this.balanceInsert(node);
    }
    balanceInsert(node) {
        if (node.parent == null) {
            node.setBlack();
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).select(this.root, 'cyan', node));
        } else if (node.parent.isBlack()) {
            return;
        } else if (node.getUncle().isRed()) {
            node.parent.setBlack();
            node.getUncle().setBlack();
            node.getGrandparent().setRed();

            this.animQueue.push(
                TreeAnims.Binary(this.canvas).
                select(this.root, 'cyan', node.parent, node.getGrandparent(), node.getUncle()));

            this.balanceInsert(node.getGrandparent());
        } else {
            if (node == node.parent.right && node.parent == node.getGrandparent().left) {
                this.rotateLeft(node.parent);
                node = node.left;
            } else if (node == node.parent.left && node.parent == node.getGrandparent().right) {
                this.rotateRight(node.parent);
                node = node.right;
            }
            node.parent.setBlack();
            node.getGrandparent().setRed();

            this.animQueue.push(
                TreeAnims.Binary(this.canvas).
                select(this.root, 'cyan', node.parent, node.getGrandparent()));

            if (node == node.parent.left) {
                this.rotateRight(node.getGrandparent());
            } else {
                this.rotateLeft(node.getGrandparent());
            }
        }
    }
    replaceNode(oldNode, newNode) {
        if (oldNode.parent == null) {
            this.root = newNode;
        } else {
            if (oldNode == oldNode.parent.left) {
                oldNode.parent.left = newNode;
            } else {
                oldNode.parent.right = newNode;
            }
        }
        newNode.parent = oldNode.parent;
    }
    rotateLeft(node) {
        let _root = cloneTree(this.root);
        let initial = new _Animation(Timing.linear,
            () => {}, 0,
            () => {
                this.canvas.clear();
                drawTree(_root, TreeAnims.Binary.nodeSize, this.canvas.layer0);
            });

        let right = node.right;
        this.replaceNode(node, right);
        node.linkRight(right.left);
        right.linkLeft(node);

        let rotate = TreeAnims.Binary(this.canvas).updatePositions(this.root);
        this.animQueue.push(new CompositeAnimation(initial, rotate));
    }
    rotateRight(node) {
        let _root = cloneTree(this.root);
        let initial = new _Animation(Timing.linear,
            () => {}, 0,
            () => {
                this.canvas.clear();
                drawTree(_root, TreeAnims.Binary.nodeSize, this.canvas.layer0);
            });

        let left = node.left;
        this.replaceNode(node, left);
        node.linkLeft(left.right);
        left.linkRight(node);

        let rotate = TreeAnims.Binary(this.canvas).updatePositions(this.root);
        this.animQueue.push(new CompositeAnimation(initial, rotate));
    }
    getMin(node) {
        while (node.left != this.leaf) {
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).moveCursor(this.root, node, node.left));
            node = node.left;
        }
        this.animQueue.push(
            TreeAnims.Binary(this.canvas).select(this.root, 'yellow', node));
        return node;
    }
    delete(key) {
        let forRemove = this.leaf;
        let tmp = this.root;

        while (tmp != this.leaf) {
            if (tmp.key === key) {
                forRemove = tmp;
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).select(this.root, 'yellow', forRemove));
                break;
            }

            if (tmp.key > key) {
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, tmp, tmp.left));
                tmp = tmp.left;
            } else {
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).moveCursor(this.root, tmp, tmp.right));
                tmp = tmp.right;
            }
        }

        if (forRemove == this.leaf) return;     // Avoid crashing when the key is not in the tree.

        let minRight = forRemove;
        let minRightColor = minRight.color;
        let newMinRight;

        if (forRemove.left == this.leaf) {
            newMinRight = forRemove.right;
            if (!forRemove.right.isLeaf) {
                this.animQueue.push(
                    TreeAnims.Binary(this.canvas).select(this.root, 'yellow', forRemove.right));
            }
            this.replaceNode(forRemove, forRemove.right);
        }
        else if (forRemove.right == this.leaf) {
            newMinRight = forRemove.left;
            this.animQueue.push(
                TreeAnims.Binary(this.canvas).select(this.root, 'yellow', forRemove.left));
            this.replaceNode(forRemove, forRemove.left);
        }
        else {
            minRight = this.getMin(forRemove.right);
            minRightColor = minRight.color;
            newMinRight = minRight.right;

            if (minRight.parent === forRemove) {
                newMinRight.parent = minRight;
            }
            else {
                this.replaceNode(minRight, minRight.right);
                minRight.right = forRemove.right;
                minRight.right.parent = minRight;
            }

            this.replaceNode(forRemove, minRight);
            minRight.left = forRemove.left;
            minRight.left.parent = minRight;
            minRight.color = forRemove.color;
        }

        this.animQueue.push(
            TreeAnims.Binary(this.canvas).dropNode(this.root, forRemove));

        this.animQueue.push(
            TreeAnims.Binary(this.canvas).updatePositions(this.root));

        if (minRightColor == 'black') {
            this.balanceDelete(newMinRight);
        }
    }
    balanceDelete(node) {
        while (node != this.root && node.color == 'black') {
            console.log(node);

            if (node == node.parent.left) {
                let brother = node.parent.right;

                if (brother.color == 'red') {
                    brother.color = 'black';
                    node.parent.color = 'red';
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, node.parent));
                    this.rotateLeft(node.parent);
                    brother = node.parent.right;
                }

                if (
                    brother.left.color == 'black' &&
                    brother.right.color == 'black'
                ) {
                    brother.color = 'red';
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother));
                    node = node.parent;
                } else {
                    if (brother.right.color == 'black') {
                        brother.left.color = 'black';
                        brother.color = 'red';
                        this.animQueue.push(
                            TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, brother.left));
                        this.rotateRight(brother);

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
            } else {
                let brother = node.parent.left
                if (brother.color == 'red') {
                    brother.color = 'black';
                    node.parent.color = 'red';
                    this.animQueue.push(
                        TreeAnims.Binary(this.canvas).select(this.root, 'cyan', brother, node.parent));
                    this.rotateRight(node.parent);
                    brother = node.parent.left;
                }

                if (
                    brother.left.color == 'black' &&
                    brother.right.color == 'black'
                ) {
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

                        // For some reason, brother becomes node's parent after the rotation,
                        // so I had to manually reset node's parent.
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