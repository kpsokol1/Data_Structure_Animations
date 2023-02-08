(function() {
    if ( typeof Object.id != "undefined" ) return;

    var id = 0;

    Object.id = function(o) {
        if ( typeof o.__uniqueid != "undefined" ) {
            return o.__uniqueid;
        }

        Object.defineProperty(o, "__uniqueid", {
            value: ++id,
            enumerable: false,
            // This could go either way, depending on your 
            // interpretation of what an "id" is
            writable: false
        });

        return o.__uniqueid;
    };
})();

function createElement(ele, attrs) {
    //create the element with a specified string:
    let element = document.createElement(ele);

    //create a for...in loop set attributes:
    for (let val in attrs) {
        //for support in the setAttrubute() method:
        if (element.setAttribute) {
            if (element[val] in element) {
               element.setAttribute(val, attrs[val]);
            } else {
                element[val] = attrs[val];
            }
        } else {
            element[val] = attrs[val];
        }
    }

    return element;
}

function clearCanvas (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawCursor (x, y, weight, radius, ctx) {
    ctx.beginPath();
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 1 * weight;
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.stroke();
}

function drawTree (node, size, ctx) 
{
    if (!node) return;

    switch (node.type) 
    {
    case 'Binomial': {
        let drawSubTree = (tree, ctx) => {
            if (!tree) return;
    
            for (let cur = tree.child; cur; cur = cur.sibling) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(tree.x, tree.y);
                ctx.lineTo(cur.x, cur.y);
                ctx.stroke();
                drawSubTree(cur, ctx);
            }
        
            drawNode(tree, size, ctx);
        }

        for (let cur = node; cur; cur = cur.sibling) {
            drawSubTree(cur, ctx);
        }
    }   break;

    case 'Binary':
    default:
        if (node.left) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.left.x, node.left.y);
            ctx.stroke();
            drawTree(node.left, size, ctx);
        }
        if (node.right) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.right.x, node.right.y);
            ctx.stroke();
            drawTree(node.right, size, ctx);
        }
        drawNode(node, size, ctx);
    }
}

function cloneNode (node) {
    if (!node) return null;

    switch (node.type) {
    case 'Binomial':
        return {
            key: node.key,
            degree: node.degree,
            color: node.color,
            x: node.x,
            y: node.y,
            type: 'Binomial'
        };

    case 'Binary':
    default:
        return {
            key: node.key,
            color: node.color,
            index: node.index,
            x: node.x,
            y: node.y,
            type: 'Binary'
        };
    }
}

function cloneTree (node) {
    if (!node) return null;

    switch (node.type) {
    case 'Binomial': {
        let _root = cloneNode(node);
    
        _root.child = cloneTree(node.child);
        if (_root.child) {
            _root.child.parent = _root;
        }
    
        _root.sibling = cloneTree(node.sibling);
    
        return _root;
    }

    case 'Binary':
    default: {
        let _root = cloneNode(node);
    
        if (node.left)  {
            _root.left = cloneTree(node.left);
            _root.left.parent = _root;
        }
        if (node.right) {
            _root.right = cloneTree(node.right);
            _root.right.parent = _root;
        }
        return _root;
    }
    }
}

function flattenTree (tree) {
    if (!tree) return [];

    switch (tree.type) {
    case 'Binomial': {
        let nodes = [tree];
        nodes = nodes.concat(flattenTree(tree.child));
        nodes = nodes.concat(flattenTree(tree.sibling));
        return nodes;
    }

    case 'Binary':
    default: {
        let nodes = [tree];
        nodes = nodes.concat(flattenTree(tree.left));
        nodes = nodes.concat(flattenTree(tree.right));
        return nodes;
    }
    }
}

function drawNode (node, size, ctx) {
    let x = node.x + (node.offsetX ? node.offsetX : 0);
    let y = node.y + (node.offsetY ? node.offsetY : 0);

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2, true);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black'
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2, true);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px sans-serif';

    let text = node.key;
    if (text === Number.NEGATIVE_INFINITY)
        text = '-Inf';
    ctx.fillText(text, x, y, size * 0.8);
}

function distance (x0, y0, x1, y1) {
    return Math.sqrt((x1 - x0)**2 + (y1 - y0)**2);
}

function select (ctx, cursorSize, ...targets) {
    targets = targets.map(target => {return {x: target.x, y: target.y}});
    
    return (progress) => {
        clearCanvas(ctx);
        // highlight the nodes
        let weight = 3 + 2 * Math.sin(progress * 2 * Math.PI);
        targets.forEach(target => {
            drawCursor(target.x, target.y, weight, cursorSize, ctx);
        });
    }
}

function moveCursor (x0, y0, x1, y1, cursorSize, ctx) {
    return (progress) => {
        let x = x0 + (x1 - x0) * progress;
        let y = y0 + (y1 - y0) * progress;
        drawCursor(x, y, 3, cursorSize, ctx);
    }
}

function moveTree (root, x, y, nodeSize, ctx) {
    let _root = cloneTree(root);

    let dx = x - _root.x;
    let dy = y - _root.y;

    return (progress) => {
        ctx.save();
        ctx.translate(dx * progress, dy * progress);
        drawTree(_root, nodeSize, ctx);
        ctx.restore();
    }
}

function interpolateTrees (init, dest, nodeSize, ctx) {
    let nodes = [];

    let visit = (a, b) => {
        if (!a) return;

        let dx = b.x - a.x;
        let dy = b.y - a.y;

        if (dx != 0 || dy != 0) {
            nodes.push({node: a, x: a.x, y: a.y, dx: dx, dy: dy});
        }

        switch (a.type) {
        case 'Binomial':
            visit(a.child, b.child);
            visit(a.sibling, b.sibling);
            break;
        case 'Binary':
        default:
            visit(a.left, b.left);
            visit(a.right, b.right);
        }
    }

    visit(init, dest);

    return (progress) => {
        nodes.forEach(arg => {
            arg.node.x = arg.x + arg.dx * progress;
            arg.node.y = arg.y + arg.dy * progress;
        });
        drawTree(init, nodeSize, ctx);
    }
}

function moveNode(node, nodeSize, x, y, ctx) {
    let _node = cloneNode(node);

    let x0 = _node.x;
    let y0 = _node.y;

    return (progress) => {
        _node.x = x0 + (x - x0) * progress;
        _node.y = y0 + (y - y0) * progress;

        drawNode(_node, nodeSize, ctx);
    }
}

function swapNodes (nodeA, nodeB, nodeSize, ctx) {
    let a = cloneNode(nodeA);
    let b = cloneNode(nodeB);

    let ax = a.x;
    let ay = a.y;
    let bx = b.x;
    let by = b.y;

    return (progress) => {
        a.x = ax + (bx - ax) * progress;
        a.y = ay + (by - ay) * progress;
        b.x = bx + (ax - bx) * progress;
        b.y = by + (ay - by) * progress;

        drawNode(a, nodeSize, ctx);
        drawNode(b, nodeSize, ctx);
    }
}