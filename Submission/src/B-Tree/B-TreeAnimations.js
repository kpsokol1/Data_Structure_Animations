var BTreeAnims = (() => {
// getting a reference to our HTML element

//global variables
let canvas;                                       //canvas to draw on
let c;

//default screen width and height in pixels
SCREEN_WIDTH = 1280;
SCREEN_HEIGHT = 540;

let keyWidth = .05 * SCREEN_WIDTH;            //width of each key in a node
let nodeSpacing = 0.02 * SCREEN_WIDTH;        //spacing between each key in a node
let keysAtLevel = [];                         //list of keys at each level
let keysPerLevel = [0];                       //number of keys per level
let nodesPerLevel = [0];                      //number of nodes per level
let nodesInsertedPerLevel = [0]               //running list of nodes inserted at a level
let keysInsertedPerLevel = [0];               //running list of keys inserted at a level
let excludedKey = [];                         //list of keys to not redraw
let emptyLevel;                               //holds level that had no values
let emptyIndex;                               //holds index that no longer has a vale

//class that performs all the B-Tree animations
class BTreeAnims {

  //setup the canvas to draw our animations/tree on
  static setCanvas(_canvas) {
    canvas = _canvas;
    c = _canvas.layer1;

    canvas.scale(
      canvas.width / SCREEN_WIDTH,
      canvas.height / SCREEN_HEIGHT
    );
  }

  //runs the animations in the animation queue (pause time is the time interval between animations)
  static runQueue(pauseTime) {
    let i = 0;
    let ref = setInterval(async() => {
      if (i === animationQueue.length) {          //stop the animations once we are at the end
        clearInterval(ref);
        animationQueue.length = 0;
        return;
      }
      await animationQueue[i]();                  //run the animation
      i++;
    }, pauseTime);
  }

  //moves the entire tree/canvas up when we delete the root
  static moveCanvasUp(tree,level,index){
    let y0 = this.#getY(1);                 //old y position on the screen
    let y1 = this.#getY(0);                 //new y position on the screen

    return new _Animation(Timing.linear,
      (t) => {
        c.save();
        c.translate(0,(y1 - y0) * t);           //move the canvas incrementally
        canvas.clear();
        this.drawTree(tree,null,true,level,index);    //redraw the tree in the new location
        c.clearRect(canvas.width/2-2,0,20,y0-1);              //get rid of trailing root line pointer
        c.restore();
      }, canvas.animInterval);
  }

  //moves a root down during the merge process
  static moveRootDown(oldTree,root,newTree,root_key,root_level,root_key_index,child_node,child_node_level,child_node_index,child_node_key_index){
    //global variables
    let root_index;         //the index in the node the root is at
    let root_x;             //the x position of the root node
    let root_y;             //the y position of the root node
    let child_x;            //the x position of the child to move the root into
    let child_y;            //the y position of the child to move the root into
    let width;              //holds the width of the node
    let height;             //the desired height of the node

    let xDistance;          //the distance along the x-axis the root needs to travel to to get to its new destination
    let yDistance;          //the distance along the y-axis the root needs to travel to to get to its new destination
    let xIncrement;         //how much we want to move the node in each frame
    let currentY;           //current x position of the node
    let currentX;           //current y position of the node

    return new _Animation(Timing.linear,
      (t) => {
        c.clearRect(currentX+2,currentY+2,keyWidth-4,height-4);     //clear the node to begin
        this.drawTree(newTree,[root_key]);                            //redraw the tree without the root node we are trying to move
        currentY = root_y + yDistance * t;                                      //increment the y value
        currentX = root_x + xDistance * t;                                      //increment the x value

        //redraw the text inside of the node
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(root_key,currentX+keyWidth/2,currentY+keyWidth/2);
      }, canvas.animInterval,
      () => {
        root_index = this.#getNodesAndKeysBehind(root_level,root)[1];         //the index in the node the root is at by getting how many nodes are behind it at the level
        this.drawTree(newTree,[root_key]);                          //redraw the tree
        root_x = this.#getX(root,root_level,root_index,false,oldTree) + keyWidth * root_key_index;    //get the x value of the root
        root_y = this.#getY(root_level);                                                                      //get the y value of the root
        child_x = this.#getX(child_node,child_node_level,child_node_index,false,newTree) + keyWidth * child_node_key_index; //get the x coordinate of the child to merge into
        child_y = this.#getY(child_node_level);                                                                                      //get the y coordinate of the child to merge into
        width = root.keys.length * keyWidth;      //calculate the width of the node
        height = 40;                              //set the height of the node to 40 pixels
        if (root_level === 0) {                   //readjust root to the center of the screen
          root_x = root_x - (width / 2);
        }

        //update distances to destination
        xDistance = child_x-root_x;
        yDistance = child_y-root_y;
        xIncrement = xDistance/Math.abs(yDistance);

        //update coordinates
        currentY = root_y;
        currentX = root_x;
      });
  }

  //splits a child node
  static splitChildNode(newTree, oldTree, oldRoot, newRoot, oldLevel, newLevel,oldKeyIndex,newKeyIndex,key){
    let oldIndex;                 //original position of the median to be split out
    let newIndex ;                //new position of the median to be split out
    let old_x;                    //old x position for child node
    let old_y;                    //old y position for the child node
    let new_x;                    //new x position for the child node
    let new_y;                    //new y position for the child node

    let width;                    //the width of the child node
    let height;                   //the desired height of the child node

    let xDistance;          //the distance along the x-axis the root needs to travel to to get to its new destination
    let yDistance;          //the distance along the y-axis the root needs to travel to to get to its new destination
    let xIncrement;         //how much we want to move the node in each frame
    let currentY;           //current x position of the node
    let currentX;           //current y position of the node

    return new _Animation(Timing.linear,
      (t) => {
        c.clearRect(currentX+2,currentY+2,keyWidth-4,height-4);     //erase the node to be split from the canvas
        this.drawTree(newTree,[key]);                                 //redraw the tree without the node to be split
        currentY = old_y + yDistance * t;                                       //increment x position
        currentX = old_x + xDistance * t;                                       //increment y position

        //draw the text inside the child node
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(key,currentX+keyWidth/2,currentY+keyWidth/2);
      }, canvas.animInterval, 
      () => {
        oldIndex = this.#getNodesAndKeysBehind(oldLevel,oldRoot)[1];            //calculate old index
        newIndex = this.#getNodesAndKeysBehind(newLevel,newRoot)[1];            //calculate new index
        old_x = this.#getX(oldRoot,oldLevel,oldIndex,false,oldTree) + keyWidth * oldKeyIndex; //calculate old x
        old_y = this.#getY(oldLevel); //calcuate old y
        new_x = this.#getX(newRoot, newLevel,newIndex,false,newTree) + keyWidth * newKeyIndex; //calculate new x
        new_y = this.#getY(newLevel); //calculate old y

        width = newRoot.keys.length * keyWidth;   //the width of the child node
        height = 40;  //the desired height of the node

        if (newLevel === 0) {           //put root in the middle of the screen
          new_x = new_x - (width / 2);
        }

        //update distances to the destination
        xDistance = new_x-old_x;
        yDistance = new_y-old_y;
        xIncrement = xDistance/Math.abs(yDistance);

        //update positions
        currentY = old_y;
        currentX = old_x;
      });
  }

  //splits a root node and increases the height of the tree
  static splitRoot(oldTree,root){
    //move whole canvas down
    let y0 ;          //y position of level 0
    let y1;           //y position of level 1
    return new _Animation(Timing.linear,
      (t) => {
        c.save();
        c.clearRect(0, 0, canvas.width, canvas.height);   //clear the screen
        c.translate(0,(y1 - y0) * t);                           //incrementally move the screen down
        this.drawTree(oldTree);                                 //redraw the tree
        c.clearRect(canvas.width/2-2,0,20,y0-1);    //remove junk above the tree
        c.restore();
      }, canvas.animInterval,
      () => {
        y0 = this.#getY(0);     //get y coordinate of level we are moving from
        y1 = this.#getY(1);     //get y coordinate of level we are moving too
      },
      () => {
        c.translate(0,(y1 - y0));   //adjust the coordinate system back to normal
      });
  }

  //brings a key from a lower level and brings it up to the root, during a preemptive split
  static extracted(oldTree, leftCutoff, rightCutoff, root, key) {
      let width;            //width of the node
      let x_pos;            //x position of the node to extract from
      let y_pos;            //y position of the node to extract from
      let height;           //desired height of the node
      let goalY;            //y position of where the extracted key will go to
      let currentY;         //current y position of the node to be moved

      return new _Animation(Timing.linear,
        (t) => {
          c.lineWidth = 2;
          c.clearRect(x_pos + leftCutoff * keyWidth - 2, currentY, keyWidth + 4,      //erase the key to be moved
              height + 2);

          //draw lines around where the key was removed from to indicate the new nodes being formed
          c.beginPath();                                                        //draw left line
          c.moveTo(x_pos + leftCutoff * keyWidth, y_pos);
          c.lineTo(x_pos + leftCutoff * keyWidth, y_pos + height);
          c.strokeStyle = "black"
          c.stroke();

          c.beginPath();                                                        //draw right line
          c.moveTo(x_pos + rightCutoff * keyWidth, y_pos);
          c.lineTo(x_pos + rightCutoff * keyWidth, y_pos + height);
          c.strokeStyle = "black"
          c.stroke();

          currentY = y_pos + (goalY - y_pos) * t;                               //update y position
          c.fillStyle = "blue";

          //draw the node in it's new position
          c.fillRect(x_pos + leftCutoff * keyWidth, currentY, keyWidth, height);
          c.strokeRect(x_pos + leftCutoff * keyWidth, currentY, keyWidth, height);
          c.beginPath();
          c.arc(x_pos + keyWidth / 2 + keyWidth, currentY + height / 2, 15, 0, Math.PI * 2, true); //make the key look like a billiard ball
          c.fillStyle = 'white';
          c.fill();
          c.textAlign = "center";
          c.fillStyle = "black";

          //put the value in the node in its new position
          c.fillText(root.keys[root.t - 1],
            x_pos + leftCutoff * keyWidth + keyWidth / 2,
            currentY + height / 2);
      }, canvas.animInterval,
      () => {

        //initialize location parameters defined above
        width = root.keys.length * keyWidth;
        x_pos = this.#getX(root, 0, 0, false,oldTree);
        x_pos = x_pos - (width / 2);
        y_pos = this.#getY(0);
        height = 40;
        goalY = this.#getY(-1);
        currentY = this.#getY(0);

        //draw the tree
        this.drawTree(oldTree,key);
        //clear the node to be moved
          c.clearRect(x_pos + leftCutoff * keyWidth, this.#getY(0) - 2, keyWidth,
              height);
      },
      () => {
        c.translate(0, this.#getY(0) - this.#getY(1));   //make sure the coordinate system is correct
      });
  }

  //a left rotation is performed when we borrow from the right child
  static leftRotate(newTree,root,left,right,root_key,right_key,left_index,right_index,root_level,left_level,right_level,root_key_index,left_key_index,right_key_index){
    let root_index;                   //index of the root node
    let root_x;                       //x coordinate of the root node
    let root_y;                       //y coordinate of the root node
    let left_x;                       //x coordinate of the left child
    let left_y;                       //y coordinate of the left child
    let right_x;                      //x coordinate of the right child
    let right_y;                      //y coordinate of right child

    let width;                        //used to hold the width of a node
    let height;                       //height of node

    let rootXDistance;                //root's xDistance from current to final position
    let rightXDistance;               //right's xDistance from current to final position
    let yDistance;                    //y distance between root and children
    let rootXIncrement;               //how much to move root each frame
    let rightXIncrement;              //how much to move the right child each frame
    let rootCurrentX;                 //current x position of the root key
    let rootCurrentY;                 //current y position of the root key
    let rightCurrentX;                //current x position of the right key
    let rightCurrentY;                //current y position of the right key

    return new _Animation(Timing.linear,
      (t) => {
        if (rootCurrentY >= left_y) {           //if the root has arrived to the left child then we are done with the animation
          clearInterval(ref);
          this.drawTree(newTree);               //draw the new tree
          return;
        }
        c.clearRect(rootCurrentX+2,rootCurrentY+2,keyWidth-4,height-4);     //erase the root key
        c.clearRect(rightCurrentX+2,rightCurrentY+2,keyWidth-4,height-4);   //erase the right key
        this.drawTree(newTree,[root_key,right_key]);                          //redraw the tree without the root and right keys

        //calculate current positions of the root and right keys
        rootCurrentY = root_y - yDistance * t;
        rightCurrentY = right_y + yDistance * t;
        rootCurrentX = root_x + rootXDistance * t;
        rightCurrentX = right_x + rightXDistance * t;

        //redraw the root and right keys in their new positions for the frame
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(root_key,rootCurrentX+keyWidth/2,rootCurrentY+keyWidth/2);
        c.fillText(right_key,rightCurrentX+keyWidth/2,rightCurrentY+keyWidth/2);
      }, canvas.animInterval,
      () => {

        //calculate the initial coordinates of the root and right keys
        root_index = this.#getNodesAndKeysBehind(root_level,root)[1]; //fixme will this always work on a constantly changing tree?
        this.drawTree(newTree,[root_key,right_key])
        root_x = this.#getX(root,root_level,root_index,false,newTree) + keyWidth*root_key_index;
        root_y = this.#getY(root_level);
        left_x = this.#getX(left,left_level,left_index,false,newTree) + keyWidth*left_key_index;
        left_y = this.#getY(left_level);
        right_x = this.#getX(right,right_level,right_index,false,newTree) + keyWidth*right_key_index;
        right_y = this.#getY(right_level);

        width = root.keys.length * keyWidth;          //the width of the root node
        height = 40;                                  //the height of all nodes
        if (root_level === 0) {                       //make sure if this is the true root then it is in the middle of the screen
          root_x = root_x - (width / 2);
        }

        //calculate distances to the destination and initialize the increments
        rootXDistance = left_x-root_x;
        rightXDistance = root_x-right_x;
        yDistance = root_y-left_y;
        rootXIncrement = rootXDistance/Math.abs(yDistance);
        rightXIncrement = rightXDistance/Math.abs(yDistance);

        //set current coordinates for the root and right keys
        rootCurrentX = root_x;
        rootCurrentY = root_y;
        rightCurrentX = right_x;
        rightCurrentY = right_y;
      });
  }

  //a right rotation is performed when we borrow from the left child
  static rightRotate(newTree,root,left,right,root_key,left_key,left_index,right_index,root_level,left_level,right_level,root_key_index,left_key_index,right_key_index){
    let root_index;                   //index of the root node
    let root_x;                       //x coordinate of the root node
    let root_y;                       //y coordinate of the root node
    let left_x;                       //x coordinate of the left child
    let left_y;                       //y coordinate of the left child
    let right_x;                      //x coordinate of the right child
    let right_y;                      //y coordinate of right child

    let width;                        //used to hold the width of a node
    let height;                       //height of node
    
    let rootXDistance;                //root's xDistance from current to final position
    let leftXDistance;                //left's xDistance from current to final position
    let yDistance;                    //y distance between root and children
    let rootXIncrement ;              //how much to move root each frame
    let leftXIncrement;               //how much to move the left child each frame

    let rootCurrentX;                 //current x position of the root key
    let rootCurrentY;                 //current y position of the root key
    let leftCurrentX;                 //current x position of the right key
    let leftCurrentY;                 //current y position of the right key

    return new _Animation(Timing.linear,
      (t) => {
        if (rootCurrentY >= right_y) { //fixme may have to check both here
          clearInterval(ref);
          this.drawTree(newTree)
          return;
        }
        c.clearRect(rootCurrentX+2,rootCurrentY+2,keyWidth-4,height-4);     //erase the root key
        c.clearRect(leftCurrentX+2,leftCurrentY+2,keyWidth-4,height-4);     //erase the left key
        this.drawTree(newTree,[root_key,left_key]);                           //redraw the tree

        //calculate current positions of the root and left keys
        rootCurrentY = root_y - yDistance * t;
        leftCurrentY = left_y + yDistance * t;
        rootCurrentX = root_x + rootXDistance * t;
        leftCurrentX = left_x + leftXDistance * t;

        //redraw the root and left keys in their new positions for the frame
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(root_key,rootCurrentX+keyWidth/2,rootCurrentY+keyWidth/2);
        c.fillText(left_key,leftCurrentX+keyWidth/2,leftCurrentY+keyWidth/2);
      }, canvas.animInterval,
      () => {

        //calculate the initial coordinates of the left and root keys
        root_index = this.#getNodesAndKeysBehind(root_level,root)[1]; //fixme will this always work on a constantly changing tree?
        this.drawTree(newTree,[root_key,left_key])
        root_x = this.#getX(root,root_level,root_index,false,newTree) + keyWidth*root_key_index;
        root_y = this.#getY(root_level);
        left_x = this.#getX(left,left_level,left_index,false,newTree) + keyWidth*left_key_index;
        left_y = this.#getY(left_level);
        right_x = this.#getX(right,right_level,right_index,false,newTree) + keyWidth*right_key_index;
        right_y = this.#getY(right_level);
    
        width = root.keys.length * keyWidth;                  //the width of the root node
        height = 40;                                          //the height of all nodes
        if (root_level === 0) {                               //make sure if this is the true root that it is in the center of the screen
          root_x = root_x - (width / 2);
        }

        //calculate distances to the destination and initialize the increments
        rootXDistance = right_x-root_x;
        leftXDistance = root_x-left_x;
        yDistance = root_y-left_y;
        rootXIncrement = rootXDistance/Math.abs(yDistance);
        leftXIncrement = leftXDistance/Math.abs(yDistance);

        //set current coordinates for the root and left keys
        rootCurrentX = root_x;
        rootCurrentY = root_y;
        leftCurrentX = left_x;
        leftCurrentY = left_y;
      });
      
  }

  //higlights a node/key
  static highlight(node, level, color, colorKey, key,tree,hold) {
    return new _Animation(Timing.linear,
      () => {}, canvas.animInterval,
      () => {
        let index = this.#getNodesAndKeysBehind(level,node)[1];         //get the index of the node to highlight
        if(!hold){                                                      //redraw the tree unless we want to persist some highlights like during the merge operation
          this.drawTree(tree);
        }

        //x and y coordinates of the node to highlight
        let x = this.#getX(node, level, index, false,tree);
        let y = this.#getY(level);

        //width and height of the node to highlight
        let width = node.keys.length * keyWidth;
        let height = 40;

        //set the higlight color to the desired color
        c.strokeStyle = color;
        c.fillStyle = color;

        //make sure the root is in the center of the screen
        if (level === 0) {
          x = x - (width / 2);
        }
        c.strokeRect(x, y, width, height);                            //highlight the node
        this.#setFont();
        for (let i = 0; i < node.keys.length; i++) {
          c.textAlign = "center";
          if (!colorKey) {                                            //make sure all other keys except the desired ones are black and not highlighted
            c.strokeStyle = "black";
            c.fillStyle = "black";
            c.fillText(node.keys[i], x + keyWidth / 2 + i * keyWidth,
                y + height / 2);
          } else if (node.keys[i] === key) {                        //highlight keys
            c.fillText(node.keys[i], x + keyWidth / 2 + i * keyWidth,
                y + height / 2);
          }
        }
      });
  }

  //removes a key from a leaf
  static removeLeafKey(node,level,index,tree){
    return new _Animation(Timing.linear,
      () => {}, canvas.animInterval,
      () => {
        this.drawTree(tree);                    //just redraw the tree
      });
  }

  //moves a successor key up to its position during a delete operation
  static transferSuccessor(root, root_level,successor,successor_level,root_key_index,tree){
    let root_index;             //index of the location to move the successor to
    let root_x;                 //x position of the node to have the successor move to
    let root_y ;                //y position of the node to have the successor move to
    let successor_index ;       //index of the location of the successor
    let successor_x;            //the successor node x position
    let successor_y ;           //the successor node y position
    let width;                  //the width of the root node
    let height;                 //the height of all nodes

    let xDistance;              //the x distance the successor needs to move to its destination
    let yDistance;              //the y distance the successor needs to move to its destination
    let xIncrement ;            //how much to move the successor each frame
    let currentY ;              //current y position of the successor key
    let currentX;               //current x position of the successor key
    return new _Animation(Timing.linear,
      (t) => {
        if (currentY <= root_y) {
          clearInterval(ref);
          return;
        }
        c.clearRect(currentX+2,currentY+2,keyWidth-4,height-4);     //erase the successor key
        this.drawTree(tree);              //redraw the tree
        c.fillStyle = "white";
        c.fillRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space by drawing over it in white

        //update the current x and y values
        currentY = successor_y - yDistance * t;
        currentX = successor_x + xDistance * t;
        c.textAlign = "center"
        c.fillStyle = "red"
        c.fillText(successor.keys[0],currentX+keyWidth/2,currentY+keyWidth/2);      //draw the successor key in its new location
      }, canvas.animInterval,
      () => {

        //get the original x and y corrdinates of the root and the successor
        root_index = this.#getNodesAndKeysBehind(root_level,root)[1];
        root_x = this.#getX(root,root_level,root_index,false,tree)+keyWidth*root_key_index;
        root_y = this.#getY(root_level);
        successor_index = this.#getNodesAndKeysBehind(successor_level,successor)[1];
        successor_x = this.#getX(successor,successor_level,successor_index,false,tree);
        successor_y = this.#getY(successor_level);

        //get the width and height of the root node
        width = root.keys.length * keyWidth;
        height = 40;

        //make sure the true root is in the center of the screen
        if (root_level === 0) {
          root_x = root_x - (width / 2);
        }
        c.fillStyle = "white";
        c.fillRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space

        //move successor to the root by updating coordinates
        xDistance = root_x - successor_x;
        yDistance = Math.abs(root_y - successor_y);
        xIncrement = xDistance/Math.abs(yDistance);
        currentY = successor_y;
        currentX = successor_x;
      });
  }

  //moves a successor key up to its position during a delete operation
  static transferPredecessor(root, root_level,predecessor,predecessor_level,root_key_index,predecessor_key_index,tree){
    let root_index;                 //index of the location to move the successor to
    let root_x;                     //x position of the node to have the successor move to
    let root_y;                     //y position of the node to have the successor move to
    let predecessor_index ;         //the index location of the predecessor
    let predecessor_x;              //the x position of the predecessor
    let predecessor_y;              //the y position of the predecessor
    let width;                      //the width of the root node
    let height;                     //the height of all nodes
    let xDistance;                  //the x distance the predecessor needs to move
    let yDistance;                  //the y distance the predecessor needs to move
    let xIncrement ;                //how much to move the successor each frame
    let currentY ;                  //current y position of the successor key
    let currentX;                   //current x position of the successor key

    return new _Animation(Timing.linear,
      (t) => {
        if (currentY <= root_y) {                       //the predecessor has arrived at its destination
          clearInterval(ref);
          return;
        }
        c.clearRect(currentX+2,currentY+2,keyWidth-4,height-4);     //erase the predecessor key
        this.drawTree(tree);                                                    //redraw the tree
        c.fillStyle = "white";
        c.fillRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space by painting it white

        //current x and y position of the predecessor key
        currentY = predecessor_y - yDistance * t;
        currentX = predecessor_x + xDistance * t;
        c.textAlign = "center"
        c.fillStyle = "red"

        //redraw the predecessor key in its new position
        c.fillText(predecessor.keys[predecessor.keys.length-1],currentX+keyWidth/2,currentY+keyWidth/2);
      }, canvas.animInterval,
      () => {

        //get the original x and y coordinates of the root and the predecessor
        root_index = this.#getNodesAndKeysBehind(root_level,root)[1];
        root_x = this.#getX(root,root_level,root_index,false,tree)+keyWidth*root_key_index;
        root_y = this.#getY(root_level);
        predecessor_index = this.#getNodesAndKeysBehind(predecessor_level,predecessor)[1];
        predecessor_x = this.#getX(predecessor,predecessor_level,predecessor_index,false,tree)+keyWidth*predecessor_key_index;
        predecessor_y = this.#getY(predecessor_level);

        //get the width and height of the root node
        width = root.keys.length * keyWidth;
        height = 40;

        //make sure the true root is in the center of the screen
        if (root_level === 0) {
          root_x = root_x - (width / 2);
        }

        c.fillStyle = "white";
        c.fillRect(root_x+2,root_y+2,keyWidth-4,height-4); //clear root number and make space


        //move number to the root and update positions
        xDistance = root_x - predecessor_x;
        yDistance = Math.abs(root_y - predecessor_y);
        xIncrement = xDistance/Math.abs(yDistance);
        currentY = predecessor_y;
        currentX = predecessor_x;
      });
  }

  //draws the tree on the canvas
  static drawTree(tree,_excludeKey = null,ignoreRoot = false,_emptyLevel = -1, _emptyIndex = -1) {
    excludedKey = _excludeKey;        //don't draw keys in this list
    emptyLevel = _emptyLevel;         //don't draw this level
    emptyIndex = _emptyIndex;         //don't draw this index
      c.clearRect(0, 0, canvas.width, canvas.height);   //clear the screen

    //only if the tree has a valid root or we are ignoring the root then draw the tree
    if(tree.root && tree.root.keys.length > 0 || ignoreRoot){
      c.strokeStyle = "black";
      c.fillStyle = "black";

      //initialize lists
      nodesInsertedPerLevel.length = 0;
      keysInsertedPerLevel.length = 0;
      keysAtLevel.length = 0;
      this.#drawNode(0, 0, 0, tree.root, 0, 0,tree,ignoreRoot); //draw each node recursively

      //reset flag variables
      excludedKey = null;
      emptyLevel = -1;
      emptyIndex = -1;
    }
  }

  //move a key down a level
  static moveDownLevel(tree,node,level,index){
    let x_pos;        //original x position of the key
    let y_pos;        //original y position of the key
    let goalY;        //y position we want to move the key to
    let width;        //width of the node
    let height;       //height of the node
    
    return new _Animation(Timing.linear,
      (t) => {
        let y = y_pos + (goalY - y_pos) * t;                  //current y position of the key
        this.drawTree(tree,[node.keys[index]]);     //draw the tree without the key we are moving
        c.fillText(node.keys[index], x_pos + keyWidth / 2,    //draw the key in its new position
            y + height / 2);
        c.textAlign = "center"
      }, canvas.animInterval,
      () => {

      //get the initial location parameters of the key
        x_pos = this.#getX(node,level,false,tree);
        y_pos = this.#getY(level);
        goalY = this.#getY(level+1);

        //get width and height of the node
        width = node.keys.length * keyWidth;
        height = 40;

        //make sure the true root is in the center of the screen
        if (level === 0) {
          x_pos = x_pos - (width / 2);
        }
      });
  }

  //gets the x position of any node on the screen given its level and index
  static #getX(node, level, index, isInserting,tree) {
    if (level === 0) {                      //the root node is always in the center of the screen
      return SCREEN_WIDTH / 2;
    } else {
      keysPerLevel.length = 0;
      nodesPerLevel.length = 0;
      this.#calculateKeysPerLevel(tree.root, 0);      //calculate the number of keys and nodes at the level we are interested in now
      let maxLevel = keysPerLevel.length - 1;              //find the deepest level, all coordinates are centered over the last level
      let maxLevelWidth = keysPerLevel[maxLevel] * keyWidth //get the width of the last level
          + (nodesPerLevel[maxLevel] - 1) * (nodeSpacing);

      //we are trying to find coordinate at the deepest level
      if (level === maxLevel) {
        let leftSide = (SCREEN_WIDTH - maxLevelWidth) / 2;              //calculate the leftmost position of the max level

        //use keys currently inserted when trying to get x coordinate of tree currently being built
        if (isInserting) {
          if (keysInsertedPerLevel.length > level) {       //we are inserting at the last level and have already inserted something in it
            return leftSide + nodeSpacing * index + keysInsertedPerLevel[level]
                * keyWidth;
          } else {
            return leftSide + nodeSpacing * index;    //calculate the node's position based off spacing and its index (first node in at last level)
          }
        } else {                                      //we are not inserting so easier to find x coordinate

          //calculate nodes and keys behind to get the positioning
          let keysBehind = 0
          let nodesBehind = 0;
          let results = this.#getNodesAndKeysBehind(level,node);
          keysBehind = results[0];
          nodesBehind = results[1];
          return leftSide + nodeSpacing * nodesBehind + keyWidth * keysBehind;
        }
      } else {            //we are not inserting at the last level, so calculate the quadrant position
        let quadrantWidth = (maxLevelWidth / nodesPerLevel[level])
        let quandrantCenter = quadrantWidth / 2;
        return (SCREEN_WIDTH - maxLevelWidth) / 2 + quadrantWidth * index
            + quandrantCenter - (node.keys.length * (keyWidth / 2));
      }
    }
  }


  //calculates the number of keys and nodes behind a given node at a given level
  static #getNodesAndKeysBehind(level,node){
    let keysBehind = 0
    let nodesBehind = 0;
    loop1:
        for (let i = 0; i < keysAtLevel[level].length; i++) {         //iterate through each node
          for (let j = 0; j < keysAtLevel[level][i].length; j++) {    //iterate through the keys at each node at the level
            if (keysAtLevel[level][i][j] !== node.keys[0]) {          //increment keys behind until we have found the key we are looking for
              keysBehind++;                                           //increment keys behind
            } else {
              break loop1;                                            //leave loop, we have found the key
            }
          }
          nodesBehind++;                                              //increment nodes behind
        }
        return [keysBehind,nodesBehind];
  }

  //returns the y postion of any node given the level
  static #getY(level) {
    let paddingTop = .05;
    let nodeHeight = .2;
    return (level * nodeHeight * SCREEN_HEIGHT) + paddingTop        //calculate the y position
        * SCREEN_HEIGHT;
  }


  //recursively draw the tree
  static #drawNode(level, index, start, node, parentX, parentY,tree,ignoreRoot) {

    //initialize/update nodes inserted per level
    if (level === nodesInsertedPerLevel.length) {
      nodesInsertedPerLevel[level] = 1;
    } else {
      nodesInsertedPerLevel[level]++;
    }
    //draw node outline
    let dimensions = this.#drawRect(level, index, start, node, parentX,
        parentY,tree,ignoreRoot);

    //keep the locations of this node so we can draw a line to it later
    let pX = dimensions[0];
    let pY = dimensions[1];

    let _start = 0;
    if (nodesInsertedPerLevel.length > level + 1) {   //have visited this level already
      _start = nodesInsertedPerLevel[level + 1];      //update the relative index of where to insert
    }
    for (let i = 0; i < node.childNodes.length; i++) {
      this.#drawNode(level + 1, i, _start, node.childNodes[i], pX, pY,tree,ignoreRoot);     //draw the nodes in the list
    }
  }

  //some basic font setup stuff
  static #setFont() {
    let width = SCREEN_WIDTH;
    let ratio = .015;
    c.textBaseline = "middle";
    c.font = 'bold ' + (width * ratio) + 'px sans-serif';
  }


  //calculates the number of keys per level which is used for indexing later
  static #calculateKeysPerLevel(node, level) {

    //update the number of keys and nodes per level
    if (level === nodesPerLevel.length) {
      nodesPerLevel[level] = 1;
      keysPerLevel[level] = 1;
    } else {
      nodesPerLevel[level]++;
      keysPerLevel[level] += node.keys.length;
    }

    //recursively calculate the keys per level
    for (let i = 0; i < node.childNodes.length; i++) {
      this.#calculateKeysPerLevel(node.childNodes[i], level + 1);
    }
  }


  //actually draw the node on the screen
  static #drawRect(level, index, start, node, parentX, parentY,tree,ignoreRoot) {

    //get the node's coordinates
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

    //draw the rectangle
    c.fillRect(x_pos, y_pos, width, height);
    c.strokeRect(x_pos, y_pos, width, height);
    this.#setFont();
    for (let i = 0; i < node.keys.length; i++) {
      c.textAlign = "center";
      if(excludedKey === null || !excludedKey.includes(node.keys[i])){        //don't draw if this is an excluded key
        c.beginPath();
        c.arc(x_pos + keyWidth / 2 + i * keyWidth, y_pos + height / 2, 15, 0, Math.PI * 2, true);     //make the node look like a billiard ball
        c.fillStyle = 'white';
        c.fill();
        c.fillStyle = "black";
        c.fillText(node.keys[i], x_pos + keyWidth / 2 + i * keyWidth,
            y_pos + height / 2, 25);                              //draw the key value
      }
    }
    //draw Line to the parent
    if ((parentX !== 0 && parentY !== 0)) {
      c.beginPath();
      c.moveTo(x_pos + width / 2, y_pos);
      c.lineTo(parentX + index * keyWidth, parentY + height);
      c.stroke();
    }

    //update keys inserted per level
    if (level === keysInsertedPerLevel.length) {
      keysInsertedPerLevel[level] = node.keys.length;
    } else {
      keysInsertedPerLevel[level] += node.keys.length;
    }
    if (level === keysAtLevel.length) {       //adding to a new level
      keysAtLevel[level] = [];
    }
    keysAtLevel[level].push(node.keys);
    return [x_pos, y_pos];
  }
}

return BTreeAnims;
})();

