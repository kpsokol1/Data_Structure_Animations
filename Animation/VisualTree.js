Visual.Tree = function (ctx) {

    return {
        select: select,
        moveCursor: moveCursor,
        swap: swap,
    }

    function select (tree, nodeSize, ...nodes) {
        let root = cloneTree(tree);
    
        nodes = nodes.map(node => cloneNode(node));
    
        let draw = (progress) => {
            clearCanvas(ctx);
            if (root) drawTree(root, nodeSize, ctx);
            // highlight the nodes
            let weight = 3 + 2 * Math.sin(progress * 2 * Math.PI);
            nodes.forEach(node => {
                drawNode(node, nodeSize, ctx);
                drawCursor(node.x, node.y, weight, nodeSize, ctx);
            });
        }
    
        let duration = () => { return animInterval() / 3; };
    
        return new _Animation(Timing.linear, draw, duration);
    }
    
    function moveCursor (tree, nodeA, nodeB, nodeSize) {
        let root = cloneTree(tree);
    
        let a = nodeA ? cloneNode(nodeA) : cloneNode(nodeB);
        let b = nodeB ? cloneNode(nodeB) : cloneNode(nodeA);
    
        let d = Math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2);
    
        let duration = () => { return animInterval() * d / 200; };
        
        let draw = (progress) => {
            clearCanvas(ctx);
            drawTree(root, nodeSize, ctx);
    
            let x = a.x + (b.x - a.x) * progress;
            let y = a.y + (b.y - a.y) * progress;
            drawCursor(x, y, 3, nodeSize, ctx);
        }
    
        let _select = select(tree, nodeSize, nodeA);
        let move = new _Animation(Timing.linear, draw, duration);
    
        return new CompositeAnimation(_select, move);
    }
    
    function swap (tree, nodeA, nodeB, nodeSize) {
        let nodeList = flattenTree(tree);
        let i, j;
     
        for (let k = 0; k < nodeList.length; ++k) {
             if (Object.id(nodeList[k]) == Object.id(nodeA)) i = k;
             if (Object.id(nodeList[k]) == Object.id(nodeB)) j = k;
        }
     
        nodeList = flattenTree(cloneTree(tree));
     
        let ax = nodeA.x;
        let ay = nodeA.y;
        let bx = nodeB.x;
        let by = nodeB.y;
     
        let draw = (progress) => {
            nodeList[i].offsetX = (bx - ax) * progress;
            nodeList[i].offsetY = (by - ay) * progress;
            nodeList[j].offsetX = (ax - bx) * progress;
            nodeList[j].offsetY = (ay - by) * progress;
    
            clearCanvas(ctx);
            drawTree(nodeList[0], nodeSize, ctx);
            drawNode(nodeList[i], nodeSize, ctx);
            drawNode(nodeList[j], nodeSize, ctx);
        }
     
        return new _Animation(Timing.linear, draw, animInterval);
    }
}