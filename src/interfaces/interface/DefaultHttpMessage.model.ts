export interface DefaultHttpMessage {
    message: string;
    status: number;
}

export interface GETMultipleResponse<T> {
    rows: T[];
    count: number;
    nextId?: number;
}