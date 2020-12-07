import { Moment } from 'moment';

export interface TimeRange {
    since?: Date | Moment;
    until?: Date | Moment;
}

export interface GeoCode {
    latitude: string;
    longitude: string;
    radius: string; // mi (miles) or km (kilometers)
}

export interface SearchParams {
    keywords?: string;
    author?: string;
    location?: string;
    geocode?: string; 
    since?: Date | Moment;
    until?: Date | Moment;
}
