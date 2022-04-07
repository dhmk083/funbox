export type Id = string;

export type Coords = [number, number];

export type Point = {
  id: Id;
  coords: Coords;
  label: string;
};

export type RawPoint = Omit<Point, "id">;

export type SearchByName = (q: string) => Promise<RawPoint[]>;

export type SearchByCoords = (c: Coords) => Promise<string[]>;
