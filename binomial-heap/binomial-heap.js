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
    if (parseFloat(a.key) > parseFloat(b.key)) return 1;
    if (parseFloat(a.key) < parseFloat(b.key)) return -1;
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
    removeTreeRoot(this, min, minprev);
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
    
    while (par && this.compare(cur, par) < 0) {
        var temp = cur.key;
        cur.key = par.key;
        par.key = temp;
        cur = par;
        par = par.parent;
    }
}

/**
 * @param {_Node} head 
 * @param {int} key 
 * @return {_Node} the found node if found, otherwise undefined
 */
function find (head, key) {
    while (head) {
        if (head.key == key) return head;
        var found = find(head.child, key);
        if (found) return found;
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
    var found = find(this.head, key);
    if (!found) return false;

    this.decreaseKey(found, Number.NEGATIVE_INFINITY); // makes node have unique minimum key of -inf
    this.extractMin(); // remove it

    this.nodeCount--;
    return true;
}

/**
 * prints the values of the keys of a tree
 * @param {_Node} head 
 */
function printTree (head) {
    while (head) {
        document.body.append(head.key + " ");
        printTree(head.child);
        head = head.sibling;
    }
}

/**
 * prints the trees of a heap, with a '|' to separate them
 * @param {_Node} head 
 */
function printHeap (head) {
    while (head) {
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