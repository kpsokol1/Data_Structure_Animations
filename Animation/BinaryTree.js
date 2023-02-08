function BinaryTree(controller) {
    this.root = null;

    this.controller = controller;
    this.canvas = controller.canvas;
    this.animQueue = [];
}

BinaryTree.prototype.insert = function (key) {
    let node = {key: key, type: 'Binary'};

    if (!this.root) {

        this.animQueue.push
        (TreeAnims.Binary(this.canvas).insert(this.root, node));

        this.root = node;
        return;
    }

    let cur = this.root;

    while (cur) {
        node.parent = cur;
        if (key < cur.key) {
            if (cur.left) {
                this.animQueue.push
                (TreeAnims.Binary(this.canvas).moveCursor(this.root, cur, cur.left));
            } else {
                this.animQueue.push
                (TreeAnims.Binary(this.canvas).insert(this.root, node));
                cur.left = node;
                break;
            }
            cur = cur.left;
        } else {
            if (cur.right) {
                this.animQueue.push
                (TreeAnims.Binary(this.canvas).moveCursor(this.root, cur, cur.right));
            } else {
                this.animQueue.push
                (TreeAnims.Binary(this.canvas).insert(this.root, node));
                cur.right = node;
                break;
            }
            cur = cur.right;
        }
    }
}

BinaryTree.prototype.rotateRight = function (pivot) {
    let initial = TreeAnims.Binary(this.canvas).select(this.root, 'magenta', pivot);

    let left = pivot.left;

    // relink the nodes
    pivot.left = left.right;
    if (left.right != null) {
        left.right.parent = pivot;
    }
    left.parent = pivot.parent;
    if (pivot.parent == null) {
        this.root = left;
    } else if (pivot == pivot.parent.right) {
        pivot.parent.right = left;
    } else {
        pivot.parent.left = left;
    }
    left.right = pivot;
    pivot.parent = left;

    let rotate = TreeAnims.Binary(this.canvas).updatePositions(this.root);

    this.animQueue.push(new CompositeAnimation(initial, rotate));
}

BinaryTree.prototype.rotateLeft = function (pivot) {
    let initial = TreeAnims.Binary(this.canvas).select(this.root, 'magenta', pivot);

    let right = pivot.right;

    // relink the nodes
    pivot.right = right.left;
    if (right.left != null) {
        right.left.parent = pivot;
    }
    right.parent = pivot.parent;
    if (pivot.parent == null) {
        this.root = right;
    } else if (pivot == pivot.parent.left) {
        pivot.parent.left = right;
    } else {
        pivot.parent.right = right;
    }
    right.left = pivot;
    pivot.parent = right;

    let rotate = TreeAnims.Binary(this.canvas).updatePositions(this.root);

    this.animQueue.push(new CompositeAnimation(initial, rotate));
}