export type LevelName = 'intro' | 'cats_and_bars' | 'more_specific_non' | 'word_esque' | 'an_unknown_quantity_i' | 'an_unknown_quantity_ii' | 'beyond_the_boundary' | 'digit_adjacent' | 'regarding_flags_i' | 'regarding_flags_ii' | 'a_known_quantity' | 'end'
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
    next: LevelName[],
    prev: LevelName[],
    mapdata: MapData
}
export type LevelData = Map<LevelName, Level>
export interface GameData {
    version: string
    completed: LevelName[],
    introPlayed: boolean,
    currentLevel: number,
    completedSet: Set<LevelName>
}