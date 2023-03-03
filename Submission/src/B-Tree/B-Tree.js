//Authors: Kyle Sokol (Primary) Sungmin Kim
//Description: Implementation of a B-Tree

//global variables
let b_tree = null;                                                        //reference to the b-tree data structure
let animQueue = [];                                                       //queue that holds all the animations
let keys = [];                                                            //list of keys in the tree
let canvas;                                                               //the canvas that th e

//adapts B-Tree implementation to work with common front-end call framework in Controller.js
class BTreeAdapter {
  constructor(controller) {                                               //create a constructor to initiate a B-Tree
    canvas = controller.canvas;                                           //reference for the canvas we will be drawing our animations on
    BTreeAnims.setCanvas(controller.canvas);                              //size the canvas
    b_tree = new BTree(2);                                             //create a new 2-4 tree
    this.animQueue = animQueue;                                           //initialize the animation queue
  }

  insert (key) {                                                          //wrapper for the b-tree insert function
    b_tree.insert(key);                                                   //insert key into b-tree
    keys.push(key);                                                       //add key to the key list
    keys.sort((a, b) => b - a);                                 //sort keys in ascending order
  }

  find (key) {                                                            //wrapper for the b-tree search function
    b_tree.search(key);                                                   //search the b-tree for the key
  }

  delete (key) {                                                          //wrapper for the b-tree delete function
    if(keys.length > 0){                                                    //check to make sure there is a key in the tree
      b_tree.delete(key);                                                   //delete the key from the b-tree
    }
  }

  extractMin () {                                                         //wrapper to extract the minimum from a b-tree
    if (keys.length > 0) {                                                //check to make sure the tree isn't empty
      b_tree.delete(keys.pop());                                          //delete the minimum key from the tree
    }
  }
}

//Class to hold the basic B-Tree data structure
class BTree{
  constructor(t){
    //member variables
    this.t = t;                                                         //keeps track of the degree of the tree 2-3,2-4,2-5....
    this.root = new Node(2);                                         //reference to root node
    this.maxKeys = 2*this.t - 1;                                        //the maximum amount of keys a node can have before needing a split
    this.height = 0;                                                    //keeps track of the height of the tree
  }

  insert(key){                                                          //method to insert a key into the tree
    let r = this.root;

    if(r.keys.length ===  this.maxKeys){                                        //check if the root is already full, if so, we must do a premptive split on the way down
      let tempNode = JSON.parse(JSON.stringify(r));                             //snapshot of the root at this point in time (used later in the animation queue)
      let tempTree = JSON.parse(JSON.stringify(b_tree));                        //snapshot of the tree at this point in time (used later in the animation queue)
      animQueue.push(BTreeAnims.highlight(tempNode,0,"red", true,key,tempTree,false));
      let s = new Node(this.t);                                                  // create a new node for our new root
      this.root = s;                                                             //assign the new root because we are splitting the root and increasing the height of the tree by 1
      s.isLeaf = false;                                                          //since this is the root, it is not a leaf
      s.childNodes.push(r);                                                      //make the old root, s (new root) leftmost child
      s.splitChild(0,0,tempTree,tempNode,true);              //split the old root, which is s's new child
      s.insertNonFull(key,0);                                               //root was split, now try to insert the key
      this.height++;                                                             //increase the height of the tree
    }
    else{
      r.insertNonFull(key,0);                                               //the root did not need to be split, try to insert the key
    }
    let tempTree = JSON.parse(JSON.stringify(b_tree));                          //snapshot of the tree at this point in time (used later in the animation queue)
    animQueue.push(new _Animation(Timing.linear,                                //push a draw tree animation to the queue
      () => {}, canvas.animInterval,
      () => {BTreeAnims.drawTree(tempTree)}));
  }

  search(key){                                                                  //wrapper for the recursive search key function
    return this.root.search(key,0,0);                                 //call the recursive search passing it the root's level and index at the level
  }

  delete(key){                                                                  //wrapper for the recursive delete functionality
    return this.root.delete(key,0,0);                                   //call recursive delete passing it the root's level and index at the level
  }
}


//A B-tree is made of nodes
class Node {
  constructor(t) {
    //member variables
    this.t = t;                                                 //lets us know how many keys and children per node
    this.isLeaf = true;                                         //determines if this node is a leaf or not
    this.keys = [];                                             //integer values of all the keys in a node
    this.childNodes = [];                                       //array of children Node objects
  }

  //splits a child by making a left and a right node. Puts the median of the left and right into the parent
  splitChild(childIndex,level,tree,root,isRoot){
    let leftCutoff = this.t - 1;                                    //left bound of the median that will be split from the node
    let rightCutoff = this.t;                                       //right bound of the median that will be split from the node
    let right = new Node(this.t)                                    //make a new node to hold the right side of the node to be split
    let left = this.childNodes[childIndex]                          //initially set the left side to be the entire node to be split
    right.isLeaf = left.isLeaf                                      //if the left child was a leaf, that means the new right node must be a leaf
    let oldRootCopy = JSON.parse(JSON.stringify(left));             //copy of the root node at this point in time which will be used later in the animation queue

    //move the keys from left to right child
    for(let j = this.t; j < left.keys.length; j++){              //we split the child in half at the mid-point index (t-1), left side might be bigger
      right.keys.push(left.keys[j]);                             //assign the rightmost keys of the left child to the right child
    }

    //move the children form left to right child
    let childrenMoved = 0;                                                  //counter for the number of children that have been displaced
    if (!left.isLeaf){
      for(let j = this.t; j <left.childNodes.length; j++){                  //we split the child in half at the mid-point index (t-1), left side might be bigger
        right.childNodes.push(left.childNodes[j]);                          //assign the rightmost keys of the left child to the right child
        childrenMoved++;                                                    //increment the counter for the children displaces
      }
    }
    left.keys.length = this.t;                                                   //essentially delete from the left what was moved to right
    left.childNodes.length = left.childNodes.length - childrenMoved;             //account for the children removed from the left node

    //insert right as a child of the new parent
    for(let j = this.childNodes.length - 1; j > childIndex; j--){
      this.childNodes[j+1] = this.childNodes[j];                           //move everything to the right and insert the new child
    }
    this.childNodes[childIndex+1] = right;                                 //insert right, 1 index to the right of the left (original node)

    //insert the median into the root
    for(let j = this.keys.length - 1; j >= childIndex; j--){
      this.keys[j+1] = this.keys[j];                                       //move all keys to the right, including i
    }
    this.keys[childIndex] = left.keys[left.keys.length-1]  ;               //slot the new median key (rightmost index of left array) into the new parent array
    let key = left.keys[left.keys.length-1];                               //copy of the key to be used later
    left.keys.length = left.keys.length - 1;                               //get rid of the median from the end of the left node

    //copy of the root and tree to be used later in the animation queue
    let newRootCopy = JSON.parse(JSON.stringify(this));
    let tempTree_2 = JSON.parse(JSON.stringify(b_tree));

    if(isRoot){                                                           //check if we split the root
      animQueue.push(BTreeAnims.splitRoot(tree,root));                    //push the split root animation onto the queue
      animQueue.push(BTreeAnims.extracted(tree,leftCutoff,rightCutoff,root,[key])); // push the extract root animation onto the queue
      animQueue.push(new _Animation(Timing.linear,                        //push the draw tree animation onto the queue
        () => {}, canvas.animInterval,
        () => {BTreeAnims.drawTree(tempTree_2)}));
    }
    else{
      let oldKeyIndex = this.t-1;                                           //location of the key to be split from the node
      animQueue.push(BTreeAnims.splitChildNode(tempTree_2,tree,oldRootCopy,newRootCopy,level,level-1,oldKeyIndex,childIndex,key));    //add the split child node animation to the queue
    }
  }

  //recursively inserts a node into the tree
  insertNonFull(key,level){
    let i = this.keys.length - 1;                                          //the last index in the keys list

    //case 1: we are at a leaf (we always insert new items at the leaves)
    let tempNode = JSON.parse(JSON.stringify(this));                        //create snapshot of the root for later use in the animation queue
    let tempTree = JSON.parse(JSON.stringify(b_tree));                      //create snapshot of the tree for later use in the animation queue
    if(level > 0 || this.keys.length > 0){                                  //check if we are not at the root and we are on a non-empty node
      animQueue.push(BTreeAnims.highlight(tempNode,level,"red", true,key,tempTree,false));    //highlight the node
    }

    //check if we are inserting into a leaf
    if(this.isLeaf){
      while(i >= 0 && key < this.keys[i]){                                //shift all keys greater than the new key to the right to leave an open spot for the new key
        this.keys[i+1] = this.keys[i];
        i--;
      }
      this.keys[i+1] = key;                                               //insert the new key
      let tempTree2 = JSON.parse(JSON.stringify(b_tree));                 //create a copy of the tree for later use in the animations
      animQueue.push(new _Animation(Timing.linear,                        //add a draw tree animation to the queue
        () => {}, canvas.animInterval,
        () => {BTreeAnims.drawTree(tempTree2)}));
    }

    //case 2: we are not at a leaf
    else{
      while(i >= 0 && key < this.keys[i]){                                //locate the index of the key in th enode
        i--;                                                              //find the key for who we will use their child to insert the new key
      }
      i++;                                                                //we decremented before exiting the loop, so re-increment to get the right value
      if(this.childNodes[i].keys.length === 2*this.t-1){                  //see if the child we want to insert the new key into is full
        this.splitChild(i,level+1,tempTree,tempNode,false);    //split the child
        if(key > this.keys[i]){                                           //determine if we need to recurse on the new left or right child (keys[i] is the new median of the children)
          i++;
        }
      }
      this.childNodes[i].insertNonFull(key,level+1)                       //recursively insert key into children until we hit a leaf
    }
  }

  //search
  search(key, level){
    let tempNode = JSON.parse(JSON.stringify(this));                     //snapshot of the current node for later use in the animations
    let tempTree = JSON.parse(JSON.stringify(b_tree));                   //snapshot of the b-tree for later use in the animations
    animQueue.push(BTreeAnims.highlight(tempNode,level,"red", false,key,tempTree,false)); //highlight the current node
    let i = 0;
    while(i < this.keys.length && key > this.keys[i]){                  //locate roughly where to look (iterate through the keys until we are greater than or equal to the key)
      i++;
    }

    if(i < this.keys.length && key === this.keys[i]){                     //we found the key
      animQueue.push(BTreeAnims.highlight(tempNode,level,"red", true,key,tempTree,false)); //highlight the node we are on
      return "found";                                                    //return the node the key was found out and the index of the key in the node
    }

    else if(this.isLeaf){                                                 //we are at a leaf and didn't see the key, the key doesn't exit
      return null;                                                        //return null
    }
    else{
      return this.childNodes[i].search(key,level+1,i);                    //recurse on the right,child (we were greater than the key)
    }
  }

  //deletes a node from the B-tree given a key
  delete(key,level,i){
    let tempNode = JSON.parse(JSON.stringify(this));                       //deep copies for later
    let tempTree = JSON.parse(JSON.stringify(b_tree));
    animQueue.push(BTreeAnims.highlight(tempNode,level,"red", false,key,tempTree,false)); //highlight the current node we are at

    let index = this.keys.indexOf(key);                                     //check if the key we are looking for is in the current node
    if(index !== -1){                                                       //the key is in the current node
      if(this.isLeaf){                                                      //the node to delete from is a leaf
        animQueue.push(BTreeAnims.highlight(tempNode,level,"red", true,key,tempTree,false));  //highlight the leaf

        this.removeFromLeaf(index);                                         //all we need to do is delete it from the leaf (we are ensured it has at least t keys due to preemptive merge)

        let tempNode_1 = JSON.parse(JSON.stringify(this));                  //deep copies for later
        let tempTree_1 = JSON.parse(JSON.stringify(b_tree));
        animQueue.push(BTreeAnims.removeLeafKey(tempNode_1,level,index,tempTree_1,false));    //add remove from leaf animation to the queue

      }
      else{                                                                 //the node to delete from is not a leaf
        this.removeFromNonLeaf(index,level,index);
      }
    }

    //the key is not in the current node
    else{
      if(this.isLeaf){                                                      //the key is not in the tree since we are at a leaf
        return null;
      }
      let childToRecurseOnIndex = this.getChildToRecurseOn(key);                                //get the index of the child to recurse on

      //determine if the child we are recursing on is the rightmost child
      let wasFarRightChild = false;
      if(childToRecurseOnIndex === this.keys.length){
        wasFarRightChild = true;
      }

      //determine if we are traversing onto a child with the minimum number of keys
      let flag = true;
      if(this.childNodes[childToRecurseOnIndex].keys.length < this.t){
        flag = this.fill(childToRecurseOnIndex,level);                                            //preemptive fill on the way down (has t-1 nodes, need to make sure it has more than that)
      }

      if(flag){                                                              //if we didn't merge
        if(wasFarRightChild && childToRecurseOnIndex > this.keys.length){
          this.childNodes[childToRecurseOnIndex-1].delete(key,level+1);     //we lost a child at the end after fill/merge and we need to recurse on one less
        }
        else{
          this.childNodes[childToRecurseOnIndex].delete(key,level+1);       //recurse on child which we know has at least t keys
        }
      }
      else{
        this.delete(key,level);                                             //regular recursive delete
      }
    }
  }

  //deletes the key from a leaf
  removeFromLeaf(index){
    //case 1
    for(let i = index+1; i < this.keys.length; i++){
      this.keys[i-1] = this.keys[i];                                        //move all keys after the deleted index back one to fill in the gap
    }
    this.keys.length--;                                                     //reduce the length of the keys by one after deletion
  }

  //deletes a key from a non-leaf (index is the index of the key to be removed)
  removeFromNonLeaf(index,level){
    let key = this.keys[index];                                           //key to delete

    //case 2a: left child has at least t keys (replace with the predecessor), recursively delete the predecessor
    if(this.childNodes[index].keys.length >= this.t){

      //get info about the predecessor
      let predecessorResults = this.getPredecessor(index,level);            //call to get predecessor info
      let predecessor = predecessorResults[0];                              //predecessor node
      let predecessorLevel = predecessorResults[1];                         //predecessor level
      let predecessorKey = predecessor.keys[predecessor.keys.length-1];     //predecessor key


      let tempRoot = JSON.parse(JSON.stringify(this));                      //create snapshot of the root to be used later
      let tempTree = JSON.parse(JSON.stringify(b_tree));                    //create snapshot of the tree to be used later
      let tempPredecessor = JSON.parse(JSON.stringify(predecessor));        //create snapshot of the predecessor to be used later

      //animate predecessor moving up
      animQueue.push(BTreeAnims.highlight(tempPredecessor,predecessorLevel,"red", false,predecessorKey,tempTree,false));      //highlight outline of node
      animQueue.push(BTreeAnims.highlight(tempPredecessor,predecessorLevel,"red", true,predecessorKey,tempTree,false));       //highlight key in the node
      animQueue.push(BTreeAnims.transferPredecessor(tempRoot,level,predecessor,predecessorLevel,index,predecessor.keys.length-1,tempTree,false));

      this.keys[index] = predecessor.keys[predecessor.keys.length-1];                                           //replace the value to be deleted with the predecessor
      this.childNodes[index].delete(predecessor.keys[predecessor.keys.length-1],level+1,index);                 //recursively delete the predecessor
    }

    //case 2b: right child has at least t keys (replace with the successor), recursively delete the successor
    else if(this.childNodes[index+1].keys.length >= this.t){

      //get info about the successor
      let successorResults =  this.getSuccessor(index,level);              //call to get the successor info
      let successor = successorResults[0];                                 //get the key of the successor
      let successorLevel = successorResults[1];                            //successor level
      let successorKey = successor.keys[0];                                //successor key

      //create snapshot of tree and node to be used later
      let tempRoot = JSON.parse(JSON.stringify(this));
      let tempTree = JSON.parse(JSON.stringify(b_tree));

      //animate successor moving up
      animQueue.push(BTreeAnims.highlight(successor,successorLevel,"red", false,successorKey,tempTree,false));    //highlight the outline of the node
      animQueue.push(BTreeAnims.highlight(successor,successorLevel,"red", true,successorKey,tempTree,false));     //highlight the key in the node
      animQueue.push(BTreeAnims.transferSuccessor(tempRoot,level,successor,successorLevel,index,tempTree));

      this.keys[index] = successor.keys[0];                                             //replace the value to be deleted with the successor
      this.childNodes[index+1].delete(successor.keys[0],level+1,index+1);               //recursively delete the successor
    }

    //case 2c: neither the left or the right child has at least t keys (merge left and right children and the key), recursively delete the key from the merged array
    else{
      if(this.merge(index,level)){
        this.childNodes[index].delete(key,level+1,index);                                //delete the key from the left child which everything was merged into
      }
      else{
        this.delete(key,level,index);                                                   //regular recursive delete
      }
    }
  }

  //returns the key value of the predecessor
  getPredecessor(index,level){
    let currentNode = this.childNodes[index];                                   //the child node to start looking in
    let tempTree = JSON.parse(JSON.stringify(b_tree));                          //snapshot of the tree to be used later
    while(!currentNode.isLeaf){                                                 //traverse tree until we are at a leaf
      level++;                                                                  //increment level as we dive deeper into the tree
      let currentNodeCopy_2 = JSON.parse(JSON.stringify(currentNode));          //copy of the current node for use later in the animations
      currentNode = currentNode.childNodes[currentNode.keys.length];            //keep traversing right until we have reached a leaf
      animQueue.push(BTreeAnims.highlight(currentNodeCopy_2,level,"red", false,0,tempTree,false));  //highlight the current node
    }
    let returnValue = JSON.parse(JSON.stringify(currentNode));                  //deep copy of the predecessor node
    return [returnValue,level+1]                         //return the rightmost key in the node
  }

  //returns the key value of the successor
  getSuccessor(index,level){
    let currentNode = this.childNodes[index+1];                                 //the child node to start looking in
    let tempTree = JSON.parse(JSON.stringify(b_tree));                          //snapshot of the tree to be used later
    while(!currentNode.isLeaf){                                                 //traverse the tree until we are at a lead
      level++;                                                                  //increment the level as we dive deeper into the tree
      let currentNodeCopy_2 = JSON.parse(JSON.stringify(currentNode));          //copy of the current node for use later in the animations
      currentNode = currentNode.childNodes[0];                                  //keep traversing left until we have reached a leaf
      animQueue.push(BTreeAnims.highlight(currentNodeCopy_2,level,"red", false,0,tempTree,false));   //highlight the current node
    }

    let returnValue = JSON.parse(JSON.stringify(currentNode));                  //deep copy of the successor node
    return [returnValue,level+1];                                                //return the leftmost key in the node

  }

  //merges the left and right child and the parent key
  merge(index,level){
    let left = this.childNodes[index];                                          //the left node
    let leftCopy = JSON.parse(JSON.stringify(left));                            //deep copy of left node used later in animations
    let tempTree = JSON.parse(JSON.stringify(b_tree));                          //deep copy of current tree to be used later in animations
    let right = this.childNodes[index+1];                                       //the right node
    let rightCopy = JSON.parse(JSON.stringify(right));                          //deep copy of right node used later in animations
    let tempNode = JSON.parse(JSON.stringify(this));                            //deep copy of root node to be used later in animations
    let rootKey = this.keys[index];                                             //the root's key
    let originalLeftLength  = left.keys.length;                                 //the original length the the left node before merging

    //highlight the left and right nodes
    animQueue.push(BTreeAnims.highlight(leftCopy,level+1,"red", false,0,tempTree,true));
    animQueue.push(BTreeAnims.highlight(rightCopy,level+1,"red", false,0,tempTree,true));
    if(level === 0 && this.keys.length === 1){
      animQueue.push(BTreeAnims.moveDownLevel(tempTree,tempNode,0,0));    //move everything down if we are losing height to the tree
    }

    left.keys.push(this.keys[index]);                                           //add the parent's value to the left array
    left.keys.push.apply(left.keys,right.keys);                                 //copy the right keys to the left

    //check if we are working with leaves and if we need to deal with children or not
    if(!left.isLeaf){
      left.childNodes.push.apply(left.childNodes,right.childNodes);             //append the children from the right over to the left array
    }
    //delete the parent key and move everything to the left
    for(let i = index + 1; i <= this.keys.length; i++){
      this.keys[i-1] = this.keys[i];                                             //move everything to the left
    }

    //update the child pointers since we got rid of one child
    for(let i = index + 2; i <= this.keys.length; i++){                          //start at i + 2 because right child deleted was at i + 1
      this.childNodes[i-1] = this.childNodes[i];                                 //move everything to the left
    }
    this.keys.length = this.keys.length - 1;                                    //deleted a key so the length of the keys array gets reduces by 1
    this.childNodes.length = this.childNodes.length - 1;                        //deleted the right child so the length of the children array gets reduced by 1

    //copy of tree and node to be used later in the animations
    let temp_tree_2 = JSON.parse(JSON.stringify(b_tree));
    let tempNode2 = JSON.parse(JSON.stringify(left));

    //move canvas back up if we got rid of a level
    if(level === 0 && this.keys.length + 1 === 1){
      animQueue.push(BTreeAnims.moveCanvasUp(temp_tree_2,level,index));
    }
    else{
      animQueue.push(BTreeAnims.moveRootDown(tempTree,tempNode,temp_tree_2,rootKey,level,index,tempNode2,level+1,index,originalLeftLength));    //move the root down
    }

    //check if the root level has been eliminated and if so transfer everything to the original left child
    if(this.keys.length === 0){
      this.keys = left.keys;
      this.childNodes = left.childNodes;
      this.isLeaf = left.isLeaf;
      return false;
    }
    return true;
  }

  //returns the index of the child to recurse on
  getChildToRecurseOn(key){
    let i = 0;
    while(i < this.keys.length && key > this.keys[i]){                  //locate roughly where to look (iterate through the keys until we are greater than or equal to the key)
      i++;
    }
    return i;
  }


  //makes a child that we were going to recurse on with t-1 nodes have t nodes
  fill(index,level){

    //case 3a: node only has t-1 keys, but one of its siblings has t keys
    if(index < this.childNodes.length-1 && this.childNodes[index+1].keys.length >= this.t){      //right sibling has at least t keys so do a left rotation
      this.leftRotation(index,level);
    }
    else if(index !== 0 && this.childNodes[index - 1].keys.length >= this.t){                    //left sibling has at least t keys, do a right rotation
      this.rightRotation(index,level);
    }

    //case 3b: node and both of its siblings only have t-1 keys (merge everything)
    else{
      if(index === this.keys.length){                                                                    //merge with left sibling if the last child
        return this.merge(index-1,level);
      }
      else{                                                                                             //merge with right sibling if not the last child
        return this.merge(index,level);
      }
    }
    return true;
  }

  //borrows a key from the right sibling for the fill operation
  leftRotation(index,level){
    let left = this.childNodes[index];                                          //the child we are recursing on
    let right = this.childNodes[index+1];                                       //the sibling we are going to borrow from

    //create copies left node, right node, and tree for later
    let leftCopy = JSON.parse(JSON.stringify(left));
    let tempTree = JSON.parse(JSON.stringify(b_tree));
    let rightCopy = JSON.parse(JSON.stringify(right));

    let rootKey = this.keys[index];                                             //the root key

    //highlight the left and right
    animQueue.push(BTreeAnims.highlight(leftCopy,level+1,"red", false,0,tempTree,true));
    animQueue.push(BTreeAnims.highlight(rightCopy,level+1,"red", false,0,tempTree,true));


    left.keys.push(this.keys[index]);                                           //bring down the parent key and put it at the end of the left child (we can do this because we checked to make sure we weren't at rightmost child before merging)

    if(!left.isLeaf){
      left.childNodes.push(right.childNodes[0])                                 //if left and right have leaves, then give leftmost child of right sibling to the left node
    }

    let rightKey = right.keys[0];
    this.keys[index] = right.keys[0];                                           //move the number from the right sibling up into the parent

    for(let i = 1; i < right.keys.length; i++){                                 //shift the keys in the sibling back 1
      right.keys[i-1] = right.keys[i];
    }

    if(!right.isLeaf){
      for(let i = 1; i < right.childNodes.length; i++){                              //shift the children in the sibling back 1
        right.childNodes[i-1] = right.childNodes[i];
      }
      right.childNodes.length--;
    }

    //we got rid of a node from the sibling so decrement its length by 1
    right.keys.length --;

    //make deep copies for left, right, root, and tree for later
    let tempTree_2 = JSON.parse(JSON.stringify(b_tree));
    let tempRoot = JSON.parse(JSON.stringify(this));
    let tempLeft = JSON.parse(JSON.stringify(left));
    let tempRight = JSON.parse(JSON.stringify(right));

    //add left rotate animation to the queue
    animQueue.push(BTreeAnims.leftRotate(tempTree_2,tempRoot,tempLeft,tempRight,rootKey,rightKey,index,index+1,level,level+1,level+1,index,index,0));
  }

  //borrows a key from the left sibling for the fill operation
  rightRotation(index,level){
    let left = this.childNodes[index-1];                                          //the sibling we are going to borrow from
    let right = this.childNodes[index];                                           //the child we are recursing on

    //create deep copies for later
    let leftCopy = JSON.parse(JSON.stringify(left));
    let tempTree = JSON.parse(JSON.stringify(b_tree));
    let rightCopy = JSON.parse(JSON.stringify(right));

    let rootKey = this.keys[index-1];                                           //the root key

    //highlight the left and right nodes
    animQueue.push(BTreeAnims.highlight(leftCopy,level+1,"red", false,0,tempTree,true));
    animQueue.push(BTreeAnims.highlight(rightCopy,level+1,"red", false,0,tempTree,true));

    for(let i = right.keys.length - 1; i >= 0; i--){                               //bring down the parent key and prepend it to the right child
      right.keys[i+1] = right.keys[i];                                             //make a space at the beginning by moving all keys to the right
    }

    if(!right.isLeaf){                                                               //check if we need to move the right's children to the right if there are any
      for(let i = right.childNodes.length - 1; i >= 0; i--){
        right.childNodes[i+1] = right.childNodes[i];                                 //make a space at the beginning by moving all children to the right
      }
    }

    right.keys[0] = this.keys[index-1];                                                //bring down the parent (use index-1 because we are at a right child)

    //move the left sibling's right child to be the right sibling leftmost child
    if(!right.isLeaf){
      right.childNodes[0] = left.childNodes[left.keys.length];
      left.childNodes.length--;
    }

    //move the node from the left sibling up into the parent
    let leftKey = left.keys[left.keys.length-1];
    this.keys[index-1] = left.keys[left.keys.length-1];

    left.keys.length--;                                                         //borrowed a key from the left sibling so decrement the lengths

    //deep copies for later
    let tempTree_2 = JSON.parse(JSON.stringify(b_tree));
    let tempRoot = JSON.parse(JSON.stringify(this));
    let tempLeft = JSON.parse(JSON.stringify(left));
    let tempRight = JSON.parse(JSON.stringify(right));

    //add right rotate animation to the queue
    animQueue.push(BTreeAnims.rightRotate(tempTree_2,tempRoot,tempLeft,tempRight,rootKey,leftKey,index-1,index,level,level+1,level+1,index-1,left.keys.length,0));
  }
}

//**Testing stuff
/*
let b_tree = new BTree(2);
function run(functionName, key){
  if(functionName === "insert"){
    b_tree.insert(key);
  }
  else if(functionName === "delete"){
    b_tree.delete(key);
  }
  else{
    b_tree.search(key);
  }
  BTreeAnims.runQueue(1000);

}
*/
// b_tree.insert(10);
// b_tree.insert(11);
// b_tree.insert(12);
// b_tree.insert(13);
// b_tree.insert(14);
// b_tree.insert(15);
// b_tree.insert(16);
// b_tree.insert(17);
// b_tree.insert(18);
// b_tree.insert(19);
// b_tree.insert(20);
// b_tree.insert(6);
// b_tree.insert(7);
// b_tree.insert(8);
// b_tree.insert(9);
// b_tree.insert(1);
// b_tree.insert(2);
// b_tree.insert(3);
// b_tree.insert(4);
// b_tree.insert(5);
// b_tree.delete(11);
// b_tree.delete(13);
// b_tree.delete(7);
// b_tree.delete(6);
// b_tree.delete(5);
// b_tree.delete(15);
// b_tree.delete(14);
// b_tree.delete(12);
// b_tree.delete(20);
// b_tree.delete(4);
// b_tree.delete(8);
// b_tree.delete(9);
// b_tree.delete(2);
// b_tree.delete(10);
// b_tree.delete(3);
// b_tree.delete(17);
// b_tree.delete(16);
// b_tree.delete(18);
// b_tree.delete(1);
// b_tree.delete(19);
//animQueue.length = 0;
// b_tree.insert(10);
// b_tree.insert(11);
// b_tree.insert(12);
// b_tree.insert(13);
  // b_tree.insert(14);
  //b_tree.delete(4);

//Animations.drawTree(b_tree);



