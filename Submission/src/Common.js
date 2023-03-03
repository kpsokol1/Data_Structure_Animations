/**
 * @author Sungmin Kim
 */
// Some common functions that I didn't know where else to put

// This bascically assigns each object a unique id. Needed this in order
// to track certain nodes for the animations.
// source: https://stackoverflow.com/questions/1997661/unique-object-identifier-in-javascript
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

// helper function for creating DOM objects
// (why the DOM API doesn't already include something like this alludes me)
// source: https://stackoverflow.com/questions/3117756/javascript-create-element-and-set-attributes
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

// make the canvas blank
function clearCanvas (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

// draw the circle that appears around the nodes when we select them
function drawCursor (x, y, weight, radius, ctx, color='cyan') {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1 * weight;
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.stroke();
}

// draw the full tree
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
        if (node.isLeaf) return;
    default:
        if (node.left && !node.left.isLeaf) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node.left.x, node.left.y);
            ctx.stroke();
            drawTree(node.left, size, ctx);
        }
        if (node.right && !node.right.isLeaf) {
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

// Return a copy of the node. (does not copy parent or children)
// Each animation function need to create and hold onto
// copies of trees and nodes so we can create and play animations
// declaratively without side effects (for the most part).
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
        if (node.isLeaf) return null;
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

// Return a copy of the entire tree.
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
        if (node.isLeaf) return null;
    default: {
        let _root = cloneNode(node);
    
        if (node.left && !node.left.isLeaf)  {
            _root.left = cloneTree(node.left);
            _root.left.parent = _root;
        }
        if (node.right && !node.right.isLeaf) {
            _root.right = cloneTree(node.right);
            _root.right.parent = _root;
        }
        return _root;
    }
    }
}

// flatten the tree into an array of nodes
function flattenTree (tree) {
    if (!tree) return [];
    if (tree.isLeaf) return [];

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

// draw the individual node
function drawNode (node, size, ctx) {
    if (!node) return;

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
    ctx.arc(x, y, size * 0.55, 0, Math.PI * 2, true);
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

// get the distance between two points
function distance (x0, y0, x1, y1) {
    return Math.sqrt((x1 - x0)**2 + (y1 - y0)**2);
}

// returns an animation of the cursor selecting the nodes
function select (ctx, cursorSize, color='cyan', ...targets) {
    targets = targets.map(target => {return target ? {x: target.x, y: target.y} : null});
    
    return (progress) => {
        clearCanvas(ctx);
        // highlight the nodes
        let weight = 3 + 2 * Math.sin(progress * 2 * Math.PI);
        targets.forEach(target => {
            target ? drawCursor(target.x, target.y, weight, cursorSize, ctx, color) : 0;
        });
    }
}

// returns an animation of the cursor moving from point a to b
function moveCursor (x0, y0, x1, y1, cursorSize, ctx) {
    return (progress) => {
        let x = x0 + (x1 - x0) * progress;
        let y = y0 + (y1 - y0) * progress;
        drawCursor(x, y, 3, cursorSize, ctx);
    }
}

// returns an animation of the whole tree being translated
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

// Take the a tree from two points in time and return
// an animation that shows an interpolation between the two states
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

// move the node from point a to b
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

// swap two nodes
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