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
}

/**
 * creates a binomial heap
 * @constructor
 */
function BinomialHeap () {
    this.head = undefined;
    this.nodeCount = 0;
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
function mergeHeaps (a, b) {
    if (typeof a.head === 'undefined') return b.head;
    if (typeof b.head === 'undefined') return a.head;

    var head;
    var an = a.head;
    var bn = b.head;

    if (a.head.degree <= b.head.degree) {
        head = a.head;
        an = an.sibling;
    } else {
        head = b.head;
        bn = bn.sibling;
    }

    var tail = head;

    while (an && bn) {
        if (an.degree <= bn.degree) {
            tail.sibling = an;
            an = an.sibling;
        } else {
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
function linkTrees (tree, other) {
    other.parent = tree;
    other.sibling = tree.child;
    tree.child = other;
    tree.degree++;
}

/**
 * compares two nodes
 * @param {_Node} a first key to compare
 * @param {_Node} b second key to compare
 * @return {int} -1 (a < b), 0 (a == b), 1 (a > b)
 */
BinomialHeap.prototype.compare = function (a, b) {
    if (a.key > b.key) return 1;
    if (a.key < b.key) return -1;
    return 0;
}

/**
 * joins other heap to this one
 * @param {BinomialHeap} heap the other heap
 */
BinomialHeap.prototype.union = function (heap) {
    this.nodeCount += heap.nodeCount;
    var newhead = mergeHeaps(this, heap);

    this.head = undefined;
    heap.head = undefined;

    if (!newhead) return undefined;
    
    var prev;
    var cur = newhead;
    var next = newhead.sibling;

    while (next) {
        if (cur.degree !== next.degree || next.sibling && next.sibling.degree === cur.degree) {
            prev = cur;
            cur = next;
        } else if (this.compare(cur, next) < 0) {
            cur.sibling = next.sibling;
            linkTrees(cur, next);
        } else {
            if (typeof prev === 'undefined') {
                newhead = next;
            } else {
                prev.sibling = next;
            }

            linkTrees(next, cur);
            cur = next;
        }
        next = cur.sibling;
    }
    this.head = newhead;
}

/**
 * inserts a new key into the heap
 * @param {int} key 
 * @return {_Node} new node added
 */
BinomialHeap.prototype.insert = function (key) {
    var temp = new BinomialHeap();
    var newnode = new _Node(key);
    temp.head = newnode;
    temp.nodeCount++;
    this.union(temp);
    if (this.head === undefined) console.log("problem\n");
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

    while (next) {
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
function removeTreeRoot (heap, root, prev) {
    // remove root
    if (root === heap.head) heap.head = root.sibling;
    else prev.sibling = root.sibling;

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
    var newheap = new BinomialHeap();
    newheap.head = newhead;
    heap.union(newheap);
}

/**
 * extracts and returns the minimum node from the heap
 * @return {_Node} the heap's minimum node or undefined if empty
 */
BinomialHeap.prototype.extractMin = function () {
    if (!this.head) return undefined;

    var min = this.head;
    var minprev;
    var next = min.sibling;
    var nextprev = min;

    while (next) {
        if (this.compare(next, min) < 0) {
            min = next;
            minprev = nextprev;
        }
        nextprev = next;
        next = next.sibling;
    }
    removeTreeRoot(this, min, minPrev);
    this.nodeCount--;

    return min;
}

function printTree (head) {
    while (head) {
        document.body.append(head.key + " ");
        printTree(head.child);
        head = head.sibling;
    }
}

function printHeap (head) {
    while (head) {
        document.body.append(head.key + " ");
        printTree(head.child);
        head = head.sibling;
        document.body.append(" | ");
    }
}

var heap = new BinomialHeap();

function insertKey(key) {
    document.body.append(document.createElement("br"));
    heap.insert(key);
    printHeap(heap.head);
}

