var color_r = 0;
var color_g = 0;
var color_b = 0;
var color_a = 255;

function set_color(r, g, b, a) {
  color_r = r;
  color_g = g;
  color_b = b;
  color_a = a;
}

function black_color() {
  set_color(0, 0, 0, 255);
}

function red_color() {
  set_color(255, 0, 0, 255);
}

function green_color() {
  set_color(0, 255, 0, 255);
}

function blue_color() {
  set_color(0, 0, 255, 255);
}

function draw_point(img, w, h, x, y) {
  img.data[4*(y*w+x)] = color_r;
  img.data[4*(y*w+x)+1] = color_g;
  img.data[4*(y*w+x)+2] = color_b;
  img.data[4*(y*w+x)+3] = color_a;
}

function draw_thick_point(img, w, h, x, y) {
  if (x < 0 || x >= w)
    return;
  if (y < 0 || y >= h)
    return;
  draw_point(img, w, h, x, y);
  draw_point(img, w, h, x, y+1);
  draw_point(img, w, h, x+1, y);
  draw_point(img, w, h, x+1, y+1);
}

function draw_horizontal_line(img, w, h, y) {
  for (let x = 0; x < w; x++)
    draw_point(img, w, h, x, y);
}

function draw_parabola(img, w, h, x1, x2, px, py, ly) {
  for (let x = x1; x < x2; x++) {
    let y = Math.round((x*x - 2*x*px + px*px + py*py - ly*ly) / (2*py - 2*ly))
    if (0 <= y && y < h) {
      draw_point(img, w, h, x, y);
    }
  }
}

function draw_two_parabola_sections(img, w, h, px, py, qx, qy, ly) {
  [sol1, sol2] = intersection_points(px, py, qx, qy, ly);
  sol1 = Math.round(sol1);
  sol2 = Math.round(sol2);
  console.log([sol1, sol2]);

  black_color();
  draw_thick_point(img, w, h, px, py);
  draw_thick_point(img, w, h, qx, qy);

  red_color();
  draw_thick_point(img, w, h, sol1, ly);
  draw_thick_point(img, w, h, sol2, ly);

  black_color();
  draw_horizontal_line(img, w, h, ly);

  black_color();
  if (py >= qy) {
    draw_parabola(img, w, h, 0, sol1, qx, qy, ly);
    draw_parabola(img, w, h, sol1, sol2, px, py, ly);
    draw_parabola(img, w, h, sol2, w, qx, qy, ly);
  } else {
    draw_parabola(img, w, h, 0, sol1, px, py, ly);
    draw_parabola(img, w, h, sol1, sol2, qx, qy, ly);
    draw_parabola(img, w, h, sol2, w, px, py, ly);
  }
}

function draw_circle(img, w, h, px, py, qx, qy, rx, ry) {
  let [x, y, r] = circle_center(px, py, qx, qy, rx, ry);

  blue_color();
  draw_thick_point(img, w, h, px, py);
  draw_thick_point(img, w, h, qx, qy);
  draw_thick_point(img, w, h, rx, ry);

  red_color();
  draw_thick_point(img, w, h, Math.round(x), Math.round(y));

  green_color();
  for (let tx = Math.round(x); tx < x+r; tx++) {
    draw_thick_point(img, w, h, tx, Math.round(y));
  }
}

function draw() {
  let w = 800;
  let h = 600;

  let canvas = document.getElementById('canvas');
  canvas.setAttribute('width', w);
  canvas.setAttribute('height', h);
 
  if (!canvas.getContext)
    alert('No draw context');

  let ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'red';
  ctx.fillStyle = 'blue';
  ctx.imageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;

  let img = ctx.getImageData(0, 0, w, h);

  let px = 100;
  let py = 80;
  let ly = 100;

  draw_circle(img, w, h, 200, 200, 300, 225, 200, 250);
  /*
  draw_circle(img, w, h, 200, 200, 240, 240, 200, 250);
  */

  draw_two_parabola_sections(img, w, h, 100, 85, 150, 70, 120);

  ctx.putImageData(img, 0, 0);
}

/*
 * Draw a parabolic front.
 *
 * beach: an Avltree of Intersection objects
 * ly: y-coordinate of sweep line
 */
function draw_parabolic_front(beach, ly) {

}
