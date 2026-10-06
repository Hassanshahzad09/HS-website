import { MapRoutes } from "@/components/MapRoutes";
import { Reveal, SectionHeading, SplitText } from "@/components/Reveal";
import { MAP, project } from "@/lib/map";

// Very coarse continent outlines (lon, lat) — only used to decide which grid
// dots are "land" for the dotted map. Not cartographically precise.
const LAND: [number, number][][] = [
  [[-168, 66], [-140, 70], [-100, 72], [-80, 73], [-62, 60], [-55, 50], [-66, 44], [-75, 35], [-81, 25], [-90, 29], [-97, 26], [-97, 18], [-88, 15], [-83, 9], [-78, 8], [-90, 14], [-105, 20], [-110, 23], [-117, 32], [-124, 40], [-124, 48], [-135, 58], [-150, 60], [-165, 55]],
  [[-55, 60], [-22, 70], [-20, 82], [-60, 82], [-70, 76]],
  [[-78, 8], [-60, 10], [-50, 0], [-35, -6], [-39, -18], [-48, -28], [-58, -38], [-66, -46], [-70, -54], [-75, -50], [-73, -38], [-70, -18], [-81, -5]],
  [[-10, 36], [-9, 43], [-1, 44], [-4, 48], [2, 51], [8, 54], [8, 57], [5, 59], [6, 62], [14, 68], [26, 71], [40, 67], [60, 68], [60, 50], [40, 46], [28, 41], [23, 36], [15, 38], [12, 44], [3, 42], [-2, 36]],
  [[-6, 50], [1, 51], [0, 54], [-2, 58], [-6, 58], [-5, 54]],
  [[-17, 15], [-16, 24], [-9, 33], [10, 37], [20, 32], [32, 31], [43, 12], [51, 12], [40, -3], [40, -15], [35, -24], [27, -34], [18, -34], [12, -17], [9, -1], [8, 5], [-8, 4], [-13, 8]],
  [[28, 41], [40, 46], [60, 50], [60, 68], [100, 77], [140, 73], [180, 68], [170, 60], [160, 52], [142, 53], [135, 44], [128, 38], [122, 31], [120, 23], [109, 20], [108, 11], [103, 2], [100, 7], [98, 16], [92, 22], [88, 22], [80, 15], [78, 8], [73, 18], [67, 24], [57, 26], [52, 28], [48, 30], [36, 36]],
  [[35, 30], [48, 30], [56, 26], [59, 22], [52, 16], [44, 13], [39, 21]],
  [[96, 5], [105, -5], [120, -9], [140, -8], [150, -6], [135, -2], [118, 5], [110, 2]],
  [[130, 32], [140, 35], [142, 42], [145, 44], [140, 43], [136, 36]],
  [[114, -22], [122, -17], [131, -12], [142, -11], [146, -19], [153, -27], [150, -37], [140, -38], [131, -32], [116, -34]],
];

function inside(lon: number, lat: number, poly: [number, number][]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const DOTS: string[] = [];
for (let lat = 80; lat >= -56; lat -= 2.6)
  for (let lon = -178; lon <= 180; lon += 2.6)
    if (LAND.some((p) => inside(lon, lat, p))) {
      const [x, y] = project(lon, lat);
      DOTS.push(`M${x.toFixed(1)} ${y.toFixed(1)}h.01`);
    }

export function Global() {
  return (
    <section className="on-dark relative overflow-hidden bg-bg py-13.5 text-ink lg:py-21.5">
      <div className="blob right-0 top-0 size-[36rem] bg-brand/15" aria-hidden="true" />
      <div className="container-x relative">
        <SectionHeading eyebrow="International order fulfilment" text="Made in Pakistan and shipped to brands across borders. One team handles production, packing and export paperwork.">
          <SplitText segments={["From our production floor to brands ", { text: "around the world.", gradient: true }]} />
        </SectionHeading>

        <Reveal className="mt-10 lg:mt-12" y={40}>
          <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="w-full" role="img" aria-label="Dotted world map with shipping lanes from Pakistan to the United Kingdom, Europe, the UAE and the USA">
            <path d={DOTS.join("")} stroke="var(--ink)" strokeOpacity={0.22} strokeWidth={2.6} strokeLinecap="round" fill="none" />
            <MapRoutes />
          </svg>
        </Reveal>

        <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-sm text-muted">
          <li>Serving brands across borders</li>
          <li>Export-ready packing</li>
          <li>Door-to-door shipping options</li>
        </ul>
      </div>
    </section>
  );
}
