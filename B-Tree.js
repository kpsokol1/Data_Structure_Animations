class BTree{
  constructor(t){
    //member variables
    this.t = t;                                                 //keeps track of the degree of the tree 2-3,2-4,2-5....
    this.root = new Node(t);                                    //reference to root node
    this.maxKeys = 2*t - 1;                                     //the maximum amount of keys a node can have before needing a split
    this.maxChildren = 2*t;                                     //the maximum number of children a node can have
    this.minKeys = t-1;                                         //the minimum number of keys a node must have, otherwise a merge needs to occur
  }

  insert(key){
    let r = this.root;

    if(r.keys.length ===  this.maxKeys){                    //check if the root is already full, if so, we must do a premptive split on the way down
      let s = new Node(this.t);                                 // create a new node for our new root
      this.root = s;                                            //assign the new root because we are splitting the root and increasing the height of the tree by 1
      s.isLeaf = false;                                         //since this is the root, it is not a leaf
      s.childNodes.push(r);                                     //make the old root, s (new root) leftmost child
      s.splitChild(0);                                 //split the old root, which is s's new child
      s.insert_nonfull(key);                                    //root was split, now try to insert the key
    }
    else{
      r.insert_nonfull(key);                                    //the root did not need to be split, try to insert the key
    }
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
    for(let j = this.t; j <= 2*this.t - 2; j++){              //we split the child in half at the mid-point index (t-1), left side might be bigger
      right.keys.push(left.keys[j]);                          //assign the rightmost keys of the left child to the right child
    }

    //move the children form left to right child
    if (!left.isLeaf){
      for(let j = this.t; j <= 2*this.t - 1; j++){                          //we split the child in half at the mid-point index (t-1), left side might be bigger
        right.childNodes.push(left.childNodes[j]);                          //assign the rightmost keys of the left child to the right child
      }
    }
    left.length = this.t;                                                   //essentially delete from the left what was moved to right

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

    left.length = left.length - 1;                                        //get rid of the median from the end of the left node
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
  search(key){
    let i = 0;
    while(i < this.keys.length && key > this.keys[i]){                  //locate roughly where to look (iterate through the keys until we are greater than or equal to the key)
      i++;
    }

    if(i < this.keys.length && key === this.keys[i]){                     //we found the key
      return {this,i};                                                    //return the node the key was found out and the index of the key in the node  //fixme may need to change this later
    }

    else if(this.isLeaf){                                                 //we are at a leaf and didn't see the key, the key doesn't exit
      return null;                                                        //return null
    }
    else{
      return this.childNodes[i].search(key);                              //recurse on the right,child (we were greater than the key)
    }
  }
}

