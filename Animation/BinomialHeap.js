
function BinomialNode(key) {  
    VisualNode.call(this, key); 
    this.sibling = null;
    this.child = null;
    this.rank = 0;
}
BinomialNode.prototype.constructor = BinomialNode;

Object.setPrototypeOf(
    BinomialNode.prototype,
    VisualNode.prototype
);

BinomialNode.prototype.drawTree = function (canvas) {
    let ctx = canvas.getContext('2d');

    for (let cur = this.child; cur != null; cur = cur.sibling) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(cur.x, cur.y);
        ctx.stroke();
        cur.drawTree(canvas);
    }

    this.draw(canvas);
}

function BinomialHeap(canvas) {
    this.head = null;
    this.canvas = canvas;

    this.MAX_RANK = 4;
    this.MARGIN_TOP = 30;
    this.MARGIN_LEFT = 50;
    this.DIFF_X = (this.canvas.width - 2 * this.MARGIN_LEFT) / (2 ** (this.MAX_RANK) - 1);
    this.DIFF_Y = (this.canvas.height - 2 * this.MARGIN_TOP) / (this.MAX_RANK + 1);
}



BinomialHeap.prototype.repositionChildren = function (root, child, rank) {
    if (!child) return;

    child.x = root.x - this.DIFF_X * rank; 
    child.y = root.y + this.DIFF_Y;

    this.repositionChildren(child, child.child, rank - 1);
    this.repositionChildren(root, child.sibling, rank - 1);
}

BinomialHeap.prototype.link = function (a, b) {
    a.parent = b;
    a.sibling = b.child;
    b.child = a;

    this.repositionChildren(b, a, b.rank);
    ++b.rank;
}