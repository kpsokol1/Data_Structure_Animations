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

var Visual = {};

function clearCanvas (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCursor (x, y, weight, radius, ctx) {
    //console.log(x, y, weight, radius, canvas);

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