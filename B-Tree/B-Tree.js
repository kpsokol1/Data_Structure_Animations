class BTree{
  constructor(t){
    //member variables
    this.t = t;                                                 //keeps track of the degree of the tree 2-3,2-4,2-5....
    this.root = new Node(t);                                    //reference to root node
    this.maxKeys = 2*t - 1;                                     //the maximum amount of keys a node can have before needing a split
    this.height = 0;
  }

  insert(key){
    let r = this.root;

    if(r.keys.length ===  this.maxKeys){                    //check if the root is already full, if so, we must do a premptive split on the way down
      let s = new Node(this.t);                                 // create a new node for our new root
      this.root = s;                                            //assign the new root because we are splitting the root and increasing the height of the tree by 1
      s.isLeaf = false;                                         //since this is the root, it is not a leaf
      s.childNodes.push(r);                                     //make the old root, s (new root) leftmost child
      s.splitChild(0);                                 //split the old root, which is s's new child
      s.insertNonFull(key);                                    //root was split, now try to insert the key
      this.height++;
    }
    else{
      r.insertNonFull(key);                                    //the root did not need to be split, try to insert the key
    }
  }

  search(key){
    return this.root.search(key,0,0);
  }

  delete(key){
    return this.root.delete(key,0);
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
  splitChild(childIndex){
    let right = new Node(this.t)                               //make a new node to hold the right side of the node to be split //fixme does it need to be left.t?
    let left = this.childNodes[childIndex]                     //initially set the left side to be the entire node to be split
    right.isLeaf = left.isLeaf                                //if the left child was a leaf, that means the new right node must be a leaf

    //move the keys from left to right child
    for(let j = this.t; j < left.keys.length; j++){              //we split the child in half at the mid-point index (t-1), left side might be bigger
      right.keys.push(left.keys[j]);                          //assign the rightmost keys of the left child to the right child
    }

    //move the children form left to right child
    let childrenMoved = 0;
    if (!left.isLeaf){
      for(let j = this.t; j <left.childNodes.length; j++){                          //we split the child in half at the mid-point index (t-1), left side might be bigger
        right.childNodes.push(left.childNodes[j]);                          //assign the rightmost keys of the left child to the right child
        childrenMoved++;
      }
    }
    left.keys.length = this.t;                                                   //essentially delete from the left what was moved to right
    left.childNodes.length = left.childNodes.length - childrenMoved;

    //insert right as a child of the new parent
    for(let j = this.childNodes.length - 1; j > childIndex; j--){         //fixme did I use the right length here?
      this.childNodes[j+1] = this.childNodes[j];                           //move everything to the right and insert the new child
    }
    this.childNodes[childIndex+1] = right;                                //insert right, 1 index to the right of the left (original node)

    //insert the median into the root
    for(let j = this.keys.length - 1; j >= childIndex; j--){
      this.keys[j+1] = this.keys[j]          ;                             //move all keys to the right, including i
    }
    this.keys[childIndex] = left.keys[left.keys.length-1]  ;               //slot the new median key (rightmost index of left array) into the new parent array

    left.keys.length = left.keys.length - 1;                                        //get rid of the median from the end of the left node
  }

  //resursively inserts a node into the tree
  insertNonFull(key){
    let i = this.keys.length - 1;                                          //the last index in the keys list

    //case 1: we are at a leaf (we always insert new items at the leaves)
    if(this.isLeaf){
      while(i >= 0 && key < this.keys[i]){                                //shift all keys greater than the new key to the right to leave an open spot for the new key
        this.keys[i+1] = this.keys[i];
        i--;
      }
      this.keys[i+1] = key;                                               //insert the new key
    }
    //case 2: we are not at a leaf
    else{
      while(i >= 0 && key < this.keys[i]){
        i--;                                                              //find the key for who we will use their child to insert the new key
      }
      i++;                                                                //we decremented before exiting the loop, so re increment to get the right value
      if(this.childNodes[i].keys.length === 2*this.t-1){                  //see if the child we want to insert the new key into is full
        this.splitChild(i);                                               //split the child
        if(key > this.keys[i]){                                           //determine if we need to recurse on the new left or right child (keys[i] is the new median of the children)
          i++;
        }
      }
      this.childNodes[i].insertNonFull(key)                                  //recursively insert key into children until we hit a leaf
    }
  }

  //search
  search(key, level,index){
    let tempNode = this;
    animationQueue.push(function() {Animations.highlight(tempNode,level,index,"red", false,key)});
    let i = 0;
    while(i < this.keys.length && key > this.keys[i]){                  //locate roughly where to look (iterate through the keys until we are greater than or equal to the key)
      i++;
    }

    if(i < this.keys.length && key === this.keys[i]){                     //we found the key
      animationQueue.push(function() {Animations.highlight(tempNode,level,index,"green", true,key)});
      return "found";                                                    //return the node the key was found out and the index of the key in the node  //fixme may need to change this later
    }

    else if(this.isLeaf){                                                 //we are at a leaf and didn't see the key, the key doesn't exit
      return null;                                                        //return null
    }
    else{
      return this.childNodes[i].search(key,level+1,i);                              //recurse on the right,child (we were greater than the key)
    }
  }

  //deletes a node from the B-tree given a key  //fixme cannot delete root?
  delete(key){
    let index = this.keys.indexOf(key);                                     //check if the key we are looking for is in the current node
    if(index !== -1){                                                       //the key is in the current node
      if(this.isLeaf){                                                      //the node to delete from is a leaf
        this.removeFromLeaf(index);                                              //all we need to do is delete it from the leaf (we are ensured it has at least t keys due to preemptive merge)
      }
      else{                                                                 //the node to delete from is not a leaf
        this.removeFromNonLeaf(index);
      }
    }
    //the key is not in the current node
    else{
      if(this.isLeaf){                                                      //the key is not in the tree since we are at a leaf
        return null;
      }
      let childToRecurseOnIndex = this.getChildToRecurseOn(key);

      //determine if the child we will recurse onto has less than t keys
      let wasFarRightChild = false;
      if(childToRecurseOnIndex === this.keys.length){
        wasFarRightChild = true;
      }
      let flag = true;
      if(this.childNodes[childToRecurseOnIndex].keys.length < this.t){
        flag = this.fill(childToRecurseOnIndex);                                       //premptive fill on the way down (has t-1 nodes, need to make sure it has more than that)
      }

      if(flag){
        if(wasFarRightChild && childToRecurseOnIndex > this.keys.length){
          this.childNodes[childToRecurseOnIndex-1].delete(key);                             //we lost a child at the end after fill/merge and we need to recurse on one less
        }
        else{
          this.childNodes[childToRecurseOnIndex].delete(key);                               //recurse on child which we know has at least t keys
        }
      }
      else{
        this.delete(key);
      }
    }
  }

  //deletes the key from a leaf
  removeFromLeaf(index){
    //case 1
    for(let i = index+1; i < this.keys.length; i++){
      this.keys[i-1] = this.keys[i];                                        //move all keys after the deleted index back one to fill in the gap
    }
    this.keys.length--;                                 //reduce the length of the keys by one after deletion
  }

  //deletes a key from a non-leaf (index is the index of the key to be removed)
  removeFromNonLeaf(index){
    let key = this.keys[index];

    //case 2a: left child has at least t keys (replace with the predecessor), recursively delete the predecessor
    if(this.childNodes[index].keys.length >= this.t){
      let predecessor = this.getPredecessor(index);                             //get the key of the predecessor
      this.keys[index] = predecessor;                                           //replace the value to be deleted with the predecessor
      this.childNodes[index].delete(predecessor);                                //recursively delete the predecessor
    }

    //case 2b: right child has at least t keys (replace with the successor), recursively delete the successor
    else if(this.childNodes[index+1].keys.length >= this.t){
      let successor = this.getSuccessor(index);                                 //get the key of the successor
      this.keys[index] = successor;                                             //replace the value to be deleted with the successor
      this.childNodes[index+1].delete(successor);                               //recursively delete the successor
    }

    //case 2c: neither the left or the right child has at least t keys (merge left and right children and the key), recursively delete the key from the merged array
    else{
      if(this.merge(index)){
        this.childNodes[index].delete(key);                                       //delete the key from the left child which everything was merged into
      }
      else{
        this.delete(key);
      }
    }
  }

  //returns the key value of the predecessor
  getPredecessor(index){
    let currentNode = this.childNodes[index];                                   //the child node to start looking in
    while(!currentNode.isLeaf){
      currentNode = currentNode.childNodes[currentNode.keys.length];            //keep traversing right until we have reached a leaf
    }
    return currentNode.keys[currentNode.keys.length-1];                         //return the rightmost key in the node
  }

  //returns the key value of the successor
  getSuccessor(index){
    let currentNode = this.childNodes[index+1];                                 //the child node to start looking in
    while(!currentNode.isLeaf){
      currentNode = currentNode.childNodes[0];                                  //keep traversing left until we have reached a leaf
    }
    return currentNode.keys[0];                                                 //return the leftmost key in the node
  }

  //merges the left and right child and the parent key
  merge(index){
    let left = this.childNodes[index];                                          //the left child
    let right = this.childNodes[index+1];                                       //the right child

    left.keys.push(this.keys[index]);                                           //add the parent's value to the left array

    left.keys.push.apply(left.keys,right.keys);                                 //copy the right keys to the left   //fixme is this correct?

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
    if(this.keys.length === 0){
      this.keys = left.keys;
      this.childNodes = left.childNodes;
      this.isLeaf = left.isLeaf;            //fixme does this work if we are at a root
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
  fill(index){

    //case 3a: node only has t-1 keys, but one of its siblings has t keys
    if(index < this.childNodes.length-1 && this.childNodes[index+1].keys.length >= this.t){      //right sibling has at least t keys so do a left rotation
      this.leftRotation(index);
    }
    else if(index !== 0 && this.childNodes[index - 1].keys.length >= this.t){           //left sibling has at least t keys, do a right rotation
      this.rightRotation(index);
    }

    //case 3b: node and both of its siblings only have t-1 keys (merge everything)
    else{
      if(index === this.keys.length){                                                                    //merge with left sibling if the last child
        return this.merge(index-1);
      }
      else{                                                                                             //merge with right sibling if not the last child
        return this.merge(index);
      }
    }
    return true;
  }

  //borrows a key from the right sibling for the fill operation
  leftRotation(index){
    let left = this.childNodes[index];                                          //the child we are recursing on
    let right = this.childNodes[index+1];                                       //the sibling we are going to borrow from

    left.keys.push(this.keys[index]);                                           //bring down the parent key and put it at the end of the left child (we can do this because we checked to make sure we weren't at rightmost child before merging)

    if(!left.isLeaf){
      left.childNodes.push(right.childNodes[0])                                 //if left and right have leaves, then give leftmost child of right sibling to the left node
    }

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

  }

  //borrows a key from the left sibling for the fill operation
  rightRotation(index){
    let left = this.childNodes[index-1];                                          //the sibling we are going to borrow from
    let right = this.childNodes[index];                                           //the child we are recursing on

    for(let i = right.keys.length - 1; i >= 0; i--){                               //bring down the parent key and prepend it to the right child
      right.keys[i+1] = right.keys[i];                                             //make a space at the beginning by moving all keys to the right
    }

    if(!right.isLeaf){                                                               //check if we need to move the right's children to the right if there are any
      for(let i = right.childNodes.length - 1; i >= 0; i--){
        right.childNodes[i+1] = right.childNodes[i];                                             //make a space at the beginning by moving all children to the right
      }
    }

    right.keys[0] = this.keys[index-1];                                                //bring down the parent (use index-1 because we are at a right child)

    //move the left sibling's right child to be the right sibling leftmost child
    if(!right.isLeaf){
      right.childNodes[0] = left.childNodes[left.keys.length];
      left.childNodes.length--;
    }

    //move the node from the left sibling up into the parent
    this.keys[index-1] = left.keys[left.keys.length-1];

    left.keys.length--;                                                         //borrowed a key from the left sibling so decrement the lengths

  }
}

let b_tree = new BTree(2);
b_tree.insert(1);
  b_tree.insert(2);
  b_tree.insert(3);
  b_tree.insert(4);
   b_tree.insert(5);
  b_tree.insert(6);
   b_tree.insert(7);
   b_tree.insert(8);
  b_tree.insert(9);
  b_tree.insert(10);
  b_tree.insert(11);
  b_tree.insert(12);
  b_tree.insert(13);
  b_tree.insert(14);
  b_tree.delete(4);

Animations.drawTree(b_tree);
b_tree.search(7);
Animations.runQueue(b_tree,1500);
//b_tree.search(2);
//Animations.runQueue(b_tree,1500);
//Animations.clearTree();
//Animations.drawTree(b_tree);