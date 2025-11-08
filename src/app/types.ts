export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Mission = {
  id: string;
  name: string;
  locations: Coordinates[];
};
