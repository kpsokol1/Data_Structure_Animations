let VisualBHeap = (() => { // Private scope

const MAX_DEGREE = 5;
const MARGIN_TOP = 20;
const MARGIN_LEFT = 20;
const SCREEN_WIDTH = 1000;
const SCREEN_HEIGHT = 500;
VisualBHeap.prototype.NODE_RADIUS = 14;
const DIFF_X = (SCREEN_WIDTH - 2 * MARGIN_LEFT) / (2 ** (MAX_DEGREE) - 1);
const DIFF_Y = (SCREEN_HEIGHT- 2 * MARGIN_TOP) / (MAX_DEGREE + 1);

function VisualBHeap(canvas) {
    this.canvas = canvas;

    this.canvas.getContext('2d').scale 
    (
        this.canvas.width / SCREEN_WIDTH,
        this.canvas.height / SCREEN_HEIGHT
    );
}

Object.setPrototypeOf(
    VisualBHeap.prototype,
    VisualTree.prototype,
)

function getChildPos(tree, index) {
    return {
        x: tree.x - DIFF_X * Math.floor(2 ** (tree.degree - index - 1) / 2),
        y: tree.y + DIFF_Y,
    }
}

VisualBHeap.prototype.drawSubTree = function (tree) {
    let ctx = this.canvas.getContext('2d');

    if (!tree) return;

    for (let cur = tree.child; cur; cur = cur.sibling) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(tree.x, tree.y);
        ctx.lineTo(cur.x, cur.y);
        ctx.stroke();
        this.drawSubTree(cur);
    }

    this.drawNode(tree);
}

VisualBHeap.prototype.drawTree = function (head) {
    this.fixTree(head);
    for (let cur = head; cur; cur = cur.sibling) {
        this.drawSubTree(cur);
    }
}

VisualBHeap.prototype.fixTree = function (head) {
    let i = 0;
    let x = MARGIN_LEFT;
    for (let cur = head; cur; cur = cur.sibling) {
        x += DIFF_X * (2 ** (cur.degree > 1 ? cur.degree - 1 : 0));
        cur.x = x;
        cur.y = MARGIN_TOP;
        fixSubTree(cur);

        ++i;
    }
}

function fixSubTree(tree) {
    if (!tree) return;

    let i = 0; 
    for (let cur = tree.child; cur; cur = cur.sibling) {
        let pos = getChildPos(tree, i);
        cur.x = pos.x
        cur.y = pos.y
        fixSubTree(cur);
        
        ++i;
    } 
}

VisualBHeap.prototype.cloneNode = function (node) {
    if (!node) return null;

    return {
        key: node.key,
        degree: node.degree,
        x: node.x,
        y: node.y
    }
}

VisualBHeap.prototype.cloneTree = function (root) {
    if (!root) return null;

    let _root = this.cloneNode(root);

    _root.child = this.cloneTree(root.child);
    if (_root.child) {
        _root.child.parent = _root;
    }

    _root.sibling = this.cloneTree(root.sibling);

    return _root;
}

return VisualBHeap;

})();