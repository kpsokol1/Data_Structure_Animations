/**
 * @author Sungmin Kim
 */


/**
 * Get the heap index of the left child 
 * @see VisualTree.getPos
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
    this.color = 'red';
    this.index = 0;
    this.selected = false;

    /**Clone the node and all of its children. */
    this.cloneTree = () => {
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
    this.clone = () => {
        let node = new VisualNode(this.key);
        node.x = this.x;
        node.y = this.y;
        node.color = this.color;
        node.index = this.index;
        node.selected = this.selected;

        return node;
    }

    /**Draw the individual node */
    this.draw = (canvas) => {
        let ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2, true);
        ctx.fillStyle = this.color;
        ctx.fill();
        this.selected ? this.outline(canvas) : ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2, true);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(this.key, this.x, this.y, 40);
    }

    /**Draw a highlighted outline around the node */
    this.outline = (canvas) => {
        let ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 3;
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2, true);
        ctx.stroke();
    }

    /**Draw the node and all of its children */
    this.drawTree = (canvas) => {
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
    }
}

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

    const MAX_ROWS = 12;

    /**
     * Calculates the coordinate position of the node in question
     * based on its heap index.
     * 
     * @function
     * @memberof VisualTree
     * @param {number} index The index of the node in question.
     * @returns {{x: number, y: number}} position
     */
    let getPos = (index) => {
        const MARGIN_TOP = 30;
        const MARGIN_LEFT = 50;
        const height = canvas.height / MAX_ROWS;
        const width = canvas.width - MARGIN_LEFT * 2;

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
    let pushNode = (node) => {
        let parent = node.parent.clone();
        let _node = node.clone();
        let root = this.root.cloneTree();

        _node.key < parent.key ? 
            parent.left = _node : parent.right = _node;

        let a = getPos(parent.index);
        let b = getPos(_node.index);

        let draw = (progress) => {
            _node.x = a.x + (b.x - a.x) * progress;
            _node.y = a.y + (b.y - a.y) * progress;
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            root.drawTree(canvas);
            _node.outline(canvas);
        };
        let after = () => {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            root.drawTree(canvas);
            parent.drawTree(canvas);
        };
        let before = () =>{};

        return new _Animation(Timing.linear, draw, animInterval, before, after);
    }

    /**
     * Generate an animation that highlights the specified nodes.
     * 
     * @param  {...any} nodes - The list of selected nodes.
     * @returns {_Animation} An animation that highlights each node.
     */
    this.select = (...nodes) => {
        let root = this.root ? this.root.cloneTree() : nodes[0].clone();

        nodes = nodes.map(node => node.clone());
        nodes.forEach(node => node.selected = true);

        let before = () => {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            root.drawTree(canvas);
            // highlight the nodes
            nodes.forEach(node => node.draw(canvas));
        }
        let after = () => {
            //canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            // un-highlight the nodes
            //root.drawTree(canvas);
        }

        return new _Animation(Timing.linear, ()=>{}, animInterval, before, after);
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
    let insert = (node, child, animQueue) => {
        if (!node) {
            let pos = getPos(child.index);
            child.x = pos.x;
            child.y = pos.y;
            if (this.root) {
                animQueue.push(pushNode(child));
            } else {
                animQueue.push(this.select(child));
            }
            return child;
        }

        child.parent = node;
        animQueue.push(this.select(node));
        if (child.key < node.key) {
            child.index = leftNdx(node.index);
            child.parent = node;
            node.left = insert(node.left, child, animQueue);
        } else {
            child.index = rightNdx(node.index);
            child.parent = node;
            node.right = insert(node.right, child, animQueue);
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
    this.insert = (key) => {
        let node = new VisualNode(key);

        let animQueue = [];
        this.root = insert(this.root, node, animQueue);
        return animQueue;
    }

    /**
     * Recalculate the indices of the nodes in the subtree.
     * The indices need to be updated whenever the links between the nodes change.
     * 
     * @param {VisualNode} node - The root of the subtree.
     * @returns {undefined}
     */
    let reIndex = (node) => {
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
    let flatten = (node) => {
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
    let updatePositions = () => {
        let root = this.root.cloneTree();
        let nodes = flatten(root);

        let update = (node) => {
            if (!node) return;
            node.x = getPos(node.index).x;
            node.y = getPos(node.index).y;
            update(node.left);
            update(node.right);
        }
        update(this.root);
        
        nodes.forEach(node => {
            node.oldX = node.x;
            node.oldY = node.y;
        });

        let draw = (progress) => {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            nodes.forEach(node => {
                node.x = node.oldX + (getPos(node.index).x - node.oldX) * progress;
                node.y = node.oldY + (getPos(node.index).y - node.oldY) * progress;
            });
            root.drawTree(canvas);
        }

        return new _Animation(Timing.linear, draw, animInterval);
    }

    /**
     * Rotate the subtree rooted at the pivot to the left.
     * 
     * @param {VisualNode} pivot - The node to rotate around.
     * @returns {_Animation} An animation illustrating the rotation.
     */
    this.rotateLeft = (pivot) => {
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
        return updatePositions();
    }

    /**
     * Rotate the subtree rooted at the pivot to the right.
     * 
     * @param {VisualNode} pivot - The node to rotate around.
     * @returns {_Animation} An animation illustrating the rotation.
     */
    this.rotateRight = (pivot) => {
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
        return updatePositions();
    }

    /**
     * Draw the entire tree.
     * 
     * Prefer "let root = this.root.cloneTree(); root.drawTree(canvas);" for animations.
     */
    this.render = () => {
        this.root?.drawTree(canvas);
    }

    /**
     * Print the tree to the console for debugging.
     * 
     * @TODO Actually print useful information.
     */
    this.print = () => {
        let nodes = flatten(this.root);
        for (let node of nodes) {
            console.log(node.key, node.index);
        }
    }
}