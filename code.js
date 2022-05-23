let rightCol = document.getElementById('right-col')
let leftCol = document.getElementById('left-col')
let bottomPane = document.getElementById('bottom-pane')
let game = document.getElementById('game')
let regexEntry = document.getElementById('regex-entry')
let subEntry = document.getElementById('sub-entry')
let menu = document.getElementById('menu')
let menuRight = document.getElementById('menu-right')
let menuView = document.getElementById('menu-view')
let menuLevelText = document.getElementById('menu-level-text')
let menuLevelStart = document.getElementById('level-start-button')
let navPrev = document.getElementById('prev-nav')
let navMap = document.getElementById('map-nav')
let navNext = document.getElementById('next-nav')

let isTest = /(?:localhost|127\.0\.0\.1)/.test(document.location.hostname)

Set.prototype.toggle = function(token) {
    if (!this.delete(token)) {
        this.add(token)
        return true
    }
    return false
}
function overlapSpan(text, spans) {
    let result = ''
    let classes = new Set()
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
                result += `<span class="${[...classes].join(' ')}">`
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

let gameData =  {
    version: '0',
    completed: [],
    introPlayed: false,
    currentLevel: 0,
}
defaultData = gameData
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
    gameData.completed = [...gameData.completedSet]
    localStorage.setItem('gamedata', JSON.stringify(gameData))
}
if (!gameData.introPlayed) {
    let introText = Array.from("welcome to regex gallery").reverse()
    let currentText = ''
    let introContainer = document.createElement('p')
    introContainer.className = 'intro'
    introContainer.innerText = '//'
    game.append(introContainer)
    let introLoop;
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
                    start()
                }, 500)
            }, 1000)
        }
    }, 100)
} else {
    start()
}
let curLevelId = 'intro'
let curLevel = null
let curEntries = []
let curTargets = []
function resetData(save) {
    gameData = JSON.parse(JSON.stringify(defaultData))
    curLevelId = 'intro'
    curLevel = null
    curEntries = []
    curTargets = []
    if (save) {saveData()}
    start()
}
function spanifyAndCheck() {
    let isAllComplete = true
    for (const target of curTargets) {
        let matchIndices = regexToIndices(curLevel.matchregex, curLevel.matchregexflags, target.innerText, curLevel.includeGroups)
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
function indicesToSpans(indices, className) {
    let result = []
    for (const outer of indices) {
        for (const inner of outer) {
            result.push([className, ...inner])
        }
    }
    return result
}
function start(level) {
    if (level === undefined) {
        while (levelData[curLevelId].next !== null) {
            let next = levelData[curLevelId].next
            if (gameData.completedSet.has(curLevelId)) {
                curLevelId = next
            } else {
                break
            }
        }
    } else {
        curLevelId = level
    }
    curLevel = levelData[curLevelId]
    
    rightCol.querySelector('.leveltext').innerHTML = curLevel.leveltext
    rightCol.classList.remove('closed')
    bottomPane.classList.remove('closed')
    curTargets.forEach(t=>t.remove())
    regexEntry.innerHTML = ''
    subEntry.innerHTML = ''
    curTargets = []
    for (const [index, target] of curLevel.dynamictargets.sort(()=>Math.random()-0.5).entries()) {
        newTarget = document.createElement('p')
        newTarget.className = 'target scroller'
        newTarget.style = `top: ${index}em; animation-delay: -${Math.random() * 30}s;`
        newTarget.innerText = target
        curTargets.push(newTarget)
        game.append(newTarget)
    }
    for (const target of curLevel.statictargets) {
        newTarget = document.createElement('p')
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
function startNextLevel() {
    if (curLevel.next !== null) {
        start(curLevel.next)
    } else {
        openMenu()
        focusLevels([curLevelId])
    }
}
function addRegexEntry(regexEntry) {
    let newRegexInput = document.createElement('span')
    let newFlagInput = document.createElement('span')
    let newP = document.createElement('p')
    newRegexInput.className = 'regex-input'
    newRegexInput.contentEditable = true
    newFlagInput.className = 'flag-input'
    newFlagInput.contentEditable = true
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
function fixText() {
    this.innerText = this.innerText
}
function regexToIndices(regexString, regexFlags, matchString, includeGroups) {
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
    let indices = []
    let regex = new RegExp(regexString, regexFlags)
    let lastLastIndex = null
    do {
        lastLastIndex = regex.lastIndex
        indices.push(regex.exec(matchString))
    } while (regex.lastIndex !== 0
        && regex.lastIndex !== matchString.length
        && regex.lastIndex !== lastLastIndex)
    //indices.pop()
    indices = indices.filter(i=>i!==null)
    if (!includeGroups) {
        return indices.map(i=>[[...i.indices[0]]])
    } else {
        return indices.map(i=>[...i.indices])
    }
    
}
let menuOpen = false
let menuDebounce = false
function handleKey(e) {
    if (!menuDebounce) {
        switch (e.code) {
            case 'Enter':
                return document.activeElement.blur()
            //case 'KeyJ':
            //    return toggleMenu()
        }
    }
}
navMap.onclick = ()=>{toggleMenu()}
function handleEntry(e) {
    if (!menuOpen) {
        document.activeElement.blur()
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
let startPos = {x:-1, y:-1}
let lastPos = {x:-1, y:-1}
let moving = false
let changedPos = (x,y)=> !(startPos.x===x && startPos.y===y)
function showLevelInfo(key) {
    let levelName = levelData[key].name
    let topics = levelData[key].addref.map((ref)=>{
        return `<span class="code">${ref[0]}</span> - <span class="code">${ref[1]}</span>`
    })
    menuLevelStart.classList.remove('inactive')
    menuLevelStart.onmouseup = (ev) => {
        start(key)
        closeMenu()
        menuDebounce = true
        setTimeout(()=>menuDebounce = false, 1000)
    }
    menuLevelText.innerHTML = `<h3>${levelName}</h3><h4>Covered topics:</h4>${topics.join('<br/>')}`
}
function focusLevels(levels) {
    let totX = 0
    let totY = 0
    for (const levelKey of levels) {
        let level = levelData[levelKey]
        let mapdata = level.mapdata
        totX += mapdata.x
        totY += mapdata.y
    }
    totX /= levels.length
    totY /= levels.length
    curX = -totX
    curY = -totY
    zoomLevel = 1
    updateView()
}
function startDrag(ev) {
    lastPos.x = ev.x
    lastPos.y = ev.y
    startPos.x = ev.x
    startPos.y = ev.y
    moving = true
}
function endDrag() {
    moving = false
}
function moveDrag(ev) {
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
let levelMap = new Map()
let lineMap = new Map()
void function createMenuLevels() {
    menuView.innerHTML = ''
    for (const [key, level] of Object.entries(levelData)) {
        if (!level.mapdata.visible) {continue}
        if (level.prev !== null) {
            let line = makeMenuLine(level.mapdata, levelData[level.prev].mapdata)
            lineMap.set(key, line)
            menuView.append(line)
        }
    }
    for (const [key, level] of Object.entries(levelData)) {
        if (!level.mapdata.visible) {continue}
        let levelButton = document.createElement('button')
        levelButton.className = 'level'
        levelButton.style = `top: ${level.mapdata.y}px; left: ${level.mapdata.x}px; transform: translate(-50%, -50%);`
        levelButton.innerText = level.name
        levelMap.set(key, levelButton)
        menuView.append(levelButton)
    }
}()
function updateMenuLevels() {
    for (const [key, button] of levelMap.entries()) {
        if (!gameData.completedSet.has(levelData[key].prev)) {
            if (levelData[key].prev !== null) {
                button.classList.add('inactive')
                button.onclick = ()=>{}
                continue;
            }
        }
        button.classList.remove('inactive')
        button.onclick = (ev)=>{
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
    for (const [key, line] of lineMap.entries()) {
        if (!gameData.completedSet.has(levelData[key].prev)) {
            if (levelData[key].prev !== null) {
                line.classList.add('inactive')
                continue;
            }
        }
        line.classList.remove('inactive')
    }
}
function makeMenuLine(pos1, pos2) {
    let line = document.createElement('div')
    line.className = 'line'
    let mid = getMidpoint(pos1, pos2)
    let angle = getAngle(pos1, pos2)
    let len = getLength(pos1, pos2)
    line.style = `transform: translate(-50%, -50%) rotate(${angle}rad); width: ${len}px; top: ${mid.y}px; left: ${mid.x}px;`
    return line
}
function getMidpoint(p1, p2) {
    return {x: (p1.x+p2.x)/2, y: (p1.y+p2.y)/2}
}
function getAngle(p1, p2) {
    let x = p1.x - p2.x
    let y = p1.y - p2.y
    return Math.atan2(y, x)
}
function getLength(p1, p2) {
    return Math.sqrt(((p1.x-p2.x)**2) + ((p1.y-p2.y)**2))
}
//updateMenuLevels()
menuView.style.transform = 'translate(50%, 50%)'
document.addEventListener('keyup', handleKey)
if (isTest) {
    let tests = document.createElement('script')
    tests.setAttribute('src', 'tests.js')
    document.body.append(tests)
}