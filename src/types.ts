export interface Point {
    x: number,
    y: number
}
export interface MapData {
    pos: Point,
    visible: boolean
}
export interface Level {
    name: string,
    statictargets: string[],
    dynamictargets: string[],
    matchregex: string,
    matchregexflags: string,
    checkgroups: boolean,
    entries: number,
    hideflags: boolean,
    leveltext: string,
    addref: string[][],
    next: string,
    prev: string,
    mapdata: MapData
}