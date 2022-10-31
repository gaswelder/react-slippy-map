export const TileSize = 256;

/*
 * Returns radius of the Mercator cylinder
 * corresponding to the given zoom level.
 */
function radius(zoom) {
  let max = TileSize * 2 ** zoom;
  return max / Math.PI / 2;
}

/*
 * Returns x-coordinate on the Mercator cylinder
 * corresponding to the given longitude.
 *
 * Assumed:
 * longitudes change from -180 to 180;
 * x changes from 0 to R * 2pi.
 */
function getX(lon, zoom) {
  // -180..180
  let R = radius(zoom);

  let lambda = toRad(lon); // -pi..pi
  return R * (lambda + Math.PI);
}

/*
 * Returns y-coordinate on the Mercator cylinder
 * corresponding to the given latitude.
 */
function getY(lat, zoom) {
  let R = radius(zoom);

  let phi = toRad(lat); // -pi/2..pi/2
  let y = R * Math.log(Math.tan(phi / 2 + Math.PI / 4)); // -Inf..Inf

  // Add half the surface because we measure from zero.
  // Invert because we measure from the top.
  y += R * Math.PI;
  return 2 * R * Math.PI - y;
}

function getXY(point, zoom) {
  return [getX(point.longitude, zoom), getY(point.latitude, zoom)];
}

function getLatLon(xy, zoom) {
  return {
    latitude: getLat(xy[1], zoom),
    longitude: getLon(xy[0], zoom),
  };
}

/*
 * Returns the latitude corresponding to the given
 * y-coordinate on the Mercator cylinder.
 */
function getLat(y, zoom) {
  let R = radius(zoom);

  // Invert because we measure from top.
  // Subtract half because we measure from zero.
  y = 2 * R * Math.PI - y;
  y -= R * Math.PI;

  let ky = y / R;
  return toDeg(2 * (Math.atan(Math.exp(ky)) - Math.PI / 4));
}

/*
 * Returns the longitude corresponding to the given
 * x-coordinate on the Mercator cylinder.
 */
function getLon(x, zoom) {
  let R = radius(zoom);

  let lambda = x / R; // 0..2pi
  lambda -= Math.PI; // -pi..pi
  return toDeg(lambda);
}

function toDeg(rad) {
  return (rad / Math.PI) * 180;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export default { getX, getY, getLon, getLat, getXY, getLatLon };
