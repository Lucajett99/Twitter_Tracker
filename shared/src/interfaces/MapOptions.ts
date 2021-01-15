import { IGeoPoint } from './GeoPoint';

export interface IMapOptions {
    center: IGeoPoint;
    zoom: number,
    markers: IGeoPoint[]
}