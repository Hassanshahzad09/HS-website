// Equirectangular projection shared by the dotted world map and its routes.
export const MAP = { w: 1000, h: 470, latTop: 84, latBottom: -58 };

export const project = (lon: number, lat: number): [number, number] => [
  ((lon + 180) / 360) * MAP.w,
  ((MAP.latTop - lat) / (MAP.latTop - MAP.latBottom)) * MAP.h,
];
