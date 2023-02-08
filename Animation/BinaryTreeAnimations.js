TreeAnims.Binary = (canvas) =>
{
    const MARGIN_TOP = 30;
    const MARGIN_LEFT = 50;
    const MAX_ROWS = 8;
    const SCREEN_HEIGHT = 400;
    const SCREEN_WIDTH = 1000;
    const NODE_SIZE = 20;
    const DIFF_Y = SCREEN_HEIGHT / MAX_ROWS;
    const DIFF_X = SCREEN_WIDTH - MARGIN_LEFT * 2;

    canvas.resetTransform();
    canvas.scale(
        canvas.width / SCREEN_WIDTH,
        canvas.height / SCREEN_HEIGHT
    );

    /**Get the heap index of the left child */
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
    
    function getPos (index) {
        let depth = Math.floor(Math.log2(index + 1));
        let offset = index - ((2 ** depth) - 1) + 1;
    
        return {
            x: DIFF_X / ((2 ** depth) + 1) * offset + MARGIN_LEFT,
            y: DIFF_Y * depth + MARGIN_TOP,
        }
    }

return {

    dropNode: function (tree, node) {
        return TreeAnims(canvas).dropNode(tree, node, NODE_SIZE);
    },

    select: function (tree, color, ...nodes) {
        return TreeAnims(canvas).select(tree, NODE_SIZE, color, ...nodes);
    },

    moveCursor: function (tree, a, b) {
        return TreeAnims(canvas).moveCursor(tree, a, b, NODE_SIZE);
    },

    swap: function (tree, a, b) {
        return TreeAnims(canvas).swap(tree, a, b, NODE_SIZE);
    },
    
    insert: function (tree, node) {
        node.index = 0;
        node.x = getPos(0).x;
        node.y = getPos(0).y;

        if (!tree || tree.isLeaf)
            return this.select(tree, 'yellow', node);
    
        let _parent = cloneNode(node.parent);
        let _node = cloneNode(node);
        let _root = cloneTree(tree);
    
        if (node.key < _parent.key) {
            _parent.left = _node;
            node.index = leftNdx(_parent.index);
        } else {
            _parent.right = _node;
            node.index = rightNdx(_parent.index);
        }
        let a = getPos(_parent.index);
        let b = getPos(node.index);
    
        node.x = b.x;
        node.y = b.y;
    
        let d = Math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2);
        let duration = () => { return canvas.animInterval() * d / 200; };
    
        let draw = (progress) => {
            _node.x = a.x + (b.x - a.x) * progress;
            _node.y = a.y + (b.y - a.y) * progress;

            clearCanvas(canvas.layer1);
            drawCursor(_node.x, _node.y, 3, NODE_SIZE, canvas.layer1, 'yellow');
        };
        let before = () =>{
            canvas.clear();
            drawTree(_root, NODE_SIZE, canvas.layer0);
        };
    
        let initial = this.select(tree, 'cyan', node.parent);

        let push = new _Animation(Timing.linear, draw, duration, before);

        let final = new _Animation(Timing.linear,
            (t) => {
                clearCanvas(canvas.layer1);
                select(canvas.layer1, NODE_SIZE, 'yellow', {x: b.x, y: b.y})(t);
            }, canvas.animInterval,
            () => {
                canvas.clear();
                drawTree(_root, NODE_SIZE, canvas.layer0);
                drawTree(_parent, NODE_SIZE, canvas.layer0);
            });
    
        return new CompositeAnimation(initial, push, final);
    },
    
    reIndex: function (node) {
        if (!node) return;
    
        if (!node.parent) {
            node.index = 0;
        } else if (node == node.parent.right) {
            node.index = rightNdx(node.parent.index);
        } else {
            node.index = leftNdx(node.parent.index);
        }
    
        this.reIndex(node.left);
        this.reIndex(node.right);
    },
    
    updatePositions: function (tree) {
        this.reIndex(tree);
    
        let root = cloneTree(tree);
        let nodes = flattenTree(root);
    
        let update = (node) => {
            if (!node) return;
            node.x = getPos(node.index).x;
            node.y = getPos(node.index).y;
            update(node.left);
            update(node.right);
        }
        update(tree);
        
        nodes.forEach(node => {
            node.oldX = node.x;
            node.oldY = node.y;
        });
    
        let draw = (progress) => {
            canvas.clear();
            nodes.forEach(node => {
                node.x = node.oldX + (getPos(node.index).x - node.oldX) * progress;
                node.y = node.oldY + (getPos(node.index).y - node.oldY) * progress;
            });
            drawTree(root, NODE_SIZE, canvas.layer1);
        }
    
        return new _Animation(Timing.linear, draw, canvas.animInterval);
    }
}
}
    
    
    