var TreeAnims = function (canvas) {

return {

    select: function (tree, nodeSize, color, ...nodes) {
        nodes = nodes.map(node => cloneNode(node));
        let _select = select(canvas.layer1, nodeSize, color, ...nodes);
        let root = cloneTree(tree);

        return new _Animation(Timing.linear, 
            (t) => {
                clearCanvas(canvas.layer1);
                _select(t);
            }, canvas.animInterval,
            () => {
                canvas.clear();
                drawTree(root, nodeSize, canvas.layer0);
                nodes.forEach(node => {
                    drawNode(node, nodeSize, canvas.layer0)
                });
            });
    },

    dropNode: function (tree, node, nodeSize) {
        let root = cloneTree(tree);
        let _node = cloneNode(node);
        let y0 = _node.y
        let M = canvas.layer0.getTransform();
        let dy = (canvas.height / M.m22 - 50 - y0);
        let duration = () => {return canvas.animInterval() * dy / 100}
        let bounce = new _Animation(Timing.makeEaseOut(Timing.bounce),
            (t) => {
                clearCanvas(canvas.layer1);
                _node.y = y0 + dy * t;
                drawNode(_node, nodeSize, canvas.layer1);
            }, duration,
            () => {
                canvas.clear();
                drawTree(root, nodeSize, canvas.layer0);
            });
        
        let fall = new _Animation(Timing.quad,
            (t) => {
                clearCanvas(canvas.layer1);
                _node.y = (y0 + dy) + t * (50 + nodeSize);
                drawNode(_node, nodeSize, canvas.layer1);
            }, () => {return canvas.animInterval() / 4},
            () => {
                canvas.clear();
                drawTree(root, nodeSize, canvas.layer0);
            });

        return new CompositeAnimation(bounce, fall);
    },
    
    moveCursor: function (tree, nodeA, nodeB, nodeSize) {
        let root = cloneTree(tree);
    
        let a = (nodeA && !nodeA.isLeaf) ? cloneNode(nodeA) : cloneNode(nodeB);
        let b = (nodeB && !nodeB.isLeaf) ? cloneNode(nodeB) : cloneNode(nodeA);
    
        let d = Math.sqrt((b.x - a.x)**2 + (b.y - a.y)**2);
    
        let duration = () => { return canvas.animInterval() * d / 200; };

        let move = new _Animation(Timing.linear,
            (t) => {
                clearCanvas(canvas.layer1);
                moveCursor(a.x, a.y, b.x, b.y, nodeSize, canvas.layer1)(t);
            }, duration,
            () => {
                canvas.clear();
                drawTree(root, nodeSize, canvas.layer0);
            });
    
        return new CompositeAnimation(this.select(tree, nodeSize, 'cyan', nodeA), move);
    },
    
    swap: function (tree, nodeA, nodeB, nodeSize) {
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
    
            canvas.clear();
            drawTree(nodeList[0], nodeSize, canvas.layer1);
            drawNode(nodeList[i], nodeSize, canvas.layer1);
            drawNode(nodeList[j], nodeSize, canvas.layer1);
        }
     
        return new _Animation(Timing.linear, draw, canvas.animInterval);
    }

}
}