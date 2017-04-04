/*
 * AVL tree - written by Jens Stimpfle in 2017.
 * This code is in the public domain.
 *
 * Status: not heavily tested. probably contains bugs.
 * Development repo: https://github.com/jstimpfle/jsjs
 *
 * The reason why this was written is to get the methods
 * find_first_with_test(test1) and find_last_with_test(test2) where "test1" must
 * be a positively monotonous function and "test2" must be a negatively
 * monotonous function in the ordering of the tree data items.
 *
 * Another feature of this implementation is that it explicitly supports the
 * concept of "mutable" ordering/identity. I.e. the ordering between two given
 * data objects can vary between subsequent calls provided that the tree
 * ordering is not violated.
 *
 * There are three types of functions used for locating tree nodes.
 *
 *  - Predicates ("pred"): Receives a (data) item, returns bool.
 *  - Tester ("test"): Receives a (data) item, returns and integer (<0, 0, >0)
 *        indicating whether the item was found or in which direction to
 *        continue searching.
 *  - Comparison ("cmp"): Receives a data item for meant for insertion and a
 *        data items that is already in the tree. Returns an integer like
 *        tester functions which describes NEWITEM <cmp> OLDITEM.
 *
 *  The tree constructor takes a comparison function which can be used
 *  implicitly in further calls for convenience. Other functions can be used
 *  where suitable but they must be compatible to the tree ordering.
 */

let avltree = (function() {

  function make_node(data) {
    return {
      data: data,
      weight: 0,
      left: null,
      right: null
    };
  }

  function get_weight(node) {
    return node ? node.weight : 0;
  }

  function fix_weight(node) {
    let lw = get_weight(node.left);
    let rw = get_weight(node.right);
    node.weight = Math.max(lw, rw) + 1;
  }

  function get_balance(node) {
    let lw = get_weight(node.left);
    let rw = get_weight(node.right);
    return rw - lw;
  }

  function balance_right(node, pnt, mbr) {
    let nl = node.left;
    node.left = nl.right;
    nl.right = node;
    pnt[mbr] = nl;
  }

  function balance_left(node, pnt, mbr) {
    let nr = node.right;
    node.right = nr.left;
    nr.left = node;
    pnt[mbr] = nr;
  }

  function fix_balance(node, pnt, mbr) {
    let bal = get_balance(node);
    if (bal < -1)
      balance_right(node, pnt, mbr);
    else if (bal > 1)
      balance_left(node, pnt, mbr);
  }

  function insert(node, pnt, mbr, data, test) {
    if (node == null) {
      pnt[mbr] = make_node(data);
      return null;
    }

    let r = test(node.data);

    if (r == 0) {
      return node;
    }

    let n;
    if (r < 0) {
      data = insert(node.left, node, 'left', data, test);
    } else if (r > 0) {
      data = insert(node.right, node, 'right', data, test);
    }
    if (data === null) {
      fix_weight(node);
      fix_balance(node, pnt, mbr);
    }
    return data;
  }

  function erase_rightmost(node, pnt, mbr) {
    if (!node.right) {
      pnt[mbr] = node.left;
      node.left = null;
      return node;
    } else {
      let n = erase_rightmost(node.right, node, 'right');
      fix_weight(node);
      fix_balance(node, pnt, mbr);
      return n;
    }
  }

  /*
  function erase_leftmost(node, pnt, mbr) {
    if (!node.left) {
      pnt[mbr] = node.right;
      node.right = null;
      return node;
    } else {
      let n = erase_leftmost(node.left, node, 'left');
      fix_weight(node);
      fix_balance(node, pnt, mbr);
      return n;
    }
  }
  */

  function erase(node, pnt, mbr, test) {
    if (node == null) {
      return null;
    }
    let r = test(node.data);
    if (r < 0) {
      return erase(node.left, node, 'left', test);
    } else if (r > 0) {
      return erase(node.right, node, 'right', test);
    } else {
      if (!node.left)
        pnt[mbr] = node.right;
      else if (!node.right)
        pnt[mbr] = node.left;
      else {
        let rm = erase_rightmost(node.left, node, 'left');
        rm.left = node.left;
        rm.right = node.right;
        pnt[mbr] = rm;
        fix_weight(rm);
        fix_balance(rm, pnt, mbr);
      }
      node.left = null;
      node.right = null;
      return node.data;
    }
  }

  function find_with_test(node, test) {
    if (node == null)
      return null;
    let r = test(node.data);
    if (r < 0)
      return find_with_test(node.left, test);
    else if (r > 0)
      return find_with_test(node.right, test);
    else
      return node;
  }

  function find_first_with_test(node, pred) {
    if (node == null)
      return null;
    let nl = find_first_with_test(node.left, pred);
    if (nl)
      return nl;
    if (pred(node.data))
      return node;
    return find_first_with_test(node.right, pred);
  }

  function find_last_with_test(node, pred) {
    if (node == null)
        return null;
    let nr = find_last_with_test(node.right, pred);
    if (nr)
      return nr;
    if (pred(node.data))
      return node;
    return find_last_with_test(node.left, pred);
  }

  /*
   * Avltree(cmp)
   *
   * Constructor. Takes a comparison function for use as implicit parameter in
   * subsequent operations.
   *
   * The comparison function should return nonzero for any two items that are in
   * the tree at any given point of time.
   */
  function Avltree(cmp) {
    this.root = null;
    this.cmp = cmp;
  }

  /*
   * Avltree.insert(data)
   *
   * If a data item identical to the given one (according to stored comparator)
   * is found in the tree, return it. Otherwise, insert a new node and return
   * null.
   */
  Avltree.prototype.insert = function Avltree_insert(data) {
    var cmp = this.cmp;
    function test(treedata) { return cmp(data, treedata); }
    return insert(this.root, this, 'root', data, test);
  }

  /*
   * Avltree.erase(data)
   *
   * If a data item identical to the given one (according to stored comparator)
   * is found in the tree, remove the node from the tree and return the data
   * item. Otherwise, return null.
   */
  Avltree.prototype.erase = function Avltree_erase(data) {
    var cmp = this.cmp;
    function test(treedata) { return cmp(data, treedata); }
    return erase(this.root, this, 'root', test);
  }

  /*
   * Avltree.find(data)
   *
   * If a data item identical to the given one (according to stored comparator)
   * is found in the tree, return the node. Otherwise, return null.
   *
   * TODO: The node holding the data is returned, not the data itself. This
   * hints at a possible more powerful C++ style redesign with iterators holding
   * parent pointers.
   */
  Avltree.prototype.find = function Avltree_find(data) {
    var cmp = this.cmp;
    function test(treedata) { return cmp(data, treedata); }
    return find_with_test(this.root, test);
  }

  /*
   * Avltree.find_with_test(test)
   *
   * Like Avltree.find(), but with a custom test function. The test function
   * must match at most one of the elements currently in the tree.
   */
  Avltree.prototype.find_with_test = function Avltree_find(test) {
    return find_with_test(this.root, test);
  }

  /*
   * Avltree.find_first_with_test(test)
   *
   * Similar to Avltree.find_with_test, but the test function is permitted to
   * match more than one of the elements in the tree. The only requirement is
   * that it must be monotonous with regards to the tree ordering, i.e. for any
   * given data item testing as "true", all data items that are greater with
   * respect to the tree ordering must also test as "true".
   *
   * If no item tests as true, null is returned. Otherwise, the least item in
   * the tree (with respect to the ordering) that tests as true is returned.
   */
  Avltree.prototype.find_first_with_test = function Avltree_find_first_with_test(pred) {
    return find_first_with_test(this.root, pred);
  }

  /*
   * Avltree.find_last_with_test(test)
   *
   * Like Avltree.find_last_with_test(test), but the test function is negatively
   * monotonous instead of positively monotonous. The first item that tests to
   * true (if any) is returned.
   */
  Avltree.prototype.find_last_with_test = function Avltree_find_last_with_test(pred) {
    return find_last_with_test(this.root, pred);
  }

  /* Tests. Play-test for better coverage ;-) */

  function _debug_print_node(node, out) {
    if (!node)
      return;
    out.push('(');
    _debug_print_node(node.left, out);
    out.push(node.data);
    _debug_print_node(node.right, out);
    out.push(')');
  }

  function debug_print(tree) {
    let writer = [];
    _debug_print_node(tree.root, writer);
    console.log(writer.join(''));
  }

  function test_implementation() {
    let tree = new Avltree(function(x,y) { return x-y; });

    tree.insert(4);
    tree.insert(2);
    tree.insert(20);
    tree.insert(10);
    tree.insert(17);

    debug_print(tree);

    console.log('find(4): '   + tree.find(4));
    console.log('erase(4): '  + tree.erase(4));
    console.log('find(4): '   + tree.find(4));
    console.log('insert(4): ' + tree.insert(4));
    console.log('insert(4): ' + tree.insert(4));
    console.log('find(4): '   + tree.find(4));

    debug_print(tree);

    console.log(tree.find_first_with_test(function(x) { return x > 4; }));
    console.log(tree.find_last_with_test(function(x) { return x < 5; }));
  }

  return {
    Avltree: Avltree,
    test_implementation: test_implementation,
  };

})()
