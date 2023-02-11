var BinomialHeap = (() => {
/**
 * creates a new node
 * @constructor
 * @param {int} key key value of new node
 */
function _Node (key) {
    this.key = key;
    this.degree = 0;
    this.parent = undefined;
    this.child = undefined;
    this.sibling = undefined;
    this.color = 'orange';

    this.type = 'Binomial';
}

/**
 * creates a binomial heap
 * @constructor
 */
function BinomialHeap (controller) {
    this.head = undefined;
    this.nodeCount = 0;

    this.animQueue = [];
    this.controller = controller;
    this.canvas = controller.canvas;
    this.layer0 = this.canvas.layer0;
    this.layer1 = this.canvas.layer1;
    this.layer2 = this.canvas.layer2;
}

/**
 * @return {boolean} whether the heap is empty
 */
BinomialHeap.prototype.isEmpty = function () {
    return !this.head;
}

/**
 * @returns {int} size of the heap
 */
BinomialHeap.prototype.size = function () {
    return this.nodeCount;
}

/**
 * Merges two heaps together
 * @param {_Node} a head of first heap to merge
 * @param {_Node} b head of second heap to merge
 * @return {Node} head of the merged heap
 */
BinomialHeap.prototype.mergeHeaps = function (a, b) {
    if (typeof a.head === 'undefined') return b.head;
    if (typeof b.head === 'undefined') return a.head;

    var head;
    // iterators for the two heaps
    var an = a.head;
    var bn = b.head;

    if (a.head.degree <= b.head.degree) { // merge heaps
        head = a.head;
        an = an.sibling;
    } else {
        if (an.x < bn.x) {
            this.animQueue.push(
                TreeAnims.Binomial(this.canvas).mergeLeft(a.head, a.head, b.head)
            );
        }
        head = b.head;
        bn = bn.sibling;
    }

    var tail = head;

    while (an && bn) { // search through heaps and set pointers to new siblings
        if (an.degree <= bn.degree) {
            tail.sibling = an;
            an = an.sibling;
        } else {
            if (an.x < bn.x) {
                this.animQueue.push(
                    TreeAnims.Binomial(this.canvas).mergeLeft(head, an, bn)
                );
            }

            tail.sibling = bn;
            bn = bn.sibling;
        }
        tail = tail.sibling;
    }

    if (an) tail.sibling = an;
    else tail.sibling = bn;

    return head;
}

/**
 * link two trees of same order
 * @param {_Node} tree 
 * @param {_Node} other 
 */
BinomialHeap.prototype.linkTrees = function (tree, other) {
    TreeAnims.Binomial(this.canvas).fixSubTree(other);
    TreeAnims.Binomial(this.canvas).fixSubTree(tree);

    tree.degree++; // increase degree of tree to be combined
    this.animQueue.push(
        TreeAnims.Binomial(this.canvas).link(this.head, tree, other));
    
    // set one tree as a child of the other
    other.parent = tree;
    other.sibling = tree.child;
    tree.child = other;
}

/**
 * compares two nodes
 * @param {_Node} a first key to compare
 * @param {_Node} b second key to compare
 * @return {int} -1 (a < b), 0 (a == b), 1 (a > b)
 */
BinomialHeap.prototype.compare = function (a, b) {
    if (parseFloat(a.key) > parseFloat(b.key)) return 1;
    if (parseFloat(a.key) < parseFloat(b.key)) return -1;
    return 0;
}

/**
 * joins other heap to this one
 * @param {BinomialHeap} heap the other heap
 */
BinomialHeap.prototype.union = function (heap) {
    this.nodeCount += heap.nodeCount; // add nodeCounts together
    var newhead = this.mergeHeaps(this, heap);

    this.head = newhead;
    heap.head = undefined;

    if (!newhead) return undefined;
    
    var prev;
    var cur = newhead;
    var next = newhead.sibling;

    while (next) { // go through tree and link trees when necessary
        if (cur.degree !== next.degree || next.sibling && next.sibling.degree === cur.degree) {
            prev = cur;
            cur = next;
        } else if (this.compare(cur, next) < 0) {
            cur.sibling = next.sibling;
            this.linkTrees(cur, next);
        } else {
            if (typeof prev === 'undefined') {
                newhead = next;
                this.head = next;
            } else {
                prev.sibling = next;
            }

            this.linkTrees(next, cur);
            cur = next;
        }
        next = cur.sibling;
        TreeAnims.Binomial(this.canvas).fixTree(this.head);
    }
    this.head = newhead;
}

/**
 * inserts a new key into the heap
 * @param {int} key 
 * @return {_Node} new node added
 */
BinomialHeap.prototype.insert = function (key) {
    var temp = new BinomialHeap(this.controller);
    var newnode = new _Node(key);

    this.animQueue.push(
        TreeAnims.Binomial(this.canvas).insert(this.head, newnode));

    // make new node and run union algorithm to fix trees
    temp.head = newnode;
    temp.nodeCount++;

    this.union(temp);

    TreeAnims.Binomial(this.canvas).fixTree(this.head);

    return newnode;
}

/**
 * returns minimum value node from heap
 * @return {_Node} the minimum node, or undefined if empty
 */
BinomialHeap.prototype.findMin = function () {
    if (typeof this.head === 'undefined') return undefined;

    var min = this.head;
    var next = min.sibling;

    while (next) { // iterate through heap and keep track of min key value
        if (this.compare(next, min) < 0) min = next;
        next = next.sibling;
    }

    return min;
}

/**
 * removes root of tree and reverses order of children and makes new heap
 * @param {BinomialHeap} heap current heap
 * @param {_Node} root node to remove
 * @param {_Node} prev node to replace it with
 */
BinomialHeap.prototype.removeTreeRoot = function (heap, root, prev) {
    // remove root
    if (root === heap.head) heap.head = root.sibling;
    else if (prev) prev.sibling = root.sibling;

    // reverse order of root's children and make new heap
    var newhead;
    var child = root.child;
    while (child) {
        var next = child.sibling;
        child.sibling = newhead;
        child.parent = undefined;
        newhead = child;
        child = next;
    }

    let _heap = cloneTree(heap.head);
    let _root = cloneNode(root);
    let _newHead = cloneTree(newhead);
    let y0 = root.y
    let M = this.canvas.layer0.getTransform();
    let dy = (this.canvas.height / M.m22 - 50 - y0);
    let bounce = new _Animation(Timing.makeEaseOut(Timing.bounce),
        (t) => {
            clearCanvas(this.canvas.layer1);
            _root.y = y0 + dy * t;
            drawNode(_root, TreeAnims.Binomial.NODE_RADIUS, this.canvas.layer1);
        }, () => {return this.canvas.animInterval() * dy / 100},
        () => {
            this.canvas.clear();
            drawTree(_heap, TreeAnims.Binomial.NODE_RADIUS, this.canvas.layer0);
            drawTree(_newHead, TreeAnims.Binomial.NODE_RADIUS, this.canvas.layer0);
        });
    
    let fall = new _Animation(Timing.quad,
        (t) => {
            clearCanvas(this.canvas.layer1);
            _root.y = (y0 + dy) + t * (50 + TreeAnims.Binomial.NODE_RADIUS);
            drawNode(_root, TreeAnims.Binomial.NODE_RADIUS, this.canvas.layer1);
        }, () => {return this.canvas.animInterval() / 4},
        () => {
            this.canvas.clear();
            drawTree(_heap, TreeAnims.Binomial.NODE_RADIUS, this.canvas.layer0);
            drawTree(_newHead, TreeAnims.Binomial.NODE_RADIUS, this.canvas.layer0);
        });

    this.animQueue.push(
        new CompositeAnimation(bounce, fall));

    this.animQueue.push(
        TreeAnims.Binomial(this.canvas).mergeUp(heap.head, newhead));

    let init = cloneTree(newhead);
    TreeAnims.Binomial(this.canvas).fixTree(newhead, prev?.x);
    let dest = cloneTree(newhead);

    let max_dx = 0;
    let max_dy = 0;
    
    let visit = (a, b) => {
        if (!a) return;

        let dx = b.x - a.x;
        let dy = b.y - a.y;

        max_dx = dx > max_dx ? dx : max_dx;
        max_dy = dy > max_dy ? dy : max_dy;

        visit(a.sibling, b.sibling);
    }

    visit(init, dest);

    let head = cloneTree(heap.head);
    let interpolate = interpolateTrees(init, dest, TreeAnims.Binomial.NODE_RADIUS, this.layer1);

    let duration = () => {
        return this.canvas.animInterval() * distance(0, 0, max_dx, max_dy) / 100;
    }

    this.animQueue.push(new _Animation(Timing.linear, 
        (t) => {
            clearCanvas(this.canvas.layer1);
            interpolate(t);
        }, duration,
        () => {
            this.canvas.clear();
            drawTree(head, TreeAnims.Binomial.NODE_RADIUS, this.layer0);
        }));

    var newheap = new BinomialHeap(this.controller);
    newheap.head = newhead;
    heap.union(newheap);
}

/**
 * extracts and returns the minimum node from the heap
 * @return {_Node} the heap's minimum node or undefined if empty
 */
BinomialHeap.prototype.extractMin = function () {
    if (!this.head) return undefined; // if heap is empty

    var min = this.head;
    var minprev;
    var next = min.sibling;
    var nextprev = min;

    while (next) { // find min and keep track of nearby nodes
        if (this.compare(next, min) < 0) {
            min = next;
            minprev = nextprev;
        }
        nextprev = next;
        next = next.sibling;
    }
    // remove the found min value
    this.removeTreeRoot(this, min, minprev);
    this.nodeCount--;

    return min;
}

/**
 * decreases the key of the current node
 * @param {_Node} node 
 * @param {int} key 
 */
BinomialHeap.prototype.decreaseKey = function (node, key) {
    node.key = key;
    var cur = node;
    var par = cur.parent;

    let _select = select(this.layer1, TreeAnims.Binomial.NODE_RADIUS, 'cyan', node);
    let head = cloneTree(this.head);

    this.animQueue.push(
        new _Animation(Timing.linear, 
            (t) => {
                clearCanvas(this.layer1);
                _select(t);
            }, this.canvas.animInterval,
            () => {
                this.canvas.clear();
                drawTree(head, TreeAnims.Binomial.NODE_RADIUS, this.layer0);
            }));
    
    while (par && this.compare(cur, par) < 0) {
        this.animQueue.push(
            TreeAnims.Binomial(this.canvas).swap(this.head, cur, par));
        
        // move node up until it is in the correct place for its new key
        var temp = cur.key;
        cur.key = par.key;
        par.key = temp;
        cur = par;
        par = par.parent;
    }
}

/**
 * searches for node with key value
 * @param {_Node} head 
 * @param {int} key 
 * @return {_Node} the found node if found, otherwise undefined
 */
function find (head, key) {
    while (head) { // search through heap and checks if key is found
        if (head.key == key) return head;
        var found = find(head.child, key);
        if (found) return found;
        head = head.sibling;
    }
    return undefined;
}

BinomialHeap.prototype.find = function (key) {
    return this.recursiveFind(this.head, key);
}

BinomialHeap.prototype.recursiveFind = function (head, key) {
    while (head) {
        if (head.key == key) return head;

        if (head.key < key && head.child) {
            this.animQueue.push(
                TreeAnims.Binomial(this.canvas).moveCursor(this.head, head, head.child));
            var found = this.recursiveFind(head.child, key);
            if (found) return found;
        }

        this.animQueue.push(
            TreeAnims.Binomial(this.canvas).moveCursor(this.head, head, head.sibling));
        
        head = head.sibling;
    }

    return undefined;
}

/**
 * searches for key and deletes it if found
 * @param {int} key 
 * @return {boolean} whether the key is actually deleted
 */
BinomialHeap.prototype.delete = function (key) {
    var found = this.find(key); // find key value and store node
    if (!found) return false;

    this.decreaseKey(found, Number.NEGATIVE_INFINITY); // makes node have unique minimum key of -inf
    this.extractMin(); // remove it

    TreeAnims.Binomial(this.canvas).fixTree(this.head);

    let head = cloneTree(this.head);

    this.animQueue.push(
        new _Animation(Timing.linear, 
            () => {}, 
            this.canvas.animInterval,
            () => {
                this.canvas.clear();
                drawTree(head, TreeAnims.Binomial.NODE_RADIUS, this.layer0);
            }));

    this.nodeCount--;
    return true;
}

/**
 * prints the values of the keys of a tree - for testing purposes
 * @param {_Node} head 
 */
function printTree (head) {
    while (head) { // recursively runs through tree and prints key values
        document.body.append(head.key + " ");
        printTree(head.child);
        head = head.sibling;
    }
}

/**
 * prints the trees of a heap, with a '|' to separate them - for testing purposes
 * @param {_Node} head 
 */
function printHeap (head) {
    while (head) { // runs through heads of each tree in the heap and prints them
        document.body.append(head.key + " ");
        printTree(head.child);
        head = head.sibling;
        document.body.append(" | ");
    }
}

/**
 * print statement format details:
 * 
 * trees can be size 1, 2, 4, 8, etc.
 * trees of size 4+ are grouped into sets of 4
 * those sets look like this:
 *                   1
 *                 2 4
 *                 3
 * they will show up in the output as:
 *             1 2 3 4 |
 * so, trees of size 8 would be two sets of 4:
 *                     1
 *                 2 6 8
 *               3 5 7
 *               4
 * and output as 
 *            1 2 3 4 5 6 7 8 |
 * so, a group of seven total items would look like this:
 *              1  2    4
 *                 3  5 7
 *                    6
 * and ouput as
 *           1 | 2 3 | 4 5 6 7 |
 */
/*
var heap = new BinomialHeap();
// random numbers to use for testing
// DELETE LATER!
heap.insert(1);
heap.insert(48);
heap.insert(5);
heap.insert(34);
heap.insert(20);
heap.insert(56);
heap.insert(17);
*/

/**
 * inserts a key from user input
 * @param {int} key 
 */
function insertKey(key) {
    document.body.append(document.createElement("br"));
    heap.insert(key);
    printHeap(heap.head);
}

/**
 * searches for and deletes a key from user input
 * @param {int} key 
 */
function deleteKey(key) {
    document.body.append(document.createElement("br"));
    var found = heap.delete(key);
    if (found) printHeap(heap.head);
    else document.body.append("key not found");
}

/**
 * searches for a key from user input
 * @param {int} key 
 */
function findKey(key) {
    document.body.append(document.createElement("br"));
    var found = find(heap.head, key);
    if (found) document.body.append(true);
    else document.body.append(false);
}

return BinomialHeap;

})();