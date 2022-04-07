import React from "react";
import { createPortal } from "react-dom";
import { cancellableEffect } from "@dhmk/utils";
import { useRefLive, useEffect2 } from "@dhmk/react";
import { L, mapLayer, searchByCoords } from "../service";
import { useStore } from "store";
import { Coords, Point } from "types";
import { getDefaultCoords, formatCoords, needPan } from "utils";
import styles from "./styles.module.css";

export default function Map() {
  const path = useStore((s) => s.path);
  const { addPoint } = useStore((s) => s.actions);
  const mapNode = React.useRef<any>();
  const [map, setMap] = React.useState<any>();

  React.useEffect(
    () =>
      cancellableEffect(async (checkCancel) => {
        const coords = await getDefaultCoords().then(checkCancel);

        setMap(
          L()
            .map(mapNode.current)
            .setView(coords, 13)
            .addLayer(mapLayer())
            .on("click", async (ev) => {
              const { lat, lng } = ev.latlng;
              const coords: Coords = [lat, lng];
              const r = await searchByCoords(coords);
              const label = r[0] ?? formatCoords(coords, true);

              addPoint({ coords, label });
            })
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <div ref={mapNode} style={{ height: "100%" }}></div>

      {map && <Line map={map} path={path.map((p) => p.coords)} />}

      {map && path.map((p) => <Marker key={p.id} map={map} point={p} />)}
    </>
  );
}

type MarkerProps = {
  point: Point;
  map;
};

function Marker({ point, map }: MarkerProps) {
  const { addPoint, removePoint, select } = useStore((s) => s.actions);
  const selected = useStore((s) => s.selected);
  const markerRef = React.useRef<any>();
  const popupRef = React.useRef(document.createElement("div"));
  const pointRef = useRefLive(point);

  React.useEffect(() => {
    const marker = L()
      .marker(point.coords, {
        draggable: true,
      })
      .addTo(map)
      .bindPopup(popupRef.current)
      .on("dragend", async () => {
        const currentPoint = pointRef.current;
        const { lat, lng } = markerRef.current.getLatLng();
        const coords = [lat, lng] as Coords;
        const r = await searchByCoords(coords);
        const label = r[0] ?? formatCoords(coords, true);

        addPoint({ coords, label }, currentPoint.id);
      })
      .on("mouseover", () => select(pointRef.current.id))
      .on("mouseout", () => select(null));

    markerRef.current = marker;
    return () => {
      marker.removeFrom(map);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  React.useEffect(() => {
    markerRef.current.setLatLng(point.coords);
  }, [point.coords]);

  const isSelected = selected === point.id;

  useEffect2(
    (isInitial) => {
      markerRef.current._icon.classList.toggle(styles.selected, isSelected);

      const tid = setTimeout(() => {
        if (isSelected || isInitial) {
          const bounds = map.getBounds();
          const lt: Coords = [bounds.getNorth(), bounds.getWest()];
          const rb: Coords = [bounds.getSouth(), bounds.getEast()];

          if (needPan(point.coords, [lt, rb])) {
            map.panTo(point.coords);
          }
        }
      }, 500);

      return () => {
        clearTimeout(tid);
      };
    },
    [isSelected]
  );

  return createPortal(
    <div>
      <b>{point.label}</b>
      <p>{formatCoords(point.coords)}</p>
      <button onClick={() => removePoint(point.id)}>Удалить</button>
    </div>,
    popupRef.current
  );
}

type LineProps = {
  map;
  path: Coords[];
};

function Line({ map, path }: LineProps) {
  const lineRef = React.useRef<any>();

  React.useEffect(() => {
    const line = (lineRef.current = L().layerGroup().addTo(map));

    return () => {
      line.remove();
    };
  }, [map]);

  React.useEffect(() => {
    const layer = lineRef.current;
    if (!layer) return;

    layer.clearLayers();
    L().polyline(path).addTo(layer);
  });

  return null;
}
