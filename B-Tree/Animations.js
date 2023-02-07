// getting a reference to our HTML element
const canvas = document.getElementById("b_tree_canvas")

SCREEN_WIDTH = 1920;
SCREEN_HEIGHT = 1080;

//initiate 2d context
const c = canvas.getContext('2d');

let animationQueue = [];              //queue to hold all the animations
canvas.width = screen.availWidth;
canvas.height = screen.availHeight;

let keyWidth = .025 *screen.availWidth;
let nodeSpacing = 0.01*screen.availWidth
let keysAtLevel = [];
let keysPerLevel = [0];
let nodesPerLevel = [0];
let nodesInsertedPerLevel = [0]
let keysInsertedPerLevel = [0];
let excludedKey;
let emptyLevel;
let emptyIndex;

class Animations {
  static runQueue(pauseTime) {
    let i = 0;
    let ref = setInterval(() => {
      if (i === animationQueue.length) {
        clearInterval(ref);
        return;
      }
      //this.drawTree(tree);
      animationQueue[i]();
      i++;
    }, pauseTime);
  }

  static highlight(node, level, index, color, colorKey, key,tree,hold) {
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
  }

  static removeLeafKey(node,level,index,tree){
    this.drawTree(tree);
  }

  static async transferSuccessor(root, root_level,root_index,successor,successor_level,tree){
    let root_x = this.#getX(root,root_level,root_index,false,tree);
    let root_y = this.#getY(root_level);
    let successor_index = this.#getNodesAndKeysBehind(successor_level,successor)[1];
    let successor_x = this.#getX(successor,successor_level,successor_index,false,tree);
    let successor_y = this.#getY(successor_level);
    let width = root.keys.length * keyWidth;
    let height = 40;
    if (root_level === 0) {
      root_x = root_x - (width / 2);
    }
    c.clearRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space
    //animationQueue.push(function() {Animations.highlight(successor,successor_level,successor_index,"red", false,successor.keys[0],tree)});

    //move number to the root
    let xDistance = root_x - successor_x;
    let yDistance = root_y - successor_y;
    let xIncrement = xDistance/Math.abs(yDistance);
    let currentY = successor_y;
    let currentX = successor_x;
    let ref = setInterval(() => {
      if (currentY <= root_y) {
        clearInterval(ref);
        return;
      }
      c.clearRect(currentX+2,currentY+2,keyWidth-4,height-4);     //fixme may have to modify this
      this.drawTree(tree);
      c.clearRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space

      //c.clearRect(successor_x+2,successor_y+2,keyWidth-4,height-4);     //fixme may have to modify this
      currentY -= 1;
      currentX += xIncrement;
      c.textAlign = "center"
      c.fillStyle = "red"
      c.fillText(successor.keys[0],currentX+keyWidth/2,currentY+keyWidth/2);
    }, 10);
  }

  static async transferPredecessor(root, root_level,root_index,predecessor,predecessor_level,key_index,tree){
    let root_x = this.#getX(root,root_level,root_index,false,tree);
    let root_y = this.#getY(root_level);
    let predecessor_index = this.#getNodesAndKeysBehind(predecessor_level,predecessor)[1];
    let predecessor_x = this.#getX(predecessor,predecessor_level,predecessor_index,false,tree)+keyWidth*key_index;
    let predecessor_y = this.#getY(predecessor_level);
    let width = root.keys.length * keyWidth;
    let height = 40;
    if (root_level === 0) {
      root_x = root_x - (width / 2);
    }
    //animationQueue.push(function() {Animations.highlight(predecessor,predecessorLevel,,"red", false,key,tempTree)});
    c.clearRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space
    //animationQueue.push(function() {Animations.highlight(successor,successor_level,successor_index,"red", false,successor.keys[0],tree)});

    //move number to the root
    let xDistance = root_x - predecessor_x;
    let yDistance = root_y - predecessor_y;
    let xIncrement = xDistance/Math.abs(yDistance);
    let currentY = predecessor_y;
    let currentX = predecessor_x;
    let ref = setInterval(() => {
      if (currentY <= root_y) {
        clearInterval(ref);
        return;
      }
      c.clearRect(currentX+2,currentY+2,keyWidth-4,height-4);     //fixme may have to modify this
      this.drawTree(tree);
      c.clearRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space
      //c.clearRect(predecessor_x+2,predecessor_y+2,keyWidth-4,height-4);     //fixme may have to modify this
      currentY -= 1;
      currentX += xIncrement;
      c.textAlign = "center"
      c.fillStyle = "red"
      c.fillText(predecessor.keys[predecessor.keys.length-1],currentX+keyWidth/2,currentY+keyWidth/2);
      //c.fillText(predecessor.keys[predecessor.keys.length-1],predecessor_x+keyWidth/2,predecessor_y+keyWidth/2);
    }, 10);
  }

  static drawTree(tree,_excludeKey = null,ignoreRoot = false,_emptyLevel = -1, _emptyIndex = -1) {
    excludedKey = _excludeKey;
    emptyLevel = _emptyLevel;
    emptyIndex = _emptyIndex;
      c.clearRect(0, 0, canvas.width, canvas.height);
    if(tree.root && tree.root.keys.length > 0 || ignoreRoot){
      c.strokeStyle = "black";
      c.fillStyle = "black";
      nodesInsertedPerLevel.length = 0;
      keysInsertedPerLevel.length = 0;
      keysAtLevel.length = 0;
      this.#drawNode(0, 0, 0, tree.root, 0, 0,tree);
      excludedKey = null;
      emptyLevel = -1;
      emptyIndex = -1;
    }
  }

  static moveDownLevel(tree,node,level,index){
    let x_pos = this.#getX(node,level,false,tree);
    let y_pos = this.#getY(level);
    let goalY = this.#getY(level+1);
    let width = node.keys.length * keyWidth;
    let height = 40;
    if (level === 0) {
      x_pos = x_pos - (width / 2);
    }
    let ref = setInterval(() => {
      if (y_pos >= goalY) {
        clearInterval(ref);
        return;
      }
      this.drawTree(tree,node.keys[index]);
      c.fillText(node.keys[index], x_pos + keyWidth / 2,
          y_pos + height / 2);
      y_pos++;
      c.textAlign = "center"
    }, 10);
  }


  static #getX(node, level, index, isInserting,tree) {
    if (level === 0) {
      return screen.availWidth / 2;
    } else {
      keysPerLevel.length = 0;
      nodesPerLevel.length = 0;
      this.#calculateKeysPerLevel(tree.root, 0);
      let maxLevel = keysPerLevel.length - 1;
      let maxLevelWidth = keysPerLevel[maxLevel] * keyWidth
          + (nodesPerLevel[maxLevel] - 1) * (nodeSpacing);
      if (level === maxLevel) {
        let leftSide = (screen.availWidth - maxLevelWidth) / 2;
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
        return (screen.availWidth - maxLevelWidth) / 2 + quadrantWidth * index
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
    let nodeHeight = .09;
    return (level * nodeHeight * screen.availHeight) + paddingTop
        * screen.availHeight;
  }

  static #drawNode(level, index, start, node, parentX, parentY,tree) {
    if (level === nodesInsertedPerLevel.length) {
      nodesInsertedPerLevel[level] = 1;
    } else {
      nodesInsertedPerLevel[level]++;
    }
    //draw node
    let dimensions = this.#drawRect(level, index, start, node, parentX,
        parentY,tree);
    let pX = dimensions[0];
    let pY = dimensions[1];

    let _start = 0;
    if (nodesInsertedPerLevel.length > level + 1) {   //have visited this level already
      _start = nodesInsertedPerLevel[level + 1];
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      this.#drawNode(level + 1, i, _start, node.childNodes[i], pX, pY,tree);
    }
  }

  static #setFont() {
    let width = screen.availWidth;
    let ratio = .015;
    c.textBaseline = "middle";
    c.font = (width * ratio) + 'px Arial';
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

  static #drawRect(level, index, start, node, parentX, parentY,tree) {
    let x_pos = this.#getX(node, level, index + start, true,tree);
    let y_pos = this.#getY(level, index + start);
    let width = node.keys.length * keyWidth;
    let height = 40;
    if (level === 0) {
      x_pos = x_pos - (width / 2);
    }
    c.strokeRect(x_pos, y_pos, width, height);
    this.#setFont();
    for (let i = 0; i < node.keys.length; i++) {
      c.textAlign = "center";
      if(node.keys[i] !== excludedKey){
        c.fillText(node.keys[i], x_pos + keyWidth / 2 + i * keyWidth,
            y_pos + height / 2);
      }
    }
    //draw Line
    if (parentX !== 0 && parentY !== 0) {
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