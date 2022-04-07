import React from "react";
import { createPortal } from "react-dom";
import { cancellableEffect } from "@dhmk/utils";
import { useRefLive, useEffect2 } from "@dhmk/react";
import { Y, searchByCoords } from "../service";
import { useStore } from "store";
import { Point, Coords } from "types";
import { formatCoords, getDefaultCoords, needPan } from "utils";

export default function Map() {
  const path = useStore((s) => s.path);
  const { addPoint } = useStore((s) => s.actions);
  const mapNode = React.useRef<any>();
  const [map, setMap] = React.useState<any>();

  React.useEffect(
    () =>
      cancellableEffect(async (checkCancel) => {
        const center = await getDefaultCoords().then(checkCancel);

        const map = new (Y().Map)(mapNode.current, {
          center,
          zoom: 13,
          controls: ["geolocationControl", "zoomControl"],
          autoFitToViewport: "always",
        });

        map.events.add("click", async (ev) => {
          const coords = ev.get("coords");
          const r = await searchByCoords(coords);
          const label = r[0] ?? formatCoords(coords);
          addPoint({ coords, label });
        });

        setMap(map);
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
  map;
  point: Point;
};

function Marker({ map, point }: MarkerProps) {
  const { addPoint, removePoint, select } = useStore((s) => s.actions);
  const selected = useStore((s) => s.selected);
  const [node, setNode] = React.useState<HTMLElement | null>(null);
  const markerRef = React.useRef<any>();
  const pointRef = useRefLive(point);

  React.useEffect(() => {
    const id = `marker-${point.id}`;

    const balloonContentLayout = Y().templateLayoutFactory.createClass(
      `<div id="${id}" />`,
      {
        build() {
          balloonContentLayout.superclass.build.call(this);
          setNode(document.getElementById(id));
        },

        clear() {
          balloonContentLayout.superclass.clear.call(this);
        },
      }
    );

    const marker = (markerRef.current = new (Y().Placemark)(
      point.coords,
      {},
      { draggable: true, balloonContentLayout }
    ));

    marker.events
      .add("dragend", async () => {
        const coords = marker.geometry.getCoordinates() as [number, number];
        const r = await searchByCoords(coords);
        const label = r[0] ?? formatCoords(coords, true);
        addPoint({ coords, label }, point.id);
      })
      .add("mouseenter", () => select(pointRef.current.id))
      .add("mouseleave", () => select(null));

    map.geoObjects.add(marker);

    return () => {
      map.geoObjects.remove(marker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, point]);

  const isSelected = selected === point.id;

  useEffect2(
    (isInitial) => {
      const marker = markerRef.current;

      if (isSelected) marker.options.set("preset", "islands#redIcon");
      else marker.options.unset("preset");

      const tid = setTimeout(() => {
        if (isSelected || isInitial) {
          if (needPan(point.coords, map.getBounds())) {
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

  return (
    node &&
    createPortal(
      <div>
        <b>{point.label}</b>
        <p>{formatCoords(point.coords)}</p>
        <button onClick={() => removePoint(point.id)}>Удалить</button>
      </div>,
      node
    )
  );
}

type LineProps = {
  map;
  path: Coords[];
};

function Line({ map, path }: LineProps) {
  const lineRef = React.useRef<any>();

  React.useEffect(() => {
    const line = (lineRef.current = new (Y().Polyline)(
      path,
      {},
      {
        strokeColor: "#000000",
        strokeWidth: 4,
        strokeOpacity: 0.5,
      }
    ));

    map.geoObjects.add(line);

    return () => {
      map.geoObjects.remove(line);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  React.useEffect(() => {
    lineRef.current?.geometry.setCoordinates(path);
  }, [path]);

  return null;
}
