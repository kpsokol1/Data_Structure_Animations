RED = 0;
BLACK = 1;
class RBTNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.left = null;
        this.right = null;
        this.color = RED;
        this.parent = null;
        this.isLeaf = (key == null && value == null);
        if (this.isLeaf) this.color = BLACK;
    }
    linkLeft(node) {
        this.left = node;
        node.parent = this;
    }
    linkRight(node) {
        this.right = node;
        node.parent = this;
    }
    isRed() {
        return this.color == RED;
    }
    isBlack() {
        return this.color == BLACK;
    }
    setRed() {
        this.color = RED;
    }
    setBlack() {
        this.color = BLACK;
    }
    getDepth() {
        let node = this;
        let depth = 0;
        while (node.parent != null) {
            node = node.parent;
            depth++;
        }
        return depth;
    }
    getLevel() {
        return this.getDepth() + 1;
    }
    getSize() {
        let node = this;
        let size = 1;
        if (node.left != null) size += node.left.getSize();
        if (node.right != null) size += node.right.getSize();
        return size;
    }
    getRank() {
        let node = this;
        let key = node.key;
        let rank = 0;
        while (node.parent != null) {
            node = node.parent;
        }
        let tree = node;
        while (tree) {
            if (key < tree.key) { // move to left subtree
                tree = tree.left;
            }
            else if (key > tree.key) {
                if (tree.left) {
                    rank += 1 + tree.left.getSize();
                    tree = tree.right;
                }
                else {
                    rank += 1;
                    tree = tree.right;
                }
            }
            else {
                if (tree.left) rank += tree.left.getSize();
                return rank;
            }
        }
        return -1;

    }
    getGrandparent() {
        if (this.parent == null) return null;
        return this.parent.parent;
    }
    getUncle() {
        if (this.parent == null || this.parent.parent == null) return null;
        if (this.parent == this.parent.parent.left) return this.parent.parent.right;
        else return this.parent.parent.left;
    }
    getSibling() {
        if (this.parent == null) return null;
        if (this == this.parent.left) return this.parent.right;
        else return this.parent.left;
    }
    getPredecessor() {
        let node = this;
        if (node.left != null) {
            node = node.left;
            while (node.right != null) node = node.right;
            return node;
        }
        while (node.parent != null && node.parent.left == node) node = node.parent;
        return node.parent;
    }
    getSuccessor() {
        let node = this;
        if (node.right != null) {
            node = node.right;
            while (node.left != null) node = node.left;
            return node;
        }
        while (node.parent != null && node.parent.right == node) node = node.parent;
        return node.parent;
    }
    getMin() {
        let node = this;
        while (node.left != null) node = node.left;
        return node;
    }
    getMax() {
        let node = this;
        while (node.right != null) node = node.right;
        return node;
    }
}
class RBTree {
    constructor() {
        this.root = null;
        this.size = 0;
        this.leaf = new RBTNode(null, null);
    }
    get(key) {
        let node = this.root;
        while (node != null) {
            if (key < node.key) node = node.left;
            else if (key > node.key) node = node.right;
            else return node;
        }
        return null;
    }
    insert(key, value) {
        let node = new RBTNode(key, value);
        node.linkLeft(this.leaf);
        node.linkRight(this.leaf);
        this.insertNode(node);
        this.size++;
        return node;
    }
    insertNode(node) {
        if (this.root == null) {
            this.root = node;
            node.setBlack();
            return;
        }
        let curr = this.root;
        while (true) {
            if (node.key < curr.key) {
                if (curr.left == this.leaf) {
                    curr.left = node;
                    node.parent = curr;
                    break;
                } else curr = curr.left;
            } else {
                if (curr.right == this.leaf) {
                    curr.right = node;
                    node.parent = curr;
                    break;
                } else curr = curr.right;
            }
        }
        this.balanceInsert(node);
    }
    balanceInsert(node) {
        if (node.parent == null) {
            node.setBlack();
        } else if (node.parent.isBlack()) {
            return;
        } else if (node.getUncle().isRed()) {
            node.parent.setBlack();
            node.getUncle().setBlack();
            node.getGrandparent().setRed();
            this.balanceInsert(node.getGrandparent());
        } else {
            if (node == node.parent.right && node.parent == node.getGrandparent().left) {
                this.rotateLeft(node.parent);
                node = node.left;
            } else if (node == node.parent.left && node.parent == node.getGrandparent().right) {
                this.rotateRight(node.parent);
                node = node.right;
            }
            node.parent.setBlack();
            node.getGrandparent().setRed();
            if (node == node.parent.left) {
                this.rotateRight(node.getGrandparent());
            } else {
                this.rotateLeft(node.getGrandparent());
            }
        }
    }
    replaceNode(oldNode, newNode) {
        if (oldNode.parent == null) {
            this.root = newNode;
        } else {
            if (oldNode == oldNode.parent.left) {
                oldNode.parent.left = newNode;
            } else {
                oldNode.parent.right = newNode;
            }
        }
        newNode.parent = oldNode.parent;

    }
    rotateLeft(node) {
        let right = node.right;
        this.replaceNode(node, right);
        node.linkRight(right.left);
        right.linkLeft(node);
    }
    rotateRight(node) {
        let left = node.left;
        this.replaceNode(node, left);
        node.linkLeft(left.right);
        left.linkRight(node);
    }
    minimum(node) {
        while (node.left != this.leaf) {
            node = node.left;
        }
        return node;
    }
    deleteNode(key) {
        let forRemove = this.leaf;
        let tmp = this.root;

        while (tmp != this.leaf) {
            if (tmp.key == key) {
                forRemove = tmp;
                break;
            }

            if (tmp.key > key) {
                tmp = tmp.left;
            } else {
                tmp = tmp.right;
            }
        }

        let minRight = forRemove;
        let minRightColor = minRight.color;
        let newMinRight;

        if (forRemove.left == this.leaf) {
            newMinRight = forRemove.right;
            this.replaceNode(forRemove, forRemove.right);
        }
        else if (forRemove.right == this.leaf) {
            newMinRight = forRemove.left;
            this.replaceNode(forRemove, forRemove.left);
        }
        else {
            minRight = this.minimum(forRemove.right);

            minRightColor = minRight.color;
            newMinRight = minRight.right;

            if (minRight.parent == forRemove) {

                newMinRight.parent = minRight;
            }
            else {
                this.replaceNode(minRight, minRight.right);
                minRight.right = forRemove.right;
                minRight.right.parent = minRight;
            }
            this.replaceNode(forRemove, minRight);
            minRight.left = forRemove.left;
            minRight.left.parent = minRight;
            minRight.color = forRemove.color;
        }

        if (minRightColor == 1) {
            this.balanceDelete(newMinRight);
        }
    }
    balanceDelete(node) {
        while (node != this.root && node.color == 1) {
            if (node == node.parent.left) {
                let brother = node.parent.right;

                if (brother.color == 0) {
                    brother.color = 1;
                    node.parent.color = 0;
                    this.rotateLeft(node.parent);
                    brother = node.parent.right;
                }

                if (
                    brother.left.color == 1 &&
                    brother.right.color == 1
                ) {
                    brother.color = 0;
                    node = node.parent;
                } else {
                    if (brother.right.color == 1) {
                        brother.left.color = 1;
                        brother.color = 0;
                        this.rotateRight(brother);
                        brother = node.parent.right;
                    }

                    brother.color = node.parent.color;
                    node.parent.color = 1;
                    brother.right.color = 1;
                    this.rotateLeft(node.parent);
                    node = this.root;
                }
            } else {
                let brother = node.parent.left
                if (brother.color == 0) {
                    brother.color = 1;
                    node.parent.color = 0;
                    this.rotateRight(node.parent);
                    brother = node.parent.left;
                }

                if (
                    brother.left.color == 1 &&
                    brother.right.color == 1
                ) {
                    brother.color = 0;
                    node = node.parent;
                } else {
                    if (brother.left.color == 1) {
                        brother.right.color = 1;
                        brother.color = 0;
                        this.rotateLeft(brother);
                        brother = node.parent.left;
                    }

                    brother.color = node.parent.color;
                    node.parent.color = 1;
                    brother.left.color = 1;
                    this.rotateRight(node.parent);
                    node = this.root;
                }
            }
        }

        node.color = 1;
    }
}
class RBTVisualize {
    constructor() {
        this.tree = new RBTree();
        this.nodes = [];
        this.edges = {};
        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.width = "100%";
        this.element.style.height = "100%";
        this.element.style.overflow = "hidden";
        this.element.style.backgroundColor = "darkgray";
        this.element.style.zIndex = "0";
        this.element.style.top = "0";
        this.element.style.left = "0";
        document.body.appendChild(this.element);
        this.elements = {}
    }
    insert(key, value) {
        if (key in this.elements) {
            warn("Key already exists");
            return;
        }
        let node = this.tree.insert(key, value);
        this.nodes.push(node.key);
        this.update();
    }
    delete(key) {
        if (!(key in this.elements)) {
            warn("Key not found");
        }
        let node = this.tree.deleteNode(key);
        this.nodes = this.nodes.filter(node => node.key != key);
        this.elements[key].remove();
        //this.elements[key] = null;
        this.update();
    }
    update() {
        for (let key of this.nodes) {
            let node = this.tree.get(key);
            if (node == null) continue;
            if (this.elements[node.key] == null) {
                this.elements[node.key] = document.createElement("div");

            }
            let element = this.elements[node.key];
            let width = 30;
            let height = 30;
            element.style.position = "absolute";
            element.style.width = width + "px";
            element.style.height = height + "px";
            element.style.backgroundColor = node.isRed() ? "red" : "black";
            element.style.borderRadius = "50%";
            element.style.zIndex = "1";
            let y = (node.getLevel() * height + 5)
            let x = (node.getRank() * width + 5)
            element.style.top = y + "px";
            element.style.left = x + "px";
            element.innerText = node.key;// +"\n"+ node.parent?.key;
            element.style.color = "white";
            element.style.fontSize = "20px";
            element.style.textAlign = "center";
            //element.align = "center";
            //element.verticalAlign = "middle";
            element.style.marginLeft = -width / 2;
            element.style.marginTop = -height / 2;
            this.element.appendChild(element);


        }
        for (let key of this.nodes) {
            let node = this.tree.get(key);
            let width = 30;
            let height = 30;
            let y = (node.getLevel() * height + 5)
            let x = (node.getRank() * width + 5)
            let element = this.elements[node.key];
            //add edges
            if (node.parent == null) {
                if (this.edges[node.key] != null) {
                    this.element.removeChild(this.edges[node.key]);
                    this.edges[node.key] = null;
                }
            }
            else {
                if (this.edges[node.key] == null) {
                    this.edges[node.key] = document.createElement("div");
                }
                let edge = this.edges[node.key];
                let parent = this.elements[node.parent.key];
                let getParentElem = (node) => {
                    if (node.parent == null) return null;
                    return this.elements[node.parent.key];
                }
                let parentX = parseFloat(parent.style.left);
                let parentY = parseFloat(parent.style.top);
                let x1 = x;
                let y1 = y;
                let x2 = parentX;
                let y2 = parentY;
                let length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
                let angle = Math.atan2(y2 - y1, x2 - x1);
                //if (x1>x2|true){angle=Math.atan2(y2 - y1, x2 - x1);}
                //else {angle=Math.atan2(y1 - y2, x1 - x2);}
                let degree = angle * 180 / Math.PI;
                //format the degree number to have only 2 digits after the decimal point
                //element.innerText += "\n" + degree.toFixed(2);
                //element.innerText += "\n" + x2 + "," + y2;
                //element.innerText += "\n" + x1 + "," + y1;
                //element.innerText += "\n" + parent.style.left + "," + parent.style.top;
                /*let parent2 = getParentElem(node);
                if (parent2 != null) {
                    element.innerText += "\n" + parent2.style.left + "," + parent2.style.top;
                }*/
                edge.style.position = "absolute";
                edge.style.width = length + "px";
                edge.style.height = "2px";
                edge.style.backgroundColor = "black";
                edge.style.zIndex = "0";
                edge.align = "center";
                edge.style.marginLeft = -length / 2 + "px";
                edge.style.marginTop = "-1px";
                edge.style.transform = "rotate(" + angle + "rad)";
                edge.style.top = (y1 / 2 + y2 / 2) + "px";
                edge.style.left = (x1 / 2 + x2 / 2) + "px";
                this.element.appendChild(edge);
            }
        }
    }
}
let rbt = new RBTVisualize();
rbt.insert(1, 1);
addCommand("insert", "insert", (pair) => {
    let key = parseFloat(pair[0]);
    let value = parseFloat(pair[1]);
    if (isNaN(key)) {
        warn("Invalid input");
        return;
    }
    if (isNaN(value)) value = key;
    rbt.insert(key, value);
});
addCommand("delete", "delete", (args) => {
    let key = parseFloat(args[0]);
    if (isNaN(key)) {
        warn("Invalid input");
        return;
    }
    rbt.delete(key);
});
rbt.insert(2, 2);
rbt.insert(3, 3);
rbt.insert(4, 4);
rbt.insert(-1, -1);
rbt.insert(-2, -2);
rbt.insert(-3, -3);
rbt.insert(-4, -4);