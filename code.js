let rightCol = document.getElementById('right-col')
let leftCol = document.getElementById('left-col')
let bottomPane = document.getElementById('bottom-pane')
let game = document.getElementById('game')
let regexEntry = document.getElementById('regex-entry')
let subEntry = document.getElementById('sub-entry')

Set.prototype.toggle = function(token) {
    if (!this.delete(token)) {
        this.add(token)
        return true
    }
    return false
}
let overlapSpan = function(text, spans) {
    let result = ''
    let classes = new Set()
    let ignore = true
    for (let i = 0; i < text.length; i += 1) {
        let changed = false
        for (const span of spans) {
            let cl = span[0]
            let start = span[1]
            let end = span[2]
            if (start <= i && i < end) {
                if (!classes.has(cl)) {
                    classes.add(cl)
                    changed = true
                }
            } else {
                changed ||= classes.delete(cl)
            }
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
//     //bottomPane.classList.toggle('closed')
// }

let gameData =  {
    version: '0',
    completed: [],
    introPlayed: false,
    currentLevel: 0,
}
void function loadData() {
    let loadedData = localStorage.getItem('gamedata')
    if (loadedData !== null) {
        gameData = JSON.parse(loadedData)
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
                introContainer.style = "color: var(--texthidden);"
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
let levelData = {
    intro:{name:'Intro',
    statictargets:['regex'],
    dynamictargets:[],
    matchregex:'regex',
    matchregexflags:'g',
    checkgroups: false,
    entries: 1,
    hideflags: true,
    leveltext:'Welcome to Regex Gallery! Regex is an extremely powerful tool for searching and replacing within text. To start off, try matching the word "regex" as seen on the left. To start, enter a regular expression into the space in the bottom left between the <span class="code">//</span>.<br/><br/>The simplest way to match something with regex is to simply type it out. Most characters in regex have no explicit meaning on their own and can be used with no special considerations.',
    addref:[],
    next:'cats_and_bars',
    prev:null
    },
    cats_and_bars:{name:'Cats and Bars',
    statictargets:['cat', 'bar'],
    dynamictargets:['bat', 'rat',
                    'bar', 'par', 'jar',
                    'bot', 'lot', 'jot', 'rot', 'cot'],
    matchregex:'.a.',
    matchregexflags:'g',
    checkgroups: false,
    entries: 1,
    hideflags: true,
    leveltext:'Here you will need the first special token, <span class="code">.</span><br/><br/>The <span class="code">.</span> token is a "wildcard"; it will match any character or symbol in a given position.<br/><br/>To complete this level, you should match any 3 letter word with an "a" in the center.',
    addref:[['.', 'wildcard']],
    next:'end',
    prev:'intro'
    },
    end:{name:'The End',
    statictargets:['THE END', '(for now)'],
    dynamictargets:[],
    matchregex:'the end',
    matchregexflags:'g',
    checkgroups: false,
    entries: 0,
    hideflags: true,
    leveltext:'THE END<br/>(for now)',
    addref:[],
    next:null,
    prev:null
    }
}
let curLevelId = 'intro'
let curLevel = null
let curEntries = []
let curTargets = []
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
    game.innerHTML = ''
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
function handleEntry(e) {
    if (e.keyCode === 13) {
        e.preventDefault()
        document.activeElement.blur()
        spanifyAndCheck()
    }
}
document.addEventListener('keyup', handleEntry)