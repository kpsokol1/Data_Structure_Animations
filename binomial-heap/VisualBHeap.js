let VisualBHeap = (() => { // Private scope
function VisualBHeap(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.ctx.scale 
    (
        this.canvas.width / this.SCREEN_WIDTH,
        this.canvas.height / this.SCREEN_HEIGHT
    );
}

Object.setPrototypeOf(
    VisualBHeap.prototype,
    VisualTree.prototype,
);

const MAX_DEGREE = 5;
VisualBHeap.prototype.MARGIN_TOP = 50;
VisualBHeap.prototype.MARGIN_LEFT = 60;

VisualBHeap.prototype.NODE_RADIUS = 13;

VisualBHeap.prototype.DIFF_X = 
    (VisualBHeap.prototype.SCREEN_WIDTH - 2 * VisualBHeap.prototype.MARGIN_LEFT) / (2 ** (MAX_DEGREE) - 1);
VisualBHeap.prototype.DIFF_Y = 
    (VisualBHeap.prototype.SCREEN_HEIGHT - 2 * VisualBHeap.prototype.MARGIN_TOP) / (MAX_DEGREE + 1);

VisualBHeap.prototype.getChildPos = function (tree, index) {
    return {
        x: tree.x - this.DIFF_X * Math.floor(2 ** (tree.degree - index - 1) / 2),
        y: tree.y + this.DIFF_Y,
    }
}

VisualBHeap.prototype.drawSubTree = function (tree) {
    if (!tree) return;

    for (let cur = tree.child; cur; cur = cur.sibling) {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.moveTo(tree.x, tree.y);
        this.ctx.lineTo(cur.x, cur.y);
        this.ctx.stroke();
        this.drawSubTree(cur);
    }

    this.drawNode(tree);
}

VisualBHeap.prototype.drawTree = function (head) {
    for (let cur = head; cur; cur = cur.sibling) {
        this.drawSubTree(cur);
    }
}

VisualBHeap.prototype.addNode = function (tree, node) {
    node.x = this.MARGIN_LEFT / 2;
    node.y = this.MARGIN_TOP;

    let _root = this.cloneTree(tree);
    let _node = this.cloneNode(node);

    if (!_root || _root.degree > 0) {
        let r_dx = this.DIFF_X;
        let n_dx = this.MARGIN_LEFT / 2 + this.DIFF_X;

        let draw = (progress) => {
            this.clearCanvas();

            this.ctx.save();
            this.ctx.translate(r_dx * progress, 0);
            this.drawTree(_root);
            this.ctx.restore();
            this.ctx.save();
            this.ctx.translate(n_dx * progress, 0);
            this.drawNode(_node);
            this.ctx.restore();
        }

        let shift = new _Animation(Timing.linear, draw, animInterval);

        return new CompositeAnimation(this.select(_root, _node), shift);
    }
    
    return this.select(_root, _node);
}

VisualBHeap.prototype.mergeUp = function (heapA, heapB) {
    let a = this.cloneTree(heapA);
    let b = this.cloneTree(heapB);

    let draw = (progress) => {
        this.clearCanvas();
        this.drawTree(a);

        this.ctx.save();
        this.ctx.translate(0, -this.DIFF_Y * progress);
        this.drawTree(b);
        this.ctx.restore();
    }

    for (let cur = heapB; cur; cur = cur.sibling) {
        cur.y = this.MARGIN_TOP;
        this.fixSubTree(cur);
    }

    return new _Animation(Timing.linear, draw, animInterval);
}

VisualBHeap.prototype.mergeLeft = function (head, left, right) {
    let h = this.cloneTree(head);
    let r = this.cloneTree(right);
    let l = this.cloneTree(left);

    

    let i = 0;
    for (let cur = head; cur; cur = cur.sibling) {
        if (Object.id(cur) == Object.id(left) ||
            Object.id(cur) == Object.id(right)) {
            break;
        }
        ++i;
    }

    let l_dx = this.treeWidth(right.degree);
    let r_dx = this.treeWidth(right.degree) + left.x - right.x - this.treeWidth(left.degree);

    let lx = left.x - this.treeWidth(left.degree);
    let rx = right.x;

    let draw = (progress) => {
        this.clearCanvas();
        
        this.fixTree(l, lx + l_dx * progress);
        this.fixSubTree(r, rx + r_dx * progress);

        let cur = h;
        for (let j = 0; j < i; ++j) {
            this.drawSubTree(cur);
            cur = cur.sibling;
        }
        this.drawTree(l);
        this.drawTree(r);
    }

    this.fixTree(left, lx + l_dx);
    this.fixSubTree(right, rx + r_dx);

    let duration = timeByDistance(0, 0, r_dx, 20);

    return new _Animation(Timing.linear, draw, duration);
}

VisualBHeap.prototype.link = function (tree, nodeA, nodeB) {
    let rootList = [];

    for (let cur = tree; cur; cur = cur.sibling) {
        if (cur != nodeA && cur != nodeB) {
            let root = this.cloneTree(cur);
            root.sibling = null;
            rootList.push(root);
        }
    }

    let a = this.cloneTree(nodeA);
    let b = this.cloneTree(nodeB);

    let a_dx = 0;

    if (a.x < b.x && b.degree > 0) {
        a_dx = b.x - a.x;
    }

    let b_dx = this.getChildPos(a, 0).x - b.x + a_dx;
    let b_dy = this.DIFF_Y;

    let draw = (progress) => {
        this.clearCanvas();

        this.ctx.beginPath();
        this.ctx.moveTo(
            b.x + b_dx * progress, 
            b.y + b_dy * progress);

        this.ctx.lineTo(a.x + a_dx * progress, a.y);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.save();
        this.ctx.translate(
            b_dx * progress, 
            b_dy * progress);
        this.drawSubTree(b);
        this.ctx.restore();

        this.ctx.save();
        this.ctx.translate(
            a_dx * progress, 0);
        this.drawSubTree(a);
        this.ctx.restore();

        rootList.forEach(root => this.drawSubTree(root));
    }

    let duration = timeByDistance(0, 0, b_dx, b_dy, 100);

    return new _Animation(Timing.linear, draw, duration);
}

VisualBHeap.prototype.treeWidth = function (degree) {
    return this.DIFF_X * (2 ** (degree > 1 ? degree - 1 : 0));
}

VisualBHeap.prototype.fixTree = function (head, pos = this.MARGIN_LEFT) {
    let x = pos;
    for (let cur = head; cur; cur = cur.sibling) {
        x += this.treeWidth(cur.degree);
        cur.x = x;
        //cur.y = this.MARGIN_TOP;
        this.fixSubTree(cur);
    }
}

VisualBHeap.prototype.fixSubTree = function (tree, pos = tree.x) {
    if (!tree) return;

    tree.x = pos;

    let i = 0; 
    for (let cur = tree.child; cur; cur = cur.sibling) {
        let pos = this.getChildPos(tree, i);
        cur.x = pos.x
        cur.y = pos.y
        this.fixSubTree(cur);
        
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

VisualBHeap.prototype.flatten = function (tree) {
    if (!tree) return [];

    let nodes = [tree];
    nodes = nodes.concat(this.flatten(tree.child));
    nodes = nodes.concat(this.flatten(tree.sibling));
    return nodes;
}

return VisualBHeap;

})();