var TreeAnims = function (canvas) {

return {

    select: function (tree, nodeSize, ...nodes) {
        nodes = nodes.map(node => cloneNode(node));
        let _select = select(canvas.layer1, nodeSize, ...nodes);
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
    
    moveCursor: function (tree, nodeA, nodeB, nodeSize) {
        let root = cloneTree(tree);
    
        let a = nodeA ? cloneNode(nodeA) : cloneNode(nodeB);
        let b = nodeB ? cloneNode(nodeB) : cloneNode(nodeA);
    
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
    
        return new CompositeAnimation(this.select(tree, nodeSize, nodeA), move);
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