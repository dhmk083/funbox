import { createStore } from "store";
import { RawPoint } from "types";

const point = (x = Math.random(), label = ""): RawPoint => ({
  coords: [x, 0],
  label,
});

const getId = (store: ReturnType<typeof createStore>, n: number) =>
  store.getState().path[n].id;

const getLabels = (store: ReturnType<typeof createStore>) =>
  store.getState().path.map((p) => p.label);

it("initial state", () => {
  const store = createStore();
  expect(store.getState()).toMatchObject({
    path: [],
    selected: null,
    actions: expect.any(Object),
  });
});

describe("store actions", () => {
  it("addPoint", () => {
    const store = createStore();
    store.getState().actions.addPoint(point(1, "1"));
    store.getState().actions.addPoint(point(2, "2"));
    store.getState().actions.addPoint(point(3, "3"));

    // replace same id
    store.getState().actions.addPoint(point(1, "1a"));
    expect(getLabels(store)).toEqual(["1a", "2", "3"]);

    // replace other id
    store.getState().actions.addPoint(point(4, "4"), getId(store, 1));
    expect(getLabels(store)).toEqual(["1a", "4", "3"]);

    // replace other id + same id
    store.getState().actions.addPoint(point(1, "1b"), getId(store, 2));
    expect(getLabels(store)).toEqual(["4", "1b"]);
  });

  it("removePoint", () => {
    const store = createStore();
    store.getState().actions.addPoint(point(1, "1"));
    store.getState().actions.addPoint(point(2, "2"));
    store.getState().actions.addPoint(point(3, "3"));

    store.getState().actions.removePoint(getId(store, 1));
    expect(getLabels(store)).toEqual(["1", "3"]);
  });

  it("movePoint", () => {
    const store = createStore();
    store.getState().actions.addPoint(point(1, "1"));
    store.getState().actions.addPoint(point(2, "2"));
    store.getState().actions.addPoint(point(3, "3"));

    store.getState().actions.movePoint(getId(store, 0), getId(store, 2));
    expect(getLabels(store)).toEqual(["3", "1", "2"]);

    store.getState().actions.movePoint(getId(store, 2), getId(store, 0));
    expect(getLabels(store)).toEqual(["1", "2", "3"]);
  });

  it("select", () => {
    const store = createStore();
    expect(store.getState().selected).toBe(null);

    store.getState().actions.addPoint(point());
    const p = store.getState().path[0];
    store.getState().actions.select(p.id);
    expect(store.getState().selected).toBe(p.id);

    store.getState().actions.select(null);
    expect(store.getState().selected).toBe(null);
  });
});
