let rightCol = document.getElementById('right-col')
let leftCol = document.getElementById('left-col')
let bottomPane = document.getElementById('bottom-pane')
let game = document.getElementById('game')
let regexEntry = document.getElementById('regex-entry')
let subEntry = document.getElementById('sub-entry')
let menu = document.getElementById('menu')
let menuView = document.getElementById('menu-view')

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
}()
let saveData = function() {
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
        gameData.completed.push(curLevelId)
        if (!isTest) {
            saveData()
        }
        game.classList.add('fadeout')
        setTimeout(()=>{
            game.classList.remove('fadeout')
            start(curLevel.next)
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
            if (gameData.completed.includes(curLevelId)) {
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
                return handleEntry(e)
            case 'KeyJ':
                return toggleMenu()
        }
    }
}
function handleEntry(e) {
    if (!menuOpen) {
        e.preventDefault()
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
let numLevels = 0
for (const [key, level] of Object.entries(levelData)) {
    let levelButton = document.createElement('button')
    levelButton.className = 'level'
    levelButton.style = `top: ${Math.floor(numLevels / 4)*75}px; left: ${numLevels % 4 * 90}px;`
    levelButton.innerText = level.name
    levelButton.addEventListener('click', ()=>{start(key); closeMenu()})
    menuView.append(levelButton)
    numLevels++
}
menuView.style.transform = 'translate(10px, 10px)'
document.addEventListener('keyup', handleKey)
if (isTest) {
    let tests = document.createElement('script')
    tests.setAttribute('src', 'tests.js')
    document.body.append(tests)
}