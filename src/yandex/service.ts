import { loadScript } from "utils";
import { SearchByCoords, SearchByName } from "types";

const accessToken = process.env.REACT_APP_YANDEX_MAPS_API_KEY;

export const Y = () => globalThis.ymaps;

export const init = async () => {
  if (!Y()) {
    return loadScript(
      `https://api-maps.yandex.ru/2.1/?apikey=${accessToken}&lang=ru_RU`
    ).then(() => Y().ready());
  }
};

export const searchByName: SearchByName = (q) =>
  Y()
    .geocode(q)
    .then((r) =>
      r.geoObjects.toArray().map((x) => ({
        coords: x.geometry.getCoordinates(),
        label: x.getAddressLine(),
      }))
    );

export const searchByCoords: SearchByCoords = (c) =>
  Y()
    .geocode(c)
    .then((r) => r.geoObjects.toArray().map((x) => x.getAddressLine()));
