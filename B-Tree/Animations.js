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
let keysPerLevel = [0];
let nodesPerLevel = [0];
let nodesInsertedPerLevel = [0]
let keysInsertedPerLevel = [0];

class Animations{
  static highlight(level,index){

  }
  static drawTree(tree){
    nodesInsertedPerLevel.length = 0;
    this.#drawNode(0,0,0,tree.root,0,0);
  }

  static #getX(node,level,index){
    if(level === 0){
      return screen.availWidth/2;
    }
    else{
      keysPerLevel.length = 0;
      nodesPerLevel.length = 0;
      this.#calculateKeysPerLevel(b_tree.root,0);
      let maxLevel = keysPerLevel.length-1;
      let maxLevelWidth = keysPerLevel[maxLevel]*keyWidth + (nodesPerLevel[maxLevel]-1)*(nodeSpacing);
      if(level === maxLevel){
        let leftSide = (screen.availWidth-maxLevelWidth)/2;
        if(keysInsertedPerLevel.length > level){
          return leftSide + nodeSpacing*index + keysInsertedPerLevel[level]*keyWidth;
        }
        else{
          return leftSide + nodeSpacing*index;
        }

      }
      else{
        let quadrantWidth = (maxLevelWidth/nodesPerLevel[level])
        let quandrantCenter = quadrantWidth/2;
        return (screen.availWidth-maxLevelWidth)/2 + quadrantWidth*index+quandrantCenter-(node.keys.length*(keyWidth/2));
      }
    }
  }

  static #getY(level){
    let paddingTop = .05;
    let nodeHeight = .09;
    return (level*nodeHeight*screen.availHeight)+paddingTop*screen.availHeight;
  }

  static #drawNode(level, index, start, node,parentX,parentY){
    if(level === nodesInsertedPerLevel.length){
      nodesInsertedPerLevel[level] = 1;
    }
    else{
      nodesInsertedPerLevel[level]++;
    }
    //draw node
      let dimensions = this.#drawRect(level,index,start,node,parentX,parentY);
      let pX = dimensions[0];
      let pY = dimensions[1];

      let _start = 0;
      if (nodesInsertedPerLevel.length > level + 1){   //have visited this level already
        _start = nodesInsertedPerLevel[level+1];
      }
      for(let i = 0; i < node.childNodes.length; i++){
        this.#drawNode(level+1,i, _start,node.childNodes[i],pX,pY);
      }
  }

  static #setFont(){
    let width = screen.availWidth;
    let ratio = .015;
    c.textBaseline = "middle";
    c.font =  (width*ratio) + 'px Arial';
  }

  static #calculateKeysPerLevel(node,level){
    if(level === nodesPerLevel.length){
      nodesPerLevel[level] = 1;
      keysPerLevel[level] = 1;
    }
    else{
      nodesPerLevel[level]++;
      keysPerLevel[level] += node.keys.length;
    }
    for(let i = 0; i < node.childNodes.length;i++){
      this.#calculateKeysPerLevel(node.childNodes[i],level+1);
    }
  }

  static #drawRect(level,index,start,node, parentX, parentY){
    let x_pos = this.#getX(node,level,index+start);
    let y_pos = this.#getY(level,index+start);
    let width = node.keys.length*keyWidth;
    let height = 40;
    if(level === 0){
      x_pos = x_pos-(width/2);
    }
    c.strokeRect(x_pos,y_pos,width,height);
    this.#setFont();
    for(let i = 0; i < node.keys.length; i++){
      c.textAlign = "center";
      c.fillText(node.keys[i],x_pos + keyWidth / 2 + i*keyWidth,y_pos+height/2);
    }
    //draw Line
    if(parentX !== 0 && parentY !== 0){
      c.beginPath();
      c.moveTo(x_pos+width/2,y_pos);
      c.lineTo(parentX+index*keyWidth,parentY+height);
    }
    c.stroke();
    if(level === keysInsertedPerLevel.length){
      keysInsertedPerLevel[level] = node.keys.length;
    }
    else{
      keysInsertedPerLevel[level] += node.keys.length;
    }
    return [x_pos,y_pos];
  }
}

//help
