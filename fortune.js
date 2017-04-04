// sweep line
let ly = 0;

// parabolic front
let beach = new avltree.Avltree(function (iscn1, iscn2) {
  return transition_point(iscn1, ly) < transition_point(iscn2, ly);
});

/*
 * A node represents a parabolic segment defined by three points (and a sweep
 * line). We require px < qx < rx. The segment is the parabola of (qx,qy,ly),
 * where ly is the implicit sweep line, between the intersection points with
 * the other parabolas.
 */
function Node(px, py, qx, qy, rx, ry) {
	this.px = px;
	this.py = py;
	this.qx = qx;
	this.qy = qy;
	this.rx = rx;
	this.ry = ry;
  this.left = null;
  this.right = null;
}

/*
 * Intersection of two parabolas. An implicit horizontal sweep line is assumed;
 * the parabolas are defined by each of the points (px,py) and (qx,qy) with
 * respect to that sweep line.
 *
 * The parabolas have either one two intersection. The one represented by the two
 * points is the one that has a segment of the p-parabola to the left and a
 * segment of the q-parabola to the right. That means there is no assumed
 * ordering of px and qx.
 */
function Intersection(px, py, qx, qy) {
  this.px = px;
  this.py = py;
  this.qx = qx;
  this.qy = qy;
}

/*
 * Compute the point of intersection of two parabels.
 *
 * "iscn" should be an Intersection object, containing two points.
 *
 * "ly" should be the y-value of a horizontal line, which together with the two
 * points defines two variables. It's required that ly > iscn.py, iscn.qy.
 */
function intersection_point(iscn, ly) {
  return transition_point(iscn.px, iscn.py, iscn.qx, iscn.qy, ly);
}

function point_event(px, py) {
  var nl = find_last_satisfying(node, function(iscn) {
      return transition_point(iscn.px, iscn.py, iscn.qx, iscn.qy, py) < px;
  });
  var nr = find_first_satisfying(node, function(iscn) {
      return transition_point(iscn.px, iscn.py, iscn.qx, iscn.qy, py) >= px;
  });
  if (nl.data.qx != nr.data.px || nl.data.qy != nr.data.py)
    throw "should not happen";

  let i0 = new Intersection(nl.qx, nl.qy, px, py);
  let i1 = new Intersection(px, py, nr.px, nr.py);
  let c0 = circle_center(nl.px, nl.py, nl.qx, nl.py, px, py);
  let c1 = circle_center(nl.px, nl.py, px, py, nr.px, nr.py);
  let c2 = circle_center(px, py, nr.px, nr.py, nr.qx, nr.qy);
  insert(node, i0);
  insert(node, i1);
}
