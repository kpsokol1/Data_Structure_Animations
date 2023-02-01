function BinaryTree(visualizer) {
    this.root = null;
    this.visualizer = visualizer;
    this.animQueue = [];
}

BinaryTree.prototype.insert = function (key) {
    let node = {key: key};

    if (!this.root) {
        this.animQueue.push
        (this.visualizer.binaryInsert(this.root, node));
        this.root = node;
        return;
    }

    let cur = this.root;

    while (cur) {
        node.parent = cur;
        if (key < cur.key) {
            if (cur.left) {
                this.animQueue.push
                (this.visualizer.moveCursor(this.root, cur, cur.left));
            } else {
                this.animQueue.push
                (this.visualizer.binaryInsert(this.root, node));
                cur.left = node;
                break;
            }
            cur = cur.left;
        } else {
            if (cur.right) {
                this.animQueue.push
                (this.visualizer.moveCursor(this.root, cur, cur.right));
            } else {
                this.animQueue.push
                (this.visualizer.binaryInsert(this.root, node));
                cur.right = node;
                break;
            }
            cur = cur.right;
        }
    }
}

BinaryTree.prototype.rotateRight = function (pivot) {
    let initial = this.visualizer.select(this.root, pivot);

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

    let rotate = this.visualizer.updatePositions(this.root);

    this.animQueue.push(new CompositeAnimation(initial, rotate));
}

BinaryTree.prototype.rotateLeft = function (pivot) {
    let initial = this.visualizer.select(this.root, pivot);

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

    let rotate = this.visualizer.updatePositions(this.root);

    this.animQueue.push(new CompositeAnimation(initial, rotate));
}