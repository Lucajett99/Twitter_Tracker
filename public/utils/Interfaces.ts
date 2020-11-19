import { Moment } from 'moment';

export interface TimeRange {
    start?: Date | Moment;
    end?: Date | Moment;
}