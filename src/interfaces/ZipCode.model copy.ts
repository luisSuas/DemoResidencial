import { Geopoint } from "./geopoint.model"

export interface ZipCode {
    code: string,
    city: string,
    state: string
    geoloc?: Geopoint
    _geoloc?: [number, number]
    latitude: number,
    longitude: number
};

export interface ZipCodeCreation {
    code: string,
    city: string,
    state: string
    _geoloc?: [number, number]
    latitude: number,
    longitude: number
};