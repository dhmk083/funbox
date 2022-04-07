import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Loader from "components/Loader";
import MapPage from "components/MapPage";
import { SearchByName } from "types";
import styles from "./styles.module.css";

// Yandex
import YandexMap from "yandex/Map";
import {
  searchByName as yandexSearch,
  init as yandexInit,
} from "yandex/service";

// Leaflet
import LeafletMap from "leaflet/Map";
import {
  searchByName as leafletSearch,
  init as leafletInit,
} from "leaflet/service";

export default function App() {
  const [searchProvider, setSearchProvider] = React.useState<SearchByName>(
    () => async () => []
  );

  return (
    <BrowserRouter>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.linksWrap}>
            <Link to="/yandex">Yandex Maps</Link>
            <Link to="/leaflet">Leaflet Maps</Link>
          </div>
        </div>

        <div className={styles.main}>
          <Routes>
            <Route element={<MapPage searchProvider={searchProvider} />}>
              <Route
                path="/yandex"
                element={
                  <Loader
                    load={yandexInit}
                    onLoad={() => setSearchProvider(() => yandexSearch)}
                  >
                    <YandexMap />
                  </Loader>
                }
              />

              <Route
                path="/leaflet"
                element={
                  <Loader
                    load={leafletInit}
                    onLoad={() => setSearchProvider(() => leafletSearch)}
                  >
                    <LeafletMap />
                  </Loader>
                }
              />

              <Route path="*" element={<Navigate to="/yandex" replace />} />
            </Route>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
