export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Mission = {
  id: string;
  name: string;
  description: string;
  locations: Coordinates[];
};
