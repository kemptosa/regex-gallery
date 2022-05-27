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
    addref: [string,string][],
    next: string | null,
    prev: string | null,
    mapdata: MapData
}
export interface GameData {
    version: string
    completed: string[],
    introPlayed: boolean,
    currentLevel: number,
    completedSet: Set<string>
}