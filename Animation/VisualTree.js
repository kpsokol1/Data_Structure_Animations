/**
 * @author Sungmin Kim
 */

let VisualTree = (() => {

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
 * @TODO Derive subclass for Binomial Heap.
 */
function VisualTree(canvas) {
    this.root = null;
    this.canvas = canvas;
    this.animQueue = [];

    this.canvas.getContext('2d').scale 
    (
        this.canvas.width / SCREEN_WIDTH,
        this.canvas.height / SCREEN_HEIGHT
    );
}


/**
 * Get the heap index of the left child 
 * @see VisualTree.this.getPos
*/
function leftNdx(index) {
    return index * 2 + 1;
}
/**Get the heap index of the right child */
function rightNdx(index) {
    return index * 2 + 2;
}
/**Get the heap index of the parent */
function parentNdx(index) {
    return Math.floor((index - 1)/2);
}

/**Clone the node and all of its children. */
VisualTree.prototype.cloneTree = function (root) {
    if (!root) return null;

    let _root = this.cloneNode(root);

    if (root.left)  {
        _root.left = this.cloneTree(root.left);
        _root.left.parent = _root;
    }
    if (root.right) {
        _root.right = this.cloneTree(root.right);
        _root.right.parent = _root;
    }
    return _root;
}

/**Clone the individual node only */
VisualTree.prototype.cloneNode = function (node) {
    if (!node) return null;

    return {
        key: node.key,
        color: node.color,
        index: node.index,
        x: node.x,
        y: node.y
    }
};

const NODE_RADIUS = 20;

/**Draw the individual node */
VisualTree.prototype.drawNode = function (node) {
    let ctx = this.canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2, true);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black'
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS/2, 0, Math.PI * 2, true);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(node.key, node.x, node.y, 40);
};

/**Draw a highlighted outline around the node */
VisualTree.prototype.drawCursor = function (x, y, weight) {
    let ctx = this.canvas.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 1 * weight;
    ctx.arc(x, y, 20, 0, Math.PI * 2, true);
    ctx.stroke();
};

/**Draw the node and all of its children */
VisualTree.prototype.drawTree = function (root) {
    let ctx = this.canvas.getContext('2d');

    if (root.left) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(root.x, root.y);
        ctx.lineTo(root.left.x, root.left.y);
        ctx.stroke();
        this.drawTree(root.left);
    }
    if (root.right) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(root.x, root.y);
        ctx.lineTo(root.right.x, root.right.y);
        ctx.stroke();
        this.drawTree(root.right);
    }
    this.drawNode(root);
};

const MARGIN_TOP = 30;
const MARGIN_LEFT = 50;
const MAX_ROWS = 8;
const SCREEN_HEIGHT = 500;
const SCREEN_WIDTH = 1000;
const DIFF_Y = SCREEN_HEIGHT / MAX_ROWS;
const DIFF_X = SCREEN_WIDTH - MARGIN_LEFT * 2;

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
    let depth = Math.floor(Math.log2(index + 1));
    let offset = index - ((2 ** depth) - 1) + 1;

    return {
        x: DIFF_X / ((2 ** depth) + 1) * offset + MARGIN_LEFT,
        y: DIFF_Y * depth + MARGIN_TOP,
    }
}

VisualTree.prototype.clearCanvas = function () {
    let ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

/**
 * Generates an Animation that illustrates a new node being attached to the tree.
 * 
 * @param {VisualNode} node - The node being inserted.
 * @returns {_Animation} An animation.
 */
VisualTree.prototype.binaryInsert = function (tree, node) {
    if (!tree) {
        node.index = 0;
        node.x = this.getPos(0).x;
        node.y = this.getPos(0).y;
        return this.select(node);
    }

    let _parent = this.cloneNode(node.parent);

    if (node.key < _parent.key) {
        _parent.left = node;
        node.index = leftNdx(_parent.index);
    } else {
        _parent.right = node;
        node.index = rightNdx(_parent.index);
    }
    let a = this.getPos(_parent.index);
    let b = this.getPos(node.index);

    node.x = b.x;
    node.y = b.y;

    let _node = this.cloneNode(node);
    let _root = this.cloneTree(tree);

    let d = Math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2);
    let duration = () => { return animInterval() * d / 200; };

    let draw = (progress) => {
        _node.x = a.x + (b.x - a.x) * progress;
        _node.y = a.y + (b.y - a.y) * progress;
        this.clearCanvas();
        this.drawTree(_root);
        this.drawCursor(_node.x, _node.y, 3);
    };
    let after = () => {
        this.clearCanvas();
        this.drawTree(_root);
        this.drawTree(_parent);
    };
    let before = () =>{};

    let initial = this.select(tree, node.parent);
    let push = new _Animation(Timing.linear, draw, duration, before, after);

    return new CompositeAnimation(initial, push);
}

/**
 * Generate an animation that highlights the specified nodes.
 * 
 * @param  {...VisualNode} nodes - The list of selected nodes.
 * @returns {_Animation} An animation that highlights each node.
 */
VisualTree.prototype.select = function(tree, ...nodes) {
    let root = tree ? this.cloneTree(tree) : this.cloneNode(nodes[0]);

    nodes = nodes.map(node => this.cloneNode(node));

    let before = () => {}

    let draw = (progress) => {
        this.clearCanvas();
        this.drawTree(root);
        // highlight the nodes
        let weight = 3 + 2 * Math.sin(progress * 6 * Math.PI);
        nodes.forEach(node => this.drawCursor(node.x, node.y, weight));
    }

    let after = () => {}

    return new _Animation(Timing.linear, draw, animInterval, before, after);
}

VisualTree.prototype.moveCursor = function(tree, nodeA, nodeB) {
    let root = this.cloneTree(tree);

    let a = nodeA ? this.cloneNode(nodeA) : this.cloneNode(nodeB);
    let b = nodeB ? this.cloneNode(nodeB) : this.cloneNode(nodeA);

    let d = Math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2);

    let duration = () => { return animInterval() * d / 200; };
    
    let draw = (progress) => {
        this.clearCanvas();
        this.drawTree(root);

        let x = a.x + (b.x - a.x) * progress;
        let y = a.y + (b.y - a.y) * progress;
        this.drawCursor(x, y, 3);
    }

    let select = this.select(tree, nodeA);
    let move = new _Animation(Timing.linear, draw, duration);

    return new CompositeAnimation(select, move);
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
VisualTree.prototype.updatePositions = function (tree) {
    reIndex(tree);

    let root = this.cloneTree(tree);
    let nodes = flatten(root);

    let update = (node) => {
        if (!node) return;
        node.x = this.getPos(node.index).x;
        node.y = this.getPos(node.index).y;
        update(node.left);
        update(node.right);
    }
    update(tree);
    
    nodes.forEach(node => {
        node.oldX = node.x;
        node.oldY = node.y;
    });

    let draw = (progress) => {
        this.clearCanvas();
        nodes.forEach(node => {
            node.x = node.oldX + (this.getPos(node.index).x - node.oldX) * progress;
            node.y = node.oldY + (this.getPos(node.index).y - node.oldY) * progress;
        });
        this.drawTree(root);
    }

    return new _Animation(Timing.linear, draw, animInterval);
}

/**
 * Draw the entire tree.
 * 
 * Prefer "let root = this.root.cloneTree(); root.drawTree(this.canvas);" for animations.
 */
VisualTree.prototype.render = function () {
    this.drawTree(this.root);
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

return VisualTree;

})();


