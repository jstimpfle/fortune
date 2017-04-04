function sq(x) {
  return x*x;
}

/*
 * Compute the y value of the parabola given by (px,py,ly) at x.
 */
function parabolic_y(px, py, ly, x) {
    return (x*x - 2*x*px + px*px + py*py - ly*ly) / (2*py - 2*ly);
}

/*
 * Compute the x-coordinates of the intersection points of the two parabolas
 * given by (px,py,ly) and (qx,qy,ly). px,py,qx,qy define two points P and Q
 * and ly defines a horizontal line.
 * We require ly < py,qy, so both parabolas are open to the top. They
 * have two intersection points if py <> qy, otherwise they have only one
 * intersection in ((px+qx)/2, py).
 */
function intersection_points(px, py, qx, qy, ly) {
  if (py == qy)
    return [(px+qx)/2];

  let cp = px*px + py*py - ly*ly;
  let cq = qx*qx + qy*qy - ly*ly;
  let pl = py - ly;
  let ql = qy - ly;
  let P = 2 * (qx*pl - px*ql) / (qy - py);
  let Q = (cp*ql - cq*pl) / (qy - py);
  let sol1 = -P/2 - Math.sqrt(sq(P/2) - Q);
  let sol2 = -P/2 + Math.sqrt(sq(P/2) - Q);

  return [sol1, sol2];
}

/*
 * Compute the point of transition between two parabolas. If two parabolas have
 * two intersection points, then the one which has a segment of the p-parabola
 * to the left and a segment of the q-parabola to the right is returned.
 *
 * Otherwise (py == qy), the single intersection point of the parabolas is
 * returned.
 */
function transition_point(px, py, qx, qy, ly) {
  if (px == qx && py == qy)
    throw "invalid: points are equal";
  if (py == qy && px > qx)
    throw "invalid: py == qy and px > qx";
  let points = intersection_points(px, py, qx, qy, ly);
  if (py == qy)
    return points[0];  /* there should be only one */
  else if (py < qy)
    return points[0];
  else
    return points[1];
}

/*
 * Compute the center point of the circle that contains the three points p,q,r.
 * If the points are collinear there is no such circle and null is returned.
 */
function circle_center(px, py, qx, qy, rx, ry) {
  let v1 = sq(rx)+sq(ry)-sq(px)-sq(py);
  let v2 = sq(qx)+sq(qy)-sq(px)-sq(py);
  let y = (v1*(qx-px)-v2*(rx-px)) / (2*((rx-px)*(py-qy)-(py-ry)*(qx-px)));
  let x = (sq(qx)-sq(px)+sq(qy-y)-sq(py-y))/(2*(qx-px));
  let r = Math.sqrt(sq(px-x)+sq(py-y));
  //console.log([x, y, r]);
  return [x, y, r];
}
