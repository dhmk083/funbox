import { Coords } from "./types";

export const getDefaultCoords = () =>
  new Promise<Coords>((res) => {
    navigator.geolocation.getCurrentPosition(
      (x) => res([x.coords.latitude, x.coords.longitude]),
      () => res([0, 0])
    );
  });

export const formatCoords = (c: Coords, brackets = false) =>
  `${brackets ? "[" : ""}${c.join(", ")}${brackets ? "]" : ""}`;

export const loadScript = (src: string) =>
  new Promise((res, rej) => {
    const node = document.createElement("script");
    node.src = src;
    node.async = true;
    node.onload = res;
    node.onerror = rej;

    document.head.appendChild(node);
  });

export const loadLink = (href: string) =>
  new Promise((res, rej) => {
    const node = document.createElement("link");
    node.rel = "stylesheet";
    node.href = href;
    node.onload = res;
    node.onerror = rej;

    document.head.appendChild(node);
  });

export const needPan = (pt: Coords, [lt, rb]: [Coords, Coords], pad = 0.05) => {
  const rx = (pt[0] - lt[0]) / (rb[0] - lt[0]);
  const ry = (pt[1] - lt[1]) / (rb[1] - lt[1]);

  return rx < 0 + pad || rx > 1 - pad || ry < 0 + pad || ry > 1 - pad;
};
