/**
 * @author Sungmin Kim
 */


/**
 * Get the heap index of the left child 
 * @see VisualTree.this.getPos
*/
var leftNdx = (index) => {
    return index * 2 + 1;
}
/**Get the heap index of the right child */
var rightNdx = (index) => {
    return index * 2 + 2;
}
/**Get the heap index of the parent */
var parentNdx = (index) => {
    return Math.floor((index - 1)/2);
}

/**
 * Returns a VisualNode object.
 * 
 * Supports functions for drawing individual nodes
 * as well as drawing the entire subtree.
 * 
 * @param {*} key - the key of the node
 */
function VisualNode(key) {
    this.key = key;
    this.x = 0;
    this.y = 0;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.color = this.DEFAULT_COLOR;
    this.index = 0;
}

VisualNode.prototype.RADIUS = 20;
VisualNode.prototype.DEFAULT_COLOR = 'red';

/**Clone the node and all of its children. */
VisualNode.prototype.cloneTree = function () {
    let node = this.clone();

    if (this.left)  {
        node.left = this.left.cloneTree();
        node.left.parent = this;
    }
    if (this.right) {
        node.right = this.right.cloneTree();
        node.right.parent = this;
    }
    return node;
}

/**Clone the individual node only */
VisualNode.prototype.clone = function () {
    let node = new VisualNode(this.key);
    node.x = this.x;
    node.y = this.y;
    node.color = this.color;
    node.index = this.index;

    return node;
};

/**Draw the individual node */
VisualNode.prototype.draw = function (canvas) {
    let ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.RADIUS, 0, Math.PI * 2, true);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black'
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.RADIUS/2, 0, Math.PI * 2, true);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(this.key, this.x, this.y, 40);
};

/**Draw a highlighted outline around the node */
VisualNode.outline = function (canvas, x, y, weight) {
    let ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 1 * weight;
    ctx.arc(x, y, 20, 0, Math.PI * 2, true);
    ctx.stroke();
};

/**Draw the node and all of its children */
VisualNode.prototype.drawTree = function (canvas) {
    let ctx = canvas.getContext('2d');

    if (this.left) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.left.x, this.left.y);
        ctx.stroke();
        this.left.drawTree(canvas);
    }
    if (this.right) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.right.x, this.right.y);
        ctx.stroke();
        this.right.drawTree(canvas);
    }
    this.draw(canvas);
};

/**
 * Returns a VisualTree object.
 * VisualTree implements functions like insertions
 * while also generating animations for those functions.
 * 
 * The monolithic structure of this class indicates to me that
 * it would've probably been better to factor out some of the
 * functions into their own classes. However, given the scope
 * of this project, I would argue that keeping everything in
 * one place is a convenient and satisfactory solution.
 * 
 * @constructor
 * @param {HTMLCanvasElement} canvas - The canvas that the tree should be drawn onto.
 * 
 * @TODO Derive subclasses for RB-Trees and Binomial Trees.
 */
function VisualTree(canvas) {
    this.root = null;
    this.canvas = canvas;
}

VisualTree.prototype.Node = VisualNode;

/**
 * Calculates the coordinate position of the node in question
 * based on its heap index.
 * 
 * @function
 * @memberof VisualTree
 * @param {number} index The index of the node in question.
 * @returns {{x: number, y: number}} position
 */
VisualTree.prototype.getPos = function (index) {
    const MARGIN_TOP = 30;
    const MARGIN_LEFT = 50;
    const MAX_ROWS = 12;
    const height = this.canvas.height / MAX_ROWS;
    const width = this.canvas.width - MARGIN_LEFT * 2;

    let depth = Math.floor(Math.log2(index + 1));
    let offset = index - ((2 ** depth) - 1) + 1;

    return {
        x: width / ((2 ** depth) + 1) * offset + MARGIN_LEFT,
        y: height * depth + MARGIN_TOP,
    }
}

/**
 * Generates an Animation that illustrates a new node being attached to the tree.
 * 
 * @param {VisualNode} node - The node being inserted.
 * @returns {_Animation} An animation.
 */
VisualTree.prototype.pushNode = function (node) {
    let parent = node.parent.clone();
    let _node = node.clone();
    let root = this.root.cloneTree();

    _node.key < parent.key ? 
        parent.left = _node : parent.right = _node;

    let a = this.getPos(parent.index);
    let b = this.getPos(_node.index);

    let draw = (progress) => {
        _node.x = a.x + (b.x - a.x) * progress;
        _node.y = a.y + (b.y - a.y) * progress;
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
        root.drawTree(this.canvas);
        this.Node.outline(this.canvas, _node.x, _node.y, 3);
    };
    let after = () => {
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
        root.drawTree(this.canvas);
        parent.drawTree(this.canvas);
    };
    let before = () =>{};

    return new _Animation(Timing.linear, draw, animInterval, before, after);
}

/**
 * Generate an animation that highlights the specified nodes.
 * 
 * @param  {...VisualNode} nodes - The list of selected nodes.
 * @returns {_Animation} An animation that highlights each node.
 */
VisualTree.prototype.select = function(...nodes) {
    let root = this.root ? this.root.cloneTree() : nodes[0].clone();

    nodes = nodes.map(node => node.clone());

    let before = () => {}

    let draw = (progress) => {
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
        root.drawTree(this.canvas);
        // highlight the nodes
        let weight = 3 + 2 * Math.sin(progress * 6 * Math.PI);
        nodes.forEach(node => this.Node.outline(this.canvas, node.x, node.y, weight));
    }

    let after = () => {}

    return new _Animation(Timing.linear, draw, animInterval, before, after);
}

VisualTree.prototype.moveCursor = function(nodeA, nodeB) {
    let root = this.root?.cloneTree();

    let a = nodeA ? nodeA.clone() : nodeB.clone();
    let b = nodeB ? nodeB.clone() : nodeA.clone();

    let d = Math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2);

    let duration = () => { return animInterval() * d / 200; }
    
    let draw = (progress) => {
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
        root.drawTree(this.canvas);

        let x = a.x + (b.x - a.x) * progress;
        let y = a.y + (b.y - a.y) * progress;
        this.Node.outline(this.canvas, x, y, 3);
    }

    let move = new _Animation(Timing.linear, draw, duration);
    let select = this.select(b);

    return new CompositeAnimation(move, select);
}

/**
 * Insert a node into the specified subtree and emit a series
 * of animations that illustrate the insertion.
 * 
 * @param {VisualNode} node - The root of the subtree.
 * @param {VisualNode} child - The node to insert.
 * @param {_Animation[]} animQueue - The running list of animations.
 * @returns {VisualNode} The new root of the subtree.
 */
VisualTree.prototype.binaryInsert = function (node, child, animQueue) {
    if (!node) {
        let pos = this.getPos(child.index);
        child.x = pos.x;
        child.y = pos.y;

        if (this.root) {
            animQueue.push(this.pushNode(child));
        } else {
            animQueue.push(this.select(child));
        }
        return child;
    }

    child.parent = node;
    if (child.key < node.key) {
        child.index = leftNdx(node.index);
        child.parent = node;
        if (node.left) animQueue.push(this.moveCursor(node, node.left));
        node.left = this.binaryInsert(node.left, child, animQueue);
    } else {
        child.index = rightNdx(node.index);
        child.parent = node;
        if (node.right) animQueue.push(this.moveCursor(node, node.right));
        node.right = this.binaryInsert(node.right, child, animQueue);
    }
    return node;
}

/**
 * Insert a new node into the tree and emit an series of animations that
 * illustrate the insertion.
 * 
 * @param {*} key - The key of the node to insert.
 * @returns {_Animation[]} An array of animations.
 */
VisualTree.prototype.insert = function (key) {
    let node = new this.Node(key);

    let animQueue = [];
    if (this.root) animQueue.push(this.select(this.root));
    this.root = this.binaryInsert(this.root, node, animQueue);
    return animQueue;
}

/**
 * Recalculate the indices of the nodes in the subtree.
 * The indices need to be updated whenever the links between the nodes change.
 * 
 * @param {VisualNode} node - The root of the subtree.
 * @returns {undefined}
 */
function reIndex(node) {
    if (!node) return;

    if (!node.parent) {
        node.index = 0;
    } else if (node == node.parent.right) {
        node.index = rightNdx(node.parent.index);
    } else {
        node.index = leftNdx(node.parent.index);
    }

    reIndex(node.left);
    reIndex(node.right);
}

/**
 * Flatten the tree rooted at the node into an array.
 * 
 * @param {VisualNode} node - The root of the subtree to flatten.
 * @returns {VisualNode[]} An array of nodes.
 */
function flatten (node) {
    if (!node) return [];

    let nodes = [node];
    nodes = nodes.concat(flatten(node.left));
    nodes = nodes.concat(flatten(node.right));
    return nodes;
}

/**
 * Update each node's position to match its current index and
 * generate an animation illustrating the movement of each node.
 * 
 * @returns {_Animation} An animation illustrating the movement of the nodes.
 */
VisualTree.prototype.updatePositions = function () {
    let root = this.root.cloneTree();
    let nodes = flatten(root);

    let update = (node) => {
        if (!node) return;
        node.x = this.getPos(node.index).x;
        node.y = this.getPos(node.index).y;
        update(node.left);
        update(node.right);
    }
    update(this.root);
    
    nodes.forEach(node => {
        node.oldX = node.x;
        node.oldY = node.y;
    });

    let draw = (progress) => {
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
        nodes.forEach(node => {
            node.x = node.oldX + (this.getPos(node.index).x - node.oldX) * progress;
            node.y = node.oldY + (this.getPos(node.index).y - node.oldY) * progress;
        });
        root.drawTree(this.canvas);
    }

    return new _Animation(Timing.linear, draw, animInterval);
}

/**
 * Rotate the subtree rooted at the pivot to the left.
 * 
 * @param {VisualNode} pivot - The node to rotate around.
 * @returns {_Animation} An animation illustrating the rotation.
 */
VisualTree.prototype.rotateLeft = function (pivot) {
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

    // update the indices
    reIndex(right);

    // update the positions and emit the animation
    return this.updatePositions();
}

/**
 * Rotate the subtree rooted at the pivot to the right.
 * 
 * @param {VisualNode} pivot - The node to rotate around.
 * @returns {_Animation} An animation illustrating the rotation.
 */
VisualTree.prototype.rotateRight = function (pivot) {
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

    // update the indexes
    reIndex(left);

    // update the positions and emit the animation
    return this.updatePositions();
}

/**
 * Draw the entire tree.
 * 
 * Prefer "let root = this.root.cloneTree(); root.drawTree(this.canvas);" for animations.
 */
VisualTree.prototype.render = function () {
    this.root?.drawTree(this.canvas);
}

/**
 * Print the tree to the console for debugging.
 * 
 * @TODO Actually print useful information.
 */
VisualTree.prototype.print = function () {
    let nodes = flatten(this.root);
    for (let node of nodes) {
        console.log(node.key, node.index);
    }
}