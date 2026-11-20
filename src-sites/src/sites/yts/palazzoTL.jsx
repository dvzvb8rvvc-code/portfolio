// Shared timeline for the Palazzo film (plain JS — imported by both the DOM layer and the 3D chunk).
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x) }

// rooms of the piano-nobile walk (photo ids, each has a depth map) + the frescoed vault at the end
export const ROOMS = [148, 156, 157, 152, 143]
export const VAULT = 154
export const TL = {
  intro: [0, 0.06],
  explode: [0.05, 0.24],
  dusk: [0.06, 0.44],
  focus: [0.24, 0.38],
  total: [0.27, 0.38],
  close: [0.4, 0.46],
  fly: [0.4, 0.515],
  enter: 0.515, // flash peak: building → interior
  rooms: [0.515, 0.875],
  look: [0.875, 0.97],
}
export const explodeOf = p => smooth(TL.explode[0], TL.explode[1], p) * (1 - smooth(TL.close[0], TL.close[1], p))
export const ROOM_SPAN = ROOMS.length - 1 + 0.6
// eased room-time: slow while a room is in view, quicker through the portal between rooms
export function roomTime(p) {
  const f = clamp((p - TL.rooms[0]) / (TL.rooms[1] - TL.rooms[0])) * ROOM_SPAN
  const k = Math.min(Math.floor(f), ROOMS.length - 1), fr = f - k
  return k + fr - (0.6 * Math.sin(2 * Math.PI * (fr - 0.25))) / (2 * Math.PI)
}
// scroll progress at which room k is centred (for captions)
export const roomP = k => TL.rooms[0] + ((k + 0.25) / ROOM_SPAN) * (TL.rooms[1] - TL.rooms[0])
