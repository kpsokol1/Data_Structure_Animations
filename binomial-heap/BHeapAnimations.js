TreeAnims.Binomial = (canvas) => 
{
    const MARGIN_TOP = 60;
    const MARGIN_LEFT = 60;
    const NODE_RADIUS = 13;
    const SCREEN_WIDTH = 1000;
    const SCREEN_HEIGHT = 400;
    const MAX_DEGREE = 5;
    const DIFF_X = (SCREEN_WIDTH - 2 * MARGIN_LEFT) / (2 ** MAX_DEGREE - 1);
    const DIFF_Y = (SCREEN_HEIGHT - MARGIN_TOP) / (MAX_DEGREE + 1);

    TreeAnims.Binomial.NODE_RADIUS = NODE_RADIUS;

    canvas.resetTransform();
    canvas.scale(
        canvas.width / SCREEN_WIDTH,
        canvas.height / SCREEN_HEIGHT
    );

    return {
        insert:     insert,
        mergeUp:    mergeUp,
        mergeLeft:  mergeLeft,
        link:       link,
        fixTree:    fixTree,
        fixSubTree: fixSubTree,
        select:     select,
        moveCursor: moveCursor,
        swap:       swap,
        dropNode:   dropNode,
    }

    function dropNode(tree, node) {
        return TreeAnims(canvas).dropNode(tree, node, NODE_RADIUS);
    }

    function select (tree, color, ...nodes) {
        return TreeAnims(canvas).select(tree, NODE_RADIUS, color, ...nodes);
    }

    function moveCursor (tree, a, b) {
        return TreeAnims(canvas).moveCursor(tree, a, b, NODE_RADIUS);
    }

    function swap (tree, a, b) {
        return TreeAnims(canvas).swap(tree, a, b, NODE_RADIUS);
    }

    function getChildPos (tree, index) {
        return {
            x: tree.x - DIFF_X * Math.floor(2 ** (tree.degree - index - 1) / 2),
            y: tree.y + DIFF_Y,
        }
    }

    function drawSubTree (tree) {
        if (!tree) return;
    
        for (let cur = tree.child; cur; cur = cur.sibling) {
            canvas.layer1.lineWidth = 1;
            canvas.layer1.strokeStyle = 'black';
            canvas.layer1.beginPath();
            canvas.layer1.moveTo(tree.x, tree.y);
            canvas.layer1.lineTo(cur.x, cur.y);
            canvas.layer1.stroke();
            drawSubTree(cur);
        }
    
        drawNode(tree, NODE_RADIUS, canvas.layer1);
    }
    
    function treeWidth (degree) {
        return DIFF_X * (2 ** (degree > 1 ? degree - 1 : 0));
    }
    
    function insert (tree, node) {
        node.x = MARGIN_LEFT / 2;
        node.y = MARGIN_TOP;
        //node.type = 'Binomial';
    
        let _root = cloneTree(tree);
        let _node = cloneNode(node);
    
        if (!_root || _root.degree > 0) {
            let r_dx = DIFF_X;
            let n_dx = MARGIN_LEFT / 2 + DIFF_X;
    
            let draw = (progress) => {
                canvas.clear();
    
                canvas.layer1.save();
                canvas.layer1.translate(r_dx * progress, 0);
                drawTree(_root, NODE_RADIUS, canvas.layer1);
                canvas.layer1.restore();
                canvas.layer1.save();
                canvas.layer1.translate(n_dx * progress, 0);
                drawNode(_node, NODE_RADIUS, canvas.layer1);
                canvas.layer1.restore();
            }
    
            let shift = new _Animation(Timing.linear, draw, canvas.animInterval);
    
            return new CompositeAnimation(select(_root, 'cyan', _node), shift);
        }
        
        return select(_root, 'cyan', _node);
    }
    
    function mergeUp (heapA, heapB) {
        let a = cloneTree(heapA);
        let b = cloneTree(heapB);
    
        let draw = (progress) => {
            canvas.clear();
            drawTree(a, NODE_RADIUS, canvas.layer1);
    
            canvas.layer1.save();
            canvas.layer1.translate(0, -DIFF_Y * progress);
            drawTree(b, NODE_RADIUS, canvas.layer1);
            canvas.layer1.restore();
        }
    
        for (let cur = heapB; cur; cur = cur.sibling) {
            cur.y = MARGIN_TOP;
            fixSubTree(cur);
        }
    
        return new _Animation(Timing.linear, draw, canvas.animInterval);
    }
    
    function mergeLeft (head, left, right) {
        let h = cloneTree(head);
        let r = cloneTree(right);
        let l = cloneTree(left);
    
        let i = 0;
        for (let cur = head; cur; cur = cur.sibling) {
            if (Object.id(cur) == Object.id(left) ||
                Object.id(cur) == Object.id(right)) {
                break;
            }
            ++i;
        }
    
        let l_dx = treeWidth(right.degree);
        let r_dx = treeWidth(right.degree) + left.x - right.x - treeWidth(left.degree);
    
        let lx = left.x - treeWidth(left.degree);
        let rx = right.x;
    
        let draw = (progress) => {
            canvas.clear();
            
            fixTree(l, lx + l_dx * progress);
            fixSubTree(r, rx + r_dx * progress);
    
            let cur = h;
            for (let j = 0; j < i; ++j) {
                drawSubTree(cur);
                cur = cur.sibling;
            }
            drawTree(l, NODE_RADIUS, canvas.layer1);
            drawTree(r, NODE_RADIUS, canvas.layer1);
        }
    
        fixTree(left, lx + l_dx);
        fixSubTree(right, rx + r_dx);
    
        let duration = () => {
            return canvas.animInterval() * distance(0, 0, r_dx, 20) / 200;
        } 
    
        return new _Animation(Timing.linear, draw, duration);
    }
    
    function link (tree, nodeA, nodeB) {
        let rootList = [];
    
        for (let cur = tree; cur; cur = cur.sibling) {
            if (cur != nodeA && cur != nodeB) {
                let root = cloneTree(cur);
                root.sibling = null;
                rootList.push(root);
            }
        }
    
        let a = cloneTree(nodeA);
        let b = cloneTree(nodeB);
    
        let a_dx = 0;
    
        if (a.x < b.x && b.degree > 0) {
            a_dx = b.x - a.x;
        }
    
        let b_dx = getChildPos(a, 0).x - b.x + a_dx;
        let b_dy = DIFF_Y;
    
        let draw = (progress) => {
            canvas.clear();
    
            canvas.layer1.beginPath();
            canvas.layer1.moveTo(
                b.x + b_dx * progress, 
                b.y + b_dy * progress);
    
            canvas.layer1.lineTo(a.x + a_dx * progress, a.y);
            canvas.layer1.strokeStyle = 'black';
            canvas.layer1.lineWidth = 1;
            canvas.layer1.stroke();
    
            canvas.layer1.save();
            canvas.layer1.translate(
                b_dx * progress, 
                b_dy * progress);
            drawSubTree(b);
            canvas.layer1.restore();
    
            canvas.layer1.save();
            canvas.layer1.translate(
                a_dx * progress, 0);
            drawSubTree(a);
            canvas.layer1.restore();
    
            rootList.forEach(root => drawSubTree(root));
        }
    
        let duration = () => {
            return canvas.animInterval() * distance(0, 0, b_dx, b_dy) / 100;
        }
    
        return new _Animation(Timing.linear, draw, duration);
    }
    
    function fixTree (head, pos = MARGIN_LEFT) {
        let x = pos;
        for (let cur = head; cur; cur = cur.sibling) {
            x += treeWidth(cur.degree);
            cur.x = x;
            fixSubTree(cur);
        }
    }
    
    function fixSubTree (tree, pos = tree.x) {
        if (!tree) return;
    
        tree.x = pos;
    
        let i = 0; 
        for (let cur = tree.child; cur; cur = cur.sibling) {
            let pos = getChildPos(tree, i);
            cur.x = pos.x
            cur.y = pos.y
            fixSubTree(cur);
            
            ++i;
        } 
    }
};