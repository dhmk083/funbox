import create from "zustand";
import { Id, Point, RawPoint } from "./types";

export type Store = {
  path: Point[];

  selected: Id | null;

  actions: {
    addPoint(p: RawPoint, refId?: Id);
    removePoint(id: Id);
    movePoint(refId: Id, id: Id);

    select(id: Id | null);
  };
};

export const createStore = () =>
  create<Store>((set) => ({
    path: [],

    selected: null,

    actions: {
      addPoint(p, refId) {
        set((old) => {
          const path = old.path.slice();
          const point = toPoint(p);
          if (!refId) refId = point.id;

          const refi = path.findIndex((p) => p.id === refId);
          const pi = path.findIndex((p) => p.id === point.id);

          if (refi === -1) {
            path.push(point);
          } else {
            path[refi] = point;
          }

          if (pi !== -1 && pi !== refi) path.splice(pi, 1);

          return { path };
        });
      },

      removePoint(id) {
        set((old) => ({
          path: old.path.filter((p) => p.id !== id),
        }));
      },

      movePoint(refId, id) {
        set((old) => {
          const refi = old.path.findIndex((p) => p.id === refId);
          const pi = old.path.findIndex((p) => p.id === id);

          if (refi === -1 || pi === -1) return old;

          const path = old.path.slice();
          path.splice(refi, 0, path.splice(pi, 1)[0]);

          return { path };
        });
      },

      select(id) {
        set({ selected: id });
      },
    },
  }));

export const useStore = createStore();

const toPoint = (p: RawPoint) => ({ ...p, id: p.coords.toString() });
