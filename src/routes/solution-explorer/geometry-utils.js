// Function to step along the normal vector of a line, from point (x, y) adding a vector of length 'length'
function normalVector(angle, x, y, length) {
  // Calculate the angle of the normal (perpendicular to the line)
  const normalAngle = angle + Math.PI / 2;

  // Calculate the components of the normal vector
  const nx = Math.cos(normalAngle) * length;
  const ny = Math.sin(normalAngle) * length;

  // New point after traveling along the normal
  const newX = x + nx;
  const newY = y + ny;

  return { x: newX, y: newY, nx: nx, ny: ny };
}


export { normalVector }