var BTreeAnims = (() => {
// getting a reference to our HTML element
let canvas;
let c;

SCREEN_WIDTH = 1280;
SCREEN_HEIGHT = 540;

let keyWidth = .05 * SCREEN_WIDTH;
let nodeSpacing = 0.02 * SCREEN_WIDTH;
let keysAtLevel = [];
let keysPerLevel = [0];
let nodesPerLevel = [0];
let nodesInsertedPerLevel = [0]
let keysInsertedPerLevel = [0];
let excludedKey = [];
let emptyLevel;
let emptyIndex;

class BTreeAnims {
  static setCanvas(_canvas) {
    canvas = _canvas;
    c = _canvas.layer1;

    canvas.scale(
      canvas.width / SCREEN_WIDTH,
      canvas.height / SCREEN_HEIGHT
    );
  }

  static runQueue(pauseTime) {
    let i = 0;
    let ref = setInterval(async() => {
      if (i === animationQueue.length) {
        clearInterval(ref);
        animationQueue.length = 0;
        return;
      }
      //this.drawTree(tree);
      await animationQueue[i]();
      i++;
    }, pauseTime);
  }

  static moveCanvasUp(tree,level,index){
    let y0 = this.#getY(1);
    let y1 = this.#getY(0);

    return new _Animation(Timing.linear,
      (t) => {
        c.save();
        c.translate(0,(y1 - y0) * t);
        canvas.clear();
        this.drawTree(tree,null,true,level,index);
        c.clearRect(canvas.width/2-2,0,20,y0-1);
        c.restore();
      }, canvas.animInterval);
  }

  static moveRootDown(oldTree,root,newTree,root_key,root_level,root_key_index,child_node,child_node_level,child_node_index,child_node_key_index){
    let root_index;
    let root_x;
    let root_y;
    let child_x;
    let child_y;
    let width;
    let height;

    let xDistance;
    let yDistance;
    let xIncrement;
    let currentY;
    let currentX;

    return new _Animation(Timing.linear,
      (t) => {
        c.clearRect(currentX+2,currentY+2,keyWidth-4,height-4);     //fixme may have to modify this
        this.drawTree(newTree,[root_key]);
        currentY = root_y + yDistance * t;
        currentX = root_x + xDistance * t;
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(root_key,currentX+keyWidth/2,currentY+keyWidth/2);
      }, canvas.animInterval,
      () => {
        root_index = this.#getNodesAndKeysBehind(root_level,root)[1]; //fixme will this always work on a constantly changing tree?
        this.drawTree(newTree,[root_key]);
        root_x = this.#getX(root,root_level,root_index,false,oldTree) + keyWidth * root_key_index;
        root_y = this.#getY(root_level);
        child_x = this.#getX(child_node,child_node_level,child_node_index,false,newTree) + keyWidth * child_node_key_index;
        child_y = this.#getY(child_node_level);
        width = root.keys.length * keyWidth;
        height = 40;
        if (root_level === 0) {
          root_x = root_x - (width / 2);
        }
        xDistance = child_x-root_x;
        yDistance = child_y-root_y;
        xIncrement = xDistance/Math.abs(yDistance);
        currentY = root_y;
        currentX = root_x;
      });
  }

  static splitChildNode(newTree, oldTree, oldRoot, newRoot, oldLevel, newLevel,oldKeyIndex,newKeyIndex,key){
    let oldIndex;
    let newIndex ;
    let old_x;
    let old_y;
    let new_x;
    let new_y;

    let width;
    let height;
  
    let xDistance;
    let yDistance ;
    let xIncrement;
    let currentY;
    let currentX ;

    return new _Animation(Timing.linear,
      (t) => {
        c.clearRect(currentX+2,currentY+2,keyWidth-4,height-4);     //fixme may have to modify this
        this.drawTree(newTree,[key]);
        currentY = old_y + yDistance * t;
        currentX = old_x + xDistance * t;
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(key,currentX+keyWidth/2,currentY+keyWidth/2);
      }, canvas.animInterval, 
      () => {
        oldIndex = this.#getNodesAndKeysBehind(oldLevel,oldRoot)[1]; //fixme will this always work on a constantly changing tree?
        newIndex = this.#getNodesAndKeysBehind(newLevel,newRoot)[1]; //fixme will this always work on a constantly changing tree?
        old_x = this.#getX(oldRoot,oldLevel,oldIndex,false,oldTree) + keyWidth * oldKeyIndex;
        old_y = this.#getY(oldLevel);
        new_x = this.#getX(newRoot, newLevel,newIndex,false,newTree) + keyWidth * newKeyIndex;
        new_y = this.#getY(newLevel);

        width = newRoot.keys.length * keyWidth;
        height = 40;
        if (newLevel === 0) {
          new_x = new_x - (width / 2);
        }

        xDistance = new_x-old_x;
        yDistance = new_y-old_y;
        xIncrement = xDistance/Math.abs(yDistance);
        currentY = old_y;
        currentX = old_x;
      });
  }

  static splitRoot(oldTree,root,leftCutoff,rightCutoff){
    //move whole canvas down
    let y0 ;
    let y1;
    return new _Animation(Timing.linear,
      (t) => {
        //c.clearRect(canvas.width/2-2,0,4,120);
        c.save();
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.translate(0,(y1 - y0) * t);
        this.drawTree(oldTree);
        c.clearRect(canvas.width/2-2,0,20,y0-1);
        c.restore();
      }, canvas.animInterval,
      () => {
        y0 = this.#getY(0);
        y1 = this.#getY(1);
      },
      () => {
        c.translate(0,(y1 - y0));

        //put lines around t
        let x_pos = this.#getX(root, 0, 0, false,oldTree);
        let y_pos = this.#getY(0);
        let width = root.keys.length * keyWidth;
        let height = 40;
        x_pos = x_pos - (width / 2);

        c.strokeStyle = "black"
        c.stroke();
      });
  }

  static extracted(oldTree, leftCutoff, rightCutoff, root, key) {
      let width;
      let x_pos;
      let y_pos;
      let height;
      let goalY;
      let currentY;

      return new _Animation(Timing.linear,
        (t) => {
          /*
          if (currentY <= goalY) {
            clearInterval(ref2);
            c.translate(0, this.#getY(0) - this.#getY(1));
            resolve();
            return;
          }*/
          c.lineWidth = 2;
          c.clearRect(x_pos + leftCutoff * keyWidth - 2, currentY, keyWidth + 4,
              height + 2);
          c.beginPath();
          c.moveTo(x_pos + leftCutoff * keyWidth, y_pos);
          c.lineTo(x_pos + leftCutoff * keyWidth, y_pos + height);
          c.strokeStyle = "black"
          c.stroke();
          c.beginPath();
          c.moveTo(x_pos + rightCutoff * keyWidth, y_pos);
          c.lineTo(x_pos + rightCutoff * keyWidth, y_pos + height);
          c.strokeStyle = "black"
          c.stroke();
          currentY = y_pos + (goalY - y_pos) * t;
          c.fillStyle = "blue";
          c.fillRect(x_pos + leftCutoff * keyWidth, currentY, keyWidth, height);  //fixme will we always be taking 1 node up?
          c.strokeRect(x_pos + leftCutoff * keyWidth, currentY, keyWidth, height);
          c.beginPath();
          c.arc(x_pos + keyWidth / 2 + keyWidth, currentY + height / 2, 15, 0, Math.PI * 2, true);
          c.fillStyle = 'white';
          c.fill();
          c.textAlign = "center";
          c.fillStyle = "black";
          c.fillText(root.keys[root.t - 1],
            x_pos + leftCutoff * keyWidth + keyWidth / 2,
            currentY + height / 2);
      }, canvas.animInterval,
      () => {
        width = root.keys.length * keyWidth;
        x_pos = this.#getX(root, 0, 0, false,oldTree);
        x_pos = x_pos - (width / 2);
        y_pos = this.#getY(0);
        height = 40;
        goalY = this.#getY(-1);
        currentY = this.#getY(0);

        this.drawTree(oldTree,key);
          c.clearRect(x_pos + leftCutoff * keyWidth, this.#getY(0) - 2, keyWidth,
              height);
      },
      () => {
        c.translate(0, this.#getY(0) - this.#getY(1));
      });
  }

  static leftRotate(newTree,root,left,right,root_key,right_key,left_index,right_index,root_level,left_level,right_level,root_key_index,left_key_index,right_key_index){
    let root_index;
    let root_x;
    let root_y;
    let left_x;
    let left_y;
    let right_x;
    let right_y;

    let width;
    let height;

    let rootXDistance;
    let rightXDistance;
    let yDistance;
    let rootXIncrement;
    let rightXIncrement;
    let rootCurrentX;
    let rootCurrentY;
    let rightCurrentX;
    let rightCurrentY;

    return new _Animation(Timing.linear,
      (t) => {
        if (rootCurrentY >= left_y) { //fixme may have to check both here
          clearInterval(ref);
          this.drawTree(newTree);
          return;
        }
        c.clearRect(rootCurrentX+2,rootCurrentY+2,keyWidth-4,height-4);     //fixme may have to modify this
        c.clearRect(rightCurrentX+2,rightCurrentY+2,keyWidth-4,height-4);     //fixme may have to modify this
        this.drawTree(newTree,[root_key,right_key]);
        rootCurrentY = root_y - yDistance * t;
        rightCurrentY = right_y + yDistance * t;
        rootCurrentX = root_x + rootXDistance * t;
        rightCurrentX = right_x + rightXDistance * t;
  
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(root_key,rootCurrentX+keyWidth/2,rootCurrentY+keyWidth/2);
        c.fillText(right_key,rightCurrentX+keyWidth/2,rightCurrentY+keyWidth/2);
      }, canvas.animInterval,
      () => {
        root_index = this.#getNodesAndKeysBehind(root_level,root)[1]; //fixme will this always work on a constantly changing tree?
        this.drawTree(newTree,[root_key,right_key])
        root_x = this.#getX(root,root_level,root_index,false,newTree) + keyWidth*root_key_index;
        root_y = this.#getY(root_level);
        left_x = this.#getX(left,left_level,left_index,false,newTree) + keyWidth*left_key_index;
        left_y = this.#getY(left_level);
        right_x = this.#getX(right,right_level,right_index,false,newTree) + keyWidth*right_key_index;
        right_y = this.#getY(right_level);

        width = root.keys.length * keyWidth;
        height = 40;
        if (root_level === 0) {
          root_x = root_x - (width / 2);
        }

        rootXDistance = left_x-root_x;
        rightXDistance = root_x-right_x;
        yDistance = root_y-left_y;
        rootXIncrement = rootXDistance/Math.abs(yDistance);
        rightXIncrement = rightXDistance/Math.abs(yDistance);

        rootCurrentX = root_x;
        rootCurrentY = root_y;
        rightCurrentX = right_x;
        rightCurrentY = right_y;
      });
  }

  static rightRotate(newTree,root,left,right,root_key,left_key,left_index,right_index,root_level,left_level,right_level,root_key_index,left_key_index,right_key_index){
    let root_index;
    let root_x;
    let root_y;
    let left_x;
    let left_y;
    let right_x;
    let right_y;

    let width;
    let height;
    
    let rootXDistance;
    let leftXDistance;
    let yDistance;
    let rootXIncrement ;
    let leftXIncrement;

    let rootCurrentX ;
    let rootCurrentY;
    let leftCurrentX ;
    let leftCurrentY ;

    return new _Animation(Timing.linear,
      (t) => {
        c.clearRect(rootCurrentX+2,rootCurrentY+2,keyWidth-4,height-4);     //fixme may have to modify this
        c.clearRect(leftCurrentX+2,leftCurrentY+2,keyWidth-4,height-4);     //fixme may have to modify this
        this.drawTree(newTree,[root_key,left_key]);
        rootCurrentY = root_y - yDistance * t;
        leftCurrentY = left_y + yDistance * t;
        rootCurrentX = root_x + rootXDistance * t;
        leftCurrentX = left_x + leftXDistance * t;
  
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(root_key,rootCurrentX+keyWidth/2,rootCurrentY+keyWidth/2);
        c.fillText(left_key,leftCurrentX+keyWidth/2,leftCurrentY+keyWidth/2);
      }, canvas.animInterval,
      () => {
        root_index = this.#getNodesAndKeysBehind(root_level,root)[1]; //fixme will this always work on a constantly changing tree?
        this.drawTree(newTree,[root_key,left_key])
        root_x = this.#getX(root,root_level,root_index,false,newTree) + keyWidth*root_key_index;
        root_y = this.#getY(root_level);
        left_x = this.#getX(left,left_level,left_index,false,newTree) + keyWidth*left_key_index;
        left_y = this.#getY(left_level);
        right_x = this.#getX(right,right_level,right_index,false,newTree) + keyWidth*right_key_index;
        right_y = this.#getY(right_level);
    
        width = root.keys.length * keyWidth;
        height = 40;
        if (root_level === 0) {
          root_x = root_x - (width / 2);
        }
    
        rootXDistance = right_x-root_x;
        leftXDistance = root_x-left_x;
        yDistance = root_y-left_y;
        rootXIncrement = rootXDistance/Math.abs(yDistance);
        leftXIncrement = leftXDistance/Math.abs(yDistance);

        rootCurrentX = root_x;
        rootCurrentY = root_y;
        leftCurrentX = left_x;
        leftCurrentY = left_y;
      });
      
  }

  static highlight(node, level, color, colorKey, key,tree,hold) {
    return new _Animation(Timing.linear,
      () => {}, canvas.animInterval,
      () => {
        let index = this.#getNodesAndKeysBehind(level,node)[1]; //fixme will this always work on a constantly changing tree?
        if(!hold){
          this.drawTree(tree);
        }
        let x = this.#getX(node, level, index, false,tree);
        let y = this.#getY(level);
        let width = node.keys.length * keyWidth;
        let height = 40;
        c.strokeStyle = color;
        c.fillStyle = color;
        if (level === 0) {
          x = x - (width / 2);
        }
        c.strokeRect(x, y, width, height);
        this.#setFont();
        for (let i = 0; i < node.keys.length; i++) {
          c.textAlign = "center";
          if (!colorKey) {
            c.strokeStyle = "black";
            c.fillStyle = "black";
            c.fillText(node.keys[i], x + keyWidth / 2 + i * keyWidth,
                y + height / 2);
          } else if (node.keys[i] === key) {
            c.fillText(node.keys[i], x + keyWidth / 2 + i * keyWidth,
                y + height / 2);
          }
        }
      });
  }

  static removeLeafKey(node,level,index,tree){
    return new _Animation(Timing.linear,
      () => {}, canvas.animInterval,
      () => {
        this.drawTree(tree);
      });
  }

  static transferSuccessor(root, root_level,successor,successor_level,root_key_index,tree){
    let root_index;
    let root_x;
    let root_y ;
    let successor_index ;
    let successor_x;
    let successor_y ;
    let width;
    let height;

    let xDistance;
    let yDistance;
    let xIncrement ;
    let currentY ;
    let currentX;
    return new _Animation(Timing.linear,
      (t) => {
        c.clearRect(currentX+2,currentY+2,keyWidth-4,height-4);     //fixme may have to modify this
        this.drawTree(tree);
        c.fillStyle = "white";
        c.fillRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space

        //c.clearRect(successor_x+2,successor_y+2,keyWidth-4,height-4);     //fixme may have to modify this
        currentY = successor_y - yDistance * t;
        currentX = successor_x + xDistance * t;
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(successor.keys[0],currentX+keyWidth/2,currentY+keyWidth/2);
      }, canvas.animInterval,
      () => {
        root_index = this.#getNodesAndKeysBehind(root_level,root)[1]; //fixme will this always work on a constantly changing tree?
        root_x = this.#getX(root,root_level,root_index,false,tree)+keyWidth*root_key_index;
        root_y = this.#getY(root_level);
        successor_index = this.#getNodesAndKeysBehind(successor_level,successor)[1];
        successor_x = this.#getX(successor,successor_level,successor_index,false,tree);
        successor_y = this.#getY(successor_level);
        width = root.keys.length * keyWidth;
        height = 40;
        if (root_level === 0) {
          root_x = root_x - (width / 2);
        }
        c.fillStyle = "white";
        c.fillRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space
        //animationQueue.push(function() {Animations.highlight(successor,successor_level,successor_index,"red", false,successor.keys[0],tree)});

        //move number to the root
        xDistance = root_x - successor_x;
        yDistance = Math.abs(root_y - successor_y);
        xIncrement = xDistance/Math.abs(yDistance);
        currentY = successor_y;
        currentX = successor_x;
      });
  }

  static transferPredecessor(root, root_level,predecessor,predecessor_level,root_key_index,predecessor_key_index,tree){
    let root_index;
    let root_x;
    let root_y;
    let predecessor_index ;
    let predecessor_x;
    let predecessor_y;
    let width;
    let height;
    let xDistance;
    let yDistance;
    let xIncrement;
    let currentY;
    let currentX;

    return new _Animation(Timing.linear,
      (t) => {
        if (currentY <= root_y) {
          clearInterval(ref);
          return;
        }
        c.clearRect(currentX+2,currentY+2,keyWidth-4,height-4);     //fixme may have to modify this
        this.drawTree(tree);
        c.fillStyle = "white";
        c.fillRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space
        //c.clearRect(predecessor_x+2,predecessor_y+2,keyWidth-4,height-4);     //fixme may have to modify this
        currentY = predecessor_y - yDistance * t;
        currentX = predecessor_x + xDistance * t;
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(predecessor.keys[predecessor.keys.length-1],currentX+keyWidth/2,currentY+keyWidth/2);
        //c.fillText(predecessor.keys[predecessor.keys.length-1],predecessor_x+keyWidth/2,predecessor_y+keyWidth/2);
      }, canvas.animInterval,
      () => {
        root_index = this.#getNodesAndKeysBehind(root_level,root)[1]; //fixme will this always work on a constantly changing tree?
        root_x = this.#getX(root,root_level,root_index,false,tree)+keyWidth*root_key_index;
        root_y = this.#getY(root_level);
        predecessor_index = this.#getNodesAndKeysBehind(predecessor_level,predecessor)[1];
        predecessor_x = this.#getX(predecessor,predecessor_level,predecessor_index,false,tree)+keyWidth*predecessor_key_index;
        predecessor_y = this.#getY(predecessor_level);
        width = root.keys.length * keyWidth;
        height = 40;
        if (root_level === 0) {
          root_x = root_x - (width / 2);
        }
        //animationQueue.push(function() {Animations.highlight(predecessor,predecessorLevel,,"red", false,key,tempTree)});
        c.fillStyle = "white";
        c.fillRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space
        //animationQueue.push(function() {Animations.highlight(successor,successor_level,successor_index,"red", false,successor.keys[0],tree)});

        //move number to the root
        xDistance = root_x - predecessor_x;
        yDistance = Math.abs(root_y - predecessor_y);
        xIncrement = xDistance/Math.abs(yDistance);
        currentY = predecessor_y;
        currentX = predecessor_x;
      });
  }

  static drawTree(tree,_excludeKey = null,ignoreRoot = false,_emptyLevel = -1, _emptyIndex = -1) {
    excludedKey = _excludeKey;
    if(_excludeKey === [0]){
      let hi = 6;
    }
    emptyLevel = _emptyLevel;
    emptyIndex = _emptyIndex;
      c.clearRect(0, 0, canvas.width, canvas.height);
    if(tree.root && tree.root.keys.length > 0 || ignoreRoot){
      c.strokeStyle = "black";
      c.fillStyle = "black";
      nodesInsertedPerLevel.length = 0;
      keysInsertedPerLevel.length = 0;
      keysAtLevel.length = 0;
      this.#drawNode(0, 0, 0, tree.root, 0, 0,tree,ignoreRoot);
      excludedKey = null;
      emptyLevel = -1;
      emptyIndex = -1;
    }
  }

  static moveDownLevel(tree,node,level,index){
    let x_pos;
    let y_pos;
    let goalY;
    let width;
    let height;
    
    return new _Animation(Timing.linear,
      (t) => {
        let y = y_pos + (goalY - y_pos) * t;
        this.drawTree(tree,[node.keys[index]]);
        c.fillText(node.keys[index], x_pos + keyWidth / 2,
            y + height / 2);
        c.textAlign = "center"
      }, canvas.animInterval,
      () => {
        x_pos = this.#getX(node,level,false,tree);
        y_pos = this.#getY(level);
        goalY = this.#getY(level+1);
        width = node.keys.length * keyWidth;
        height = 40;
        if (level === 0) {
          x_pos = x_pos - (width / 2);
        }
      });
  }

  static #getX(node, level, index, isInserting,tree) {
    if (level === 0) {
      return SCREEN_WIDTH / 2;
    } else {
      keysPerLevel.length = 0;
      nodesPerLevel.length = 0;
      this.#calculateKeysPerLevel(tree.root, 0);
      let maxLevel = keysPerLevel.length - 1;
      let maxLevelWidth = keysPerLevel[maxLevel] * keyWidth
          + (nodesPerLevel[maxLevel] - 1) * (nodeSpacing);
      if (level === maxLevel) {
        let leftSide = (SCREEN_WIDTH - maxLevelWidth) / 2;
        if (isInserting) {
          if (keysInsertedPerLevel.length > level) {
            return leftSide + nodeSpacing * index + keysInsertedPerLevel[level]
                * keyWidth;
          } else {
            return leftSide + nodeSpacing * index;
          }
        } else {
          let keysBehind = 0
          let nodesBehind = 0;
          let results = this.#getNodesAndKeysBehind(level,node);
          keysBehind = results[0];
          nodesBehind = results[1];
          return leftSide + nodeSpacing * nodesBehind + keyWidth * keysBehind;
        }
      } else {
        let quadrantWidth = (maxLevelWidth / nodesPerLevel[level])
        let quandrantCenter = quadrantWidth / 2;
        return (SCREEN_WIDTH - maxLevelWidth) / 2 + quadrantWidth * index
            + quandrantCenter - (node.keys.length * (keyWidth / 2));
      }
    }
  }

  static #getNodesAndKeysBehind(level,node){
    let keysBehind = 0
    let nodesBehind = 0;
    loop1:
        for (let i = 0; i < keysAtLevel[level].length; i++) {
          for (let j = 0; j < keysAtLevel[level][i].length; j++) {
            if (keysAtLevel[level][i][j] !== node.keys[0]) {
              keysBehind++;
            } else {
              break loop1;
            }
          }
          nodesBehind++;
        }
        return [keysBehind,nodesBehind];
  }

  static #getY(level) {
    let paddingTop = .05;
    let nodeHeight = .2;
    return (level * nodeHeight * SCREEN_HEIGHT) + paddingTop
        * SCREEN_HEIGHT;
  }

  static #drawNode(level, index, start, node, parentX, parentY,tree,ignoreRoot) {
    if (level === nodesInsertedPerLevel.length) {
      nodesInsertedPerLevel[level] = 1;
    } else {
      nodesInsertedPerLevel[level]++;
    }
    //draw node
    let dimensions = this.#drawRect(level, index, start, node, parentX,
        parentY,tree,ignoreRoot);
    let pX = dimensions[0];
    let pY = dimensions[1];

    let _start = 0;
    if (nodesInsertedPerLevel.length > level + 1) {   //have visited this level already
      _start = nodesInsertedPerLevel[level + 1];
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      this.#drawNode(level + 1, i, _start, node.childNodes[i], pX, pY,tree,ignoreRoot);
    }
  }

  static #setFont() {
    let width = SCREEN_WIDTH;
    let ratio = .015;
    c.textBaseline = "middle";
    c.font = 'bold ' + (width * ratio) + 'px sans-serif';
  }

  static #calculateKeysPerLevel(node, level) {
    if (level === nodesPerLevel.length) {
      nodesPerLevel[level] = 1;
      keysPerLevel[level] = 1;
    } else {
      nodesPerLevel[level]++;
      keysPerLevel[level] += node.keys.length;
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      this.#calculateKeysPerLevel(node.childNodes[i], level + 1);
    }
  }

  static #drawRect(level, index, start, node, parentX, parentY,tree,ignoreRoot) {
    let x_pos = this.#getX(node, level, index + start, true,tree);
    let y_pos = this.#getY(level, index + start);
    let width = node.keys.length * keyWidth;
    let height = 40;
    if (level === 0) {
      x_pos = x_pos - (width / 2);
    }
    c.fillStyle = "blue";
    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.fillRect(x_pos, y_pos, width, height);
    c.strokeRect(x_pos, y_pos, width, height);
    this.#setFont();
    for (let i = 0; i < node.keys.length; i++) {
      c.textAlign = "center";
      if(excludedKey === null || !excludedKey.includes(node.keys[i])){
        c.beginPath();
        c.arc(x_pos + keyWidth / 2 + i * keyWidth, y_pos + height / 2, 15, 0, Math.PI * 2, true);
        c.fillStyle = 'white';
        c.fill();
        c.fillStyle = "black";
        c.fillText(node.keys[i], x_pos + keyWidth / 2 + i * keyWidth,
            y_pos + height / 2, 25);
      }
    }
    //draw Line
    if ((parentX !== 0 && parentY !== 0)) {
      c.beginPath();
      c.moveTo(x_pos + width / 2, y_pos);
      c.lineTo(parentX + index * keyWidth, parentY + height);
      c.stroke();
    }
    if (level === keysInsertedPerLevel.length) {
      keysInsertedPerLevel[level] = node.keys.length;
    } else {
      keysInsertedPerLevel[level] += node.keys.length;
    }
    if (level === keysAtLevel.length) {
      keysAtLevel[level] = [];
    }
    keysAtLevel[level].push(node.keys);
    return [x_pos, y_pos];
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

return BTreeAnims;
})();

