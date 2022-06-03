export type Attribute = 'challenge' | 'final' | 'red' | 'blue'
export interface Point {
    x: number,
    y: number
}
export interface MapData {
    pos: Point,
    visible: boolean,
    attributes: Attribute[]
}
export interface Level {
    name: string,
    statictargets: string[],
    dynamictargets: string[],
    matchregex: string,
    restrictiontext: string,
    regexrestriction: [string,string],
    matchregexflags: string,
    checkgroups: boolean,
    entries: number,
    hideflags: boolean,
    leveltext: string,
    addref: [string,string][],
    next: string[],
    prev: string[],
    mapdata: MapData
}
export interface GameData {
    version: string
    completed: string[],
    introPlayed: boolean,
    currentLevel: number,
    completedSet: Set<string>
}