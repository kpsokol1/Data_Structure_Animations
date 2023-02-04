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
    this.ctx = canvas.getContext('2d');

    this.ctx.scale 
    (
        this.canvas.width / this.SCREEN_WIDTH,
        this.canvas.height / this.SCREEN_HEIGHT
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

VisualTree.prototype.NODE_RADIUS = 20;

/**Draw the individual node */
VisualTree.prototype.drawNode = function (node) {
    let x = node.x + (node.offsetX ? node.offsetX : 0);
    let y = node.y + (node.offsetY ? node.offsetY : 0);

    this.ctx.beginPath();
    this.ctx.arc(x, y, this.NODE_RADIUS, 0, Math.PI * 2, true);
    this.ctx.fillStyle = node.color;
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black'
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.NODE_RADIUS * 0.6, 0, Math.PI * 2, true);
    this.ctx.fillStyle = 'white';
    this.ctx.fill();
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = 'bold 12px sans-serif';

    let text = node.key;
    if (text === Number.NEGATIVE_INFINITY)
        text = '-Inf';
    this.ctx.fillText(text, x, y, this.NODE_RADIUS * 0.8);
};

/**Draw a highlighted outline around the node */
VisualTree.prototype.drawCursor = function (x, y, weight) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'cyan';
    this.ctx.lineWidth = 1 * weight;
    this.ctx.arc(x, y, this.NODE_RADIUS, 0, Math.PI * 2, true);
    this.ctx.stroke();
};

/**Draw the node and all of its children */
VisualTree.prototype.drawTree = function (root) {
    if (root.left) {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.moveTo(root.x, root.y);
        this.ctx.lineTo(root.left.x, root.left.y);
        this.ctx.stroke();
        this.drawTree(root.left);
    }
    if (root.right) {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.moveTo(root.x, root.y);
        this.ctx.lineTo(root.right.x, root.right.y);
        this.ctx.stroke();
        this.drawTree(root.right);
    }
    this.drawNode(root);
};

VisualTree.prototype.MARGIN_TOP = 30;
VisualTree.prototype.MARGIN_LEFT = 50;
VisualTree.prototype.MAX_ROWS = 8;
VisualTree.prototype.SCREEN_HEIGHT = 500;
VisualTree.prototype.SCREEN_WIDTH = 1000;
VisualTree.prototype.DIFF_Y = 
    VisualTree.prototype.SCREEN_HEIGHT / VisualTree.prototype.MAX_ROWS;
VisualTree.prototype.DIFF_X = 
    VisualTree.prototype.SCREEN_WIDTH - VisualTree.prototype.MARGIN_LEFT * 2;

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
        x: this.DIFF_X / ((2 ** depth) + 1) * offset + this.MARGIN_LEFT,
        y: this.DIFF_Y * depth + this.MARGIN_TOP,
    }
}

VisualTree.prototype.clearCanvas = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    let root = this.cloneTree(tree);

    nodes = nodes.map(node => this.cloneNode(node));

    let draw = (progress) => {
        this.clearCanvas();
        if (root) this.drawTree(root);
        // highlight the nodes
        let weight = 3 + 2 * Math.sin(progress * 2 * Math.PI);
        nodes.forEach(node => {
            this.drawNode(node);
            this.drawCursor(node.x, node.y, weight)
        });
    }

    let duration = () => { return animInterval() / 3; };

    return new _Animation(Timing.linear, draw, duration);
}

VisualTree.prototype.moveCursor = function (tree, nodeA, nodeB) {
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

VisualTree.prototype.swap = function (tree, nodeA, nodeB) {
   let nodeList = this.flatten(tree);
   let i, j;


   for (let k = 0; k < nodeList.length; ++k) {
        if (Object.id(nodeList[k]) == Object.id(nodeA)) i = k;
        if (Object.id(nodeList[k]) == Object.id(nodeB)) j = k;
   }

   nodeList = this.flatten(this.cloneTree(tree));

   let ax = nodeA.x;
   let ay = nodeA.y;
   let bx = nodeB.x;
   let by = nodeB.y;

   let draw = (progress) => {
        nodeList[i].offsetX = (bx - ax) * progress;
        nodeList[i].offsetY = (by - ay) * progress;
        nodeList[j].offsetX = (ax - bx) * progress;
        nodeList[j].offsetY = (ay - by) * progress;

        this.clearCanvas();
        this.drawTree(nodeList[0]);
        this.drawNode(nodeList[i]);
        this.drawNode(nodeList[j]);
   }

   return new _Animation(Timing.linear, draw, animInterval);
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
VisualTree.prototype.flatten = function (tree) {
    if (!tree) return [];

    let nodes = [tree];
    nodes = nodes.concat(this.flatten(tree.left));
    nodes = nodes.concat(this.flatten(tree.right));
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
    let nodes = this.flatten(root);

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

VisualTree.prototype.render = function (tree) {
    let root = this.cloneTree(tree);

    return new _Animation(Timing.linear, () => {
        this.clearCanvas();
        this.drawTree(root);
    }, animInterval);
}

/**
 * Print the tree to the console for debugging.
 * 
 * @TODO Actually print useful information.
 */
VisualTree.prototype.print = function () {
    let nodes = this.flatten(this.root);
    for (let node of nodes) {
        console.log(node.key, node.index);
    }
}

return VisualTree;

})();


