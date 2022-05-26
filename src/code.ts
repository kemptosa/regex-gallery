import {levelData} from './levelData.js'
import {GameData, Level, Point} from './types.js'

function create(type: string): HTMLElement {return document.createElement(type)}

let rightCol = document.getElementById('right-col')!
let leftCol = document.getElementById('left-col')!
let bottomPane = document.getElementById('bottom-pane')!
let game = document.getElementById('game')!
let regexEntry = document.getElementById('regex-entry')!
let subEntry = document.getElementById('sub-entry')!
let menu = document.getElementById('menu')!
let menuRight = document.getElementById('menu-right')!
let menuView = document.getElementById('menu-view')!
let menuLevelText = document.getElementById('menu-level-text')!
let menuLevelStart = document.getElementById('level-start-button')!
let navPrev = document.getElementById('prev-nav')!
let navMap = document.getElementById('map-nav')!
let navNext = document.getElementById('next-nav')!
let toggleLight = document.getElementById('toggle-light')!

let isTest = /(?:localhost|127\.0\.0\.1)/.test(document.location.hostname)

function overlapSpan(text: string, spans: Array<[string, number, number]>): string {
    let result = ''
    let classes = new Set<string>()
    let ignore = true
    for (let i = 0; i < text.length; i += 1) {
        let changed = false
        classes.clear()
        for (const span of spans) {
            let cl = span[0]
            let start = span[1]
            let end = span[2]
            if (start <= i && i < end) {
                classes.add(cl)
            }
            changed ||= (start === i) || (end === i)
        }
        if (changed) {
            if (!ignore) {
                result += '</span>'
            } else {
                ignore = false
            }
            if (classes.size !== 0) {
                result += `<span class="${Array.from(classes).join(' ')}">`
            } else {
                ignore = true
            }
            
        }
        result += text[i]
    }
    if (classes.size > 0) {
        result += '</span>'
    }
    return result
}

// document.getElementById('right-col-toggle').onclick = function() {
//     rightCol.classList.toggle('closed')
//     bottomPane.classList.toggle('closed')
// }
let gameData: GameData =  {
    version: '0',
    completed: [],
    introPlayed: false,
    currentLevel: 0,
    completedSet: new Set()
}
let defaultData = gameData
void function loadData() {
    let loadedData = localStorage.getItem('gamedata')
    if (loadedData !== null) {
        gameData = JSON.parse(loadedData)
    } else {
        gameData = JSON.parse(JSON.stringify(gameData))
    }
    gameData.completedSet = new Set(gameData.completed)
}()
let saveData = function() {
    gameData.completed = Array.from(gameData.completedSet)
    localStorage.setItem('gamedata', JSON.stringify(gameData))
}
if (!gameData.introPlayed) {
    let introText = Array.from("welcome to regex gallery").reverse()
    let currentText = ''
    let introContainer = document.createElement('p')
    introContainer.className = 'intro'
    introContainer.innerText = '//'
    game.append(introContainer)
    let introLoop: number;
    introLoop = setInterval(()=>{
        introContainer.innerText = `/${currentText}/`
        if (introText.length > 0) {
            currentText += introText.pop()
        } else {
            clearInterval(introLoop)
            setTimeout(()=>{
                introContainer.style.color = "var(--texthidden);"
                setTimeout(()=>{
                    introContainer.remove()
                    start(null)
                }, 500)
            }, 1000)
        }
    }, 100)
} else {
    start(null)
}
let curLevelId = 'intro'
let curLevel = getLevel(curLevelId)
let curEntries: Array<[HTMLElement, HTMLElement]> = []
let curTargets: HTMLElement[] = []
function resetData(save: boolean) {
    gameData = JSON.parse(JSON.stringify(defaultData))
    curLevelId = 'intro'
    curLevel = getLevel(curLevelId)
    curEntries = []
    curTargets.forEach(t=>t.remove())
    curTargets = []
    gameData.completedSet = new Set()
    showLevelInfo('intro')
    if (save) {saveData()}
    start(null)
}
function spanifyAndCheck() {
    if (curLevel === undefined) {return}
    let isAllComplete = true
    for (const target of curTargets) {
        let matchIndices = regexToIndices(curLevel.matchregex, curLevel.matchregexflags, target.innerText, curLevel.checkgroups)
        let isComplete = curEntries.length > 0
        let spans = []
        for (const [regex, flags] of curEntries) {
            let indices = regexToIndices(regex.innerText, flags.innerText, target.innerText, curLevel.checkgroups)
            isComplete = isComplete && (JSON.stringify(indices) === JSON.stringify(matchIndices))
            spans.push(...indicesToSpans(indices, 'at'))
        }
        spans.push(...indicesToSpans(matchIndices, 'ht'))
        target.innerHTML = overlapSpan(target.innerText, spans)
        if (isComplete) {
            target.classList.add('died')
        } else {
            target.classList.remove('died')
        }
        isAllComplete = isAllComplete && isComplete
    }
    if (isAllComplete) {
        gameData.completedSet.add(curLevelId)
        if (!isTest) {
            saveData()
        }
        game.classList.add('fadeout')
        setTimeout(()=>{
            game.classList.remove('fadeout')
            updateMenuLevels()
            startNextLevel()
        }, 1000)
    }
}
function indicesToSpans(indices: number[][][], className: string) {
    let result = []
    for (const outer of indices) {
        for (const inner of outer) {
            result.push(([className, ...inner]) as [string, number, number])
        }
    }
    return result
}
function start(level: string | null) {
    if (level === null) {
        while (getLevel(curLevelId).next !== null) {
            let next = getLevel(curLevelId).next
            if (gameData.completedSet.has(curLevelId)) {
                if (next !== null) {
                    curLevelId = next
                } else {
                    break
                }
            } else {
                break
            }
        }
    } else {
        curLevelId = level
    }
    curLevel = getLevel(curLevelId)
    
    rightCol.querySelector('.leveltext')!.innerHTML = curLevel.leveltext
    rightCol.classList.remove('closed')
    bottomPane.classList.remove('closed')
    curTargets.forEach(t=>t.remove())
    regexEntry.innerHTML = ''
    subEntry.innerHTML = ''
    curTargets = []
    for (const [index, target] of Array.from(curLevel.dynamictargets.entries())) {
        let newTarget = document.createElement('p')
        newTarget.className = 'target scroller'
        newTarget.style.top = `${index}em`
        newTarget.style.animationDelay = `-${Math.random() * 30}s`
        newTarget.innerText = target
        curTargets.push(newTarget)
        game.append(newTarget)
    }
    for (const target of curLevel.statictargets) {
        let newTarget = document.createElement('p')
        newTarget.className = 'target'
        newTarget.innerText = target
        curTargets.push(newTarget)
        game.append(newTarget)
    }
    curEntries = []
    spanifyAndCheck()
    for (let i = 0; i < curLevel.entries; i += 1) {
        addRegexEntry(regexEntry)
    }
    navNext.onclick = ()=>{}
    navPrev.onclick = ()=>{}
    if (curLevelId === 'end') {
        navNext.classList.add('inactive')
        setTimeout(()=>{openMenu()},3500)
    } else {
        if (gameData.completedSet.has(curLevelId)) {
            navNext.onclick = ()=>{start(curLevel.next)}
            navNext.classList.remove('inactive')
        } else {
            navNext.classList.add('inactive')
        }
    }
    if (curLevel.prev === null) {
        navPrev.classList.add('inactive')
    } else {
        navPrev.onclick = ()=>{start(curLevel.prev)}
        navPrev.classList.remove('inactive')
    }
    updateMenuLevels()
}
function getLevel(id: string): Level {
    let level = levelData.get(id)
    if (level === undefined) {
        throw new ReferenceError(`${id} is not a valid level in levelData`)
    }
    return level
}
function startNextLevel() {
    if (curLevel.next !== null) {
        start(curLevel.next)
    } else {
        openMenu()
        focusLevels([curLevelId])
    }
}
function addRegexEntry(regexEntry: HTMLElement) {
    let newRegexInput = document.createElement('span')
    let newFlagInput = document.createElement('span')
    let newP = document.createElement('p')
    newRegexInput.className = 'regex-input'
    newRegexInput.contentEditable = "true"
    newFlagInput.className = 'flag-input'
    newFlagInput.contentEditable = "true"
    newP.className = 'regex-entry'
    newP.append('/', newRegexInput, '/')
    if (curLevelId === 'intro') {
        newRegexInput.classList.add('highlight')
    }
    if (!curLevel.hideflags) {
        newP.append(newFlagInput)
    }
    newRegexInput.addEventListener('focusout', fixText)
    newFlagInput.addEventListener('focusout', fixText)
    newRegexInput.addEventListener('focusout', handleEntry)
    newFlagInput.addEventListener('focusout', handleEntry)
    curEntries.push([newRegexInput, newFlagInput])
    regexEntry.append(newP)
}
function fixText(this: HTMLElement) {
    this.innerText = this.innerText
}
function notNull<T>(value: T | null): value is T {
    return value !== null;
}
type RegExpMatchArrayWithIndices = RegExpMatchArray & { indices: Array<[number, number]> };
function regexToIndices(regexString: string, regexFlags: string, matchString: string, includeGroups: boolean) {
    regexFlags = regexFlags.toLowerCase()
    if (!regexFlags) {
        regexFlags = ""
    }
    if (!regexFlags.includes('d')) {
        regexFlags += 'd'
    }
    if (!regexFlags.includes('g') && curLevel.hideflags) {
        regexFlags += 'g'
    }
    let indices: (RegExpExecArray | null)[] = []
    let regex = new RegExp(regexString, regexFlags)
    let lastLastIndex: number | null = null
    do {
        lastLastIndex = regex.lastIndex
        indices.push(regex.exec(matchString))
    } while (regex.lastIndex !== 0
        && regex.lastIndex !== matchString.length
        && regex.lastIndex !== lastLastIndex)
    //indices.pop()
    let indicesWithoutNull: RegExpExecArray[] = indices.filter(notNull)
    if (!includeGroups) {
        return indicesWithoutNull.map(i=>[[...(i as RegExpMatchArrayWithIndices).indices[0]]])
    } else {
        return indicesWithoutNull.map(i=>[...(i as RegExpMatchArrayWithIndices).indices])
    }
    
}
let menuOpen = false
let menuDebounce = false
function handleKey(e: KeyboardEvent) {
    if (!menuDebounce) {
        switch (e.code) {
            case 'Enter':
                return (document.activeElement as HTMLElement).blur()
            //case 'KeyJ':
            //    return toggleMenu()
        }
    }
}
navMap.onclick = ()=>{toggleMenu()}
function handleEntry() {
    if (!menuOpen) {
        (document.activeElement as HTMLElement).blur()
        spanifyAndCheck()
    }
}
function toggleMenu() {
    if (!menuDebounce) {
        menuDebounce = true
        if (menuOpen) {
            closeMenu()
        } else {
            openMenu()
        }
        setTimeout(()=>menuDebounce = false, 1000)
    }
}
function openMenu() {
    menuOpen = true
    menu.classList.add('open')
}
function closeMenu() {
    menuOpen = false
    menu.classList.remove('open')
}
let curX = 0
let curY = 0
let zoomLevel = 1
let startPos: Point = {x:-1, y:-1}
let lastPos: Point = {x:-1, y:-1}
let moving = false
let changedPos = (x: number,y: number)=> !(startPos.x===x && startPos.y===y)
function showLevelInfo(key: string) {
    let levelName = getLevel(key).name
    let topics = getLevel(key).addref.map((ref)=>{
        return `<span class="code">${ref[0]}</span> - <span class="code">${ref[1]}</span>`
    })
    menuLevelStart.classList.remove('inactive')
    menuLevelStart.onmouseup = () => {
        start(key)
        closeMenu()
        menuDebounce = true
        setTimeout(()=>menuDebounce = false, 1000)
    }
    menuLevelText.innerHTML = `<h3>${levelName}</h3><h4>Covered topics:</h4>${topics.join('<br/>')}`
}
function focusLevels(levels: string[]) {
    let totX = 0
    let totY = 0
    for (const levelKey of levels) {
        let level = getLevel(levelKey)
        let mapdata = level.mapdata
        totX += mapdata.pos.x
        totY += mapdata.pos.y
    }
    totX /= levels.length
    totY /= levels.length
    curX = -totX
    curY = -totY
    zoomLevel = 1
    updateView()
}
function startDrag(ev: MouseEvent) {
    lastPos.x = ev.x
    lastPos.y = ev.y
    startPos.x = ev.x
    startPos.y = ev.y
    moving = true
}
function endDrag() {
    moving = false
}
function moveDrag(ev: MouseEvent) {
    if (moving) {
        let deltaX = ev.x - lastPos.x
        let deltaY = ev.y - lastPos.y
        curX += deltaX
        curY += deltaY
        updateView()
        lastPos.x = ev.x
        lastPos.y = ev.y
    }
}
function updateView() {
    menuView.style.transform = `translate(50%, 50%) translate(${curX}px, ${curY}px) scale(${zoomLevel})`
}
menuRight.addEventListener('wheel', (ev)=>{
    ev.preventDefault();
    zoomLevel += ev.deltaY * -0.0006;
    updateView()
})
document.addEventListener('mousemove', moveDrag)
menuRight.addEventListener('mousedown', startDrag)
document.addEventListener('mouseup', endDrag)
let levelMap = new Map<string, HTMLElement>()
let lineMap = new Map<string, HTMLElement>()
void function createMenuLevels() {
    menuView.innerHTML = ''
    for (const [key, level] of Array.from(levelData.entries())) {
        if (!level.mapdata.visible) {continue}
        if (level.prev !== null) {
            let line = makeMenuLine(level.mapdata.pos, getLevel(level.prev).mapdata.pos)
            lineMap.set(key, line)
            menuView.append(line)
        }
    }
    for (const [key, level] of Array.from(levelData.entries())) {
        if (!level.mapdata.visible) {continue}
        let levelButton = document.createElement('button')
        levelButton.className = 'level'
        levelButton.style.left = `${level.mapdata.pos.x}px`
        levelButton.style.top = `${level.mapdata.pos.y}px`
        levelButton.style.transform = `translate(-50%, -50%)`
        levelButton.innerText = level.name
        levelMap.set(key, levelButton)
        menuView.append(levelButton)
    }
}()
function updateMenuLevels() {
    for (const [key, button] of Array.from(levelMap.entries())) {
        if (!gameData.completedSet.has(getLevel(key).prev??'')) {
            if (getLevel(key).prev !== null) {
                button.classList.add('inactive')
                button.onclick = ()=>{}
                continue;
            }
        }
        button.classList.remove('inactive')
        button.onclick = (ev: MouseEvent)=>{
            if (!changedPos(ev.x, ev.y)) {
                showLevelInfo(key)
            }
        }
        if (!gameData.completedSet.has(key)) {
            button.classList.add('highlight')
        } else {
            button.classList.remove('highlight')
        }
    }
    updateMenuLines()
}
function updateMenuLines() {
    for (const [key, line] of Array.from(lineMap.entries())) {
        if (!gameData.completedSet.has(getLevel(key).prev??'')) {
            if (getLevel(key).prev !== null) {
                line.classList.add('inactive')
                continue;
            }
        }
        line.classList.remove('inactive')
    }
}
function makeMenuLine(pos1: Point, pos2: Point) {
    let line = document.createElement('div')
    line.className = 'line'
    let mid = getMidpoint(pos1, pos2)
    let angle = getAngle(pos1, pos2)
    let len = getLength(pos1, pos2)
    line.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`
    line.style.width = `${len}px`
    line.style.top = `${mid.y}px`
    line.style.left = `${mid.x}px`
    return line
}
function getMidpoint(p1: Point, p2: Point) {
    return {x: (p1.x+p2.x)/2, y: (p1.y+p2.y)/2}
}
function getAngle(p1: Point, p2: Point) {
    let x = p1.x - p2.x
    let y = p1.y - p2.y
    return Math.atan2(y, x)
}
function getLength(p1: Point, p2: Point) {
    return Math.sqrt(((p1.x-p2.x)**2) + ((p1.y-p2.y)**2))
}
//updateMenuLevels()
menuView.style.transform = 'translate(50%, 50%)'
document.addEventListener('keyup', handleKey)

toggleLight.addEventListener('click', ()=>{
    document.body.classList.toggle('light')
})

export {overlapSpan}