Visual.Tree.Binomial = (canvas) => 
{
    const MARGIN_TOP = 50;
    const MARGIN_LEFT = 60;
    const NODE_RADIUS = 13;
    const SCREEN_WIDTH = 1000;
    const SCREEN_HEIGHT = 300;
    const MAX_DEGREE = 5;
    const DIFF_X = (SCREEN_WIDTH - 2 * MARGIN_LEFT) / (2 ** MAX_DEGREE - 1);
    const DIFF_Y = (SCREEN_HEIGHT - 2 * MARGIN_TOP) / (MAX_DEGREE + 1);

    let ctx = canvas.getContext('2d');
    ctx.scale(
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
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(tree.x, tree.y);
            ctx.lineTo(cur.x, cur.y);
            ctx.stroke();
            drawSubTree(cur);
        }
    
        drawNode(tree, NODE_RADIUS, canvas);
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
                clearCanvas(canvas);
    
                ctx.save();
                ctx.translate(r_dx * progress, 0);
                drawTree(_root);
                ctx.restore();
                ctx.save();
                ctx.translate(n_dx * progress, 0);
                drawNode(_node, NODE_RADIUS, canvas);
                ctx.restore();
            }
    
            let shift = new _Animation(Timing.linear, draw, animInterval);
    
            return new CompositeAnimation(select(_root, _node), shift);
        }
        
        return select(_root, _node);
    }
    
    function mergeUp (heapA, heapB) {
        let a = cloneTree(heapA);
        let b = cloneTree(heapB);
    
        let draw = (progress) => {
            clearCanvas(canvas);
            drawTree(a);
    
            ctx.save();
            ctx.translate(0, -DIFF_Y * progress);
            drawTree(b);
            ctx.restore();
        }
    
        for (let cur = heapB; cur; cur = cur.sibling) {
            cur.y = MARGIN_TOP;
            fixSubTree(cur);
        }
    
        return new _Animation(Timing.linear, draw, animInterval);
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
            clearCanvas(canvas);
            
            fixTree(l, lx + l_dx * progress);
            fixSubTree(r, rx + r_dx * progress);
    
            let cur = h;
            for (let j = 0; j < i; ++j) {
                drawSubTree(cur);
                cur = cur.sibling;
            }
            drawTree(l);
            drawTree(r);
        }
    
        fixTree(left, lx + l_dx);
        fixSubTree(right, rx + r_dx);
    
        let duration = timeByDistance(0, 0, r_dx, 20);
    
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
            clearCanvas(canvas);
    
            ctx.beginPath();
            ctx.moveTo(
                b.x + b_dx * progress, 
                b.y + b_dy * progress);
    
            ctx.lineTo(a.x + a_dx * progress, a.y);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();
    
            ctx.save();
            ctx.translate(
                b_dx * progress, 
                b_dy * progress);
            drawSubTree(b);
            ctx.restore();
    
            ctx.save();
            ctx.translate(
                a_dx * progress, 0);
            drawSubTree(a);
            ctx.restore();
    
            rootList.forEach(root => drawSubTree(root));
        }
    
        let duration = timeByDistance(0, 0, b_dx, b_dy, 100);
    
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