import { IGeocode } from './Geocode';

export interface ISearchParams {
    keywords?: string;
    author?: string;
    locations?: string; // Bounding box for stream API i.e. '-122.75,36.8,-121.75,37.8' corresponds to San Francisco, Florida
    geocode?: IGeocode | string; // `${latitude},${longitude},${radius}`
    since?: Date | string;
    until?: Date | string;
    place?: string;
    radius?: string;
    lang?:string;
}
