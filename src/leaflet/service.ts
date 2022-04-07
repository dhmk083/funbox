import type ByNameData from "./fixtures/searchByName.json";
import type ByCoordsData from "./fixtures/searchByCoords.json";
import { loadLink, loadScript } from "utils";
import { Coords, SearchByCoords, SearchByName } from "types";

const accessToken = process.env.REACT_APP_LEAFLET_API_KEY;

export const L = () => globalThis.L;

export const init = async () => {
  if (!L()) {
    return Promise.all([
      loadLink("https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"),
      loadScript("https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"),
    ]);
  }
};

export const searchByName: SearchByName = (q) => {
  return fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      q
    )}.json?access_token=${accessToken}`
  )
    .then<typeof ByNameData>((r) => r.json())
    .then((d) =>
      d.features.map((x) => ({
        coords: x.center.reverse() as Coords,
        label: x.place_name,
      }))
    );
};

export const searchByCoords: SearchByCoords = (c) => {
  return fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${c[1]},${c[0]}.json?access_token=${accessToken}`
  )
    .then<typeof ByCoordsData>((r) => r.json())
    .then((d) => d.features.map((x) => x.place_name));
};

export const mapLayer = () =>
  L().tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken,
    }
  );
