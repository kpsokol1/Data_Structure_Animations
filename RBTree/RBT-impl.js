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
            if (key < tree.key){ // move to left subtree
                tree = tree.left;
            }
            else if (key > tree.key) {
                if (tree.left){
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
}
class RBTree {
    constructor() {
        this.root = null;
        this.size = 0;
    }
    insert(key, value) {
        let node = new RBTNode(key, value);
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
                if (curr.left == null) {
                    curr.left = node;
                    node.parent = curr;
                    break;
                } else curr = curr.left;
            } else {
                if (curr.right == null) {
                    curr.right = node;
                    node.parent = curr;
                    break;
                } else curr = curr.right;
            }
        }
        //this.insertCase1(node);
    }
}
class RBTVisualize {
    constructor() {
        this.tree = new RBTree();
        this.nodes = [];
        this.edges = [];
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
        if (key in this.elements){ 
            warn("Key already exists");
            return;
        }
        let node = this.tree.insert(key, value);
        this.nodes.push(node);
        this.update();
    }
    update() {
        for (let node of this.nodes){
            if (this.elements[node.key] == null) {
                this.elements[node.key] = document.createElement("div");
                
            }
            let element = this.elements[node.key];
            let width = 30;
            let height = 30;
            element.style.position = "absolute";
            element.style.width = width+"px";
            element.style.height = height+"px";
            element.style.backgroundColor = node.isRed() ? "red" : "black";
            element.style.borderRadius = "50%";
            element.style.zIndex = "1";
            element.style.top = (node.getLevel() * height + 5) + "px";
            element.style.left = (node.getRank() * width + 5) + "px";
            element.innerText = node.key;
            element.style.color = "white";
            element.style.fontSize = "20px";
            element.style.textAlign = "center";
            this.element.appendChild(element);
            //add a label to it
            /*let label = document.createElement("div");
            label.style.position = "relative";
            label.style.zIndex = "3";
            label.style.top = (node.getLevel() * 2 * height) + "px";
            label.style.left = (node.getRank() * 2 * width) + "px";
            
            label.style.color = "white";
            label.style.fontSize = "120px";
            label.style.textAlign = "left";
            label.innerHTML = ""
            label.innerHTML+=node.getLevel()+"\n";
            label.innerHTML+=node.getRank()+"\n";
            element.appendChild(label);*/

        }
    }
}
let rbt = new RBTVisualize();
rbt.insert(1, 1);
addCommand("insert", "insert", (pair) => {
    let key=parseFloat(pair[0]);
    let value=parseFloat(pair[1]);
    if (isNaN(key)) {
        warn("Invalid input");
        return;
    }
    if (isNaN(value)) value = key;
    rbt.insert(key, value);
});
rbt.insert(2, 2);
rbt.insert(3, 3);
rbt.insert(4, 4);
rbt.insert(-1, -1);
rbt.insert(-2, -2);
rbt.insert(-3, -3);
rbt.insert(-4, -4);