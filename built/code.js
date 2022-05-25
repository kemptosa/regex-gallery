var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var rightCol = document.getElementById('right-col');
var leftCol = document.getElementById('left-col');
var bottomPane = document.getElementById('bottom-pane');
var game = document.getElementById('game');
var regexEntry = document.getElementById('regex-entry');
var subEntry = document.getElementById('sub-entry');
var menu = document.getElementById('menu');
var menuRight = document.getElementById('menu-right');
var menuView = document.getElementById('menu-view');
var menuLevelText = document.getElementById('menu-level-text');
var menuLevelStart = document.getElementById('level-start-button');
var navPrev = document.getElementById('prev-nav');
var navMap = document.getElementById('map-nav');
var navNext = document.getElementById('next-nav');
var toggleLight = document.getElementById('toggle-light');
var isTest = /(?:localhost|127\.0\.0\.1)/.test(document.location.hostname);
Set.prototype.toggle = function (token) {
    if (!this.delete(token)) {
        this.add(token);
        return true;
    }
    return false;
};
function overlapSpan(text, spans) {
    var result = '';
    var classes = new Set();
    var ignore = true;
    for (var i = 0; i < text.length; i += 1) {
        var changed = false;
        classes.clear();
        for (var _i = 0, spans_1 = spans; _i < spans_1.length; _i++) {
            var span = spans_1[_i];
            var cl = span[0];
            var start_1 = span[1];
            var end = span[2];
            if (start_1 <= i && i < end) {
                classes.add(cl);
            }
            changed || (changed = (start_1 === i) || (end === i));
        }
        if (changed) {
            if (!ignore) {
                result += '</span>';
            }
            else {
                ignore = false;
            }
            if (classes.size !== 0) {
                result += "<span class=\"".concat(Array.from(classes).join(' '), "\">");
            }
            else {
                ignore = true;
            }
        }
        result += text[i];
    }
    if (classes.size > 0) {
        result += '</span>';
    }
    return result;
}
// document.getElementById('right-col-toggle').onclick = function() {
//     rightCol.classList.toggle('closed')
//     bottomPane.classList.toggle('closed')
// }
var gameData = {
    version: '0',
    completed: [],
    introPlayed: false,
    currentLevel: 0
};
defaultData = gameData;
void function loadData() {
    var loadedData = localStorage.getItem('gamedata');
    if (loadedData !== null) {
        gameData = JSON.parse(loadedData);
    }
    else {
        gameData = JSON.parse(JSON.stringify(gameData));
    }
    gameData.completedSet = new Set(gameData.completed);
}();
var saveData = function () {
    gameData.completed = __spreadArray([], gameData.completedSet, true);
    localStorage.setItem('gamedata', JSON.stringify(gameData));
};
if (!gameData.introPlayed) {
    var introText_1 = Array.from("welcome to regex gallery").reverse();
    var currentText_1 = '';
    var introContainer_1 = document.createElement('p');
    introContainer_1.className = 'intro';
    introContainer_1.innerText = '//';
    game.append(introContainer_1);
    var introLoop_1;
    introLoop_1 = setInterval(function () {
        introContainer_1.innerText = "/".concat(currentText_1, "/");
        if (introText_1.length > 0) {
            currentText_1 += introText_1.pop();
        }
        else {
            clearInterval(introLoop_1);
            setTimeout(function () {
                introContainer_1.style.color = "var(--texthidden);";
                setTimeout(function () {
                    introContainer_1.remove();
                    start();
                }, 500);
            }, 1000);
        }
    }, 100);
}
else {
    start();
}
var curLevelId = 'intro';
var curLevel = null;
var curEntries = [];
var curTargets = [];
function resetData(save) {
    gameData = JSON.parse(JSON.stringify(defaultData));
    curLevelId = 'intro';
    curLevel = null;
    curEntries = [];
    curTargets.forEach(function (t) { return t.remove(); });
    curTargets = [];
    gameData.completedSet = new Set();
    showLevelInfo('intro');
    if (save) {
        saveData();
    }
    start();
}
function spanifyAndCheck() {
    var isAllComplete = true;
    for (var _i = 0, curTargets_1 = curTargets; _i < curTargets_1.length; _i++) {
        var target = curTargets_1[_i];
        var matchIndices = regexToIndices(curLevel.matchregex, curLevel.matchregexflags, target.innerText, curLevel.includeGroups);
        var isComplete = curEntries.length > 0;
        var spans = [];
        for (var _a = 0, curEntries_1 = curEntries; _a < curEntries_1.length; _a++) {
            var _b = curEntries_1[_a], regex = _b[0], flags = _b[1];
            var indices = regexToIndices(regex.innerText, flags.innerText, target.innerText, curLevel.checkgroups);
            isComplete = isComplete && (JSON.stringify(indices) === JSON.stringify(matchIndices));
            spans.push.apply(spans, indicesToSpans(indices, 'at'));
        }
        spans.push.apply(spans, indicesToSpans(matchIndices, 'ht'));
        target.innerHTML = overlapSpan(target.innerText, spans);
        if (isComplete) {
            target.classList.add('died');
        }
        else {
            target.classList.remove('died');
        }
        isAllComplete = isAllComplete && isComplete;
    }
    if (isAllComplete) {
        gameData.completedSet.add(curLevelId);
        if (!isTest) {
            saveData();
        }
        game.classList.add('fadeout');
        setTimeout(function () {
            game.classList.remove('fadeout');
            updateMenuLevels();
            startNextLevel();
        }, 1000);
    }
}
function indicesToSpans(indices, className) {
    var result = [];
    for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
        var outer = indices_1[_i];
        for (var _a = 0, outer_1 = outer; _a < outer_1.length; _a++) {
            var inner = outer_1[_a];
            result.push(__spreadArray([className], inner, true));
        }
    }
    return result;
}
function start(level) {
    if (level === undefined) {
        while (levelData[curLevelId].next !== null) {
            var next = levelData[curLevelId].next;
            if (gameData.completedSet.has(curLevelId)) {
                curLevelId = next;
            }
            else {
                break;
            }
        }
    }
    else {
        curLevelId = level;
    }
    curLevel = levelData[curLevelId];
    rightCol.querySelector('.leveltext').innerHTML = curLevel.leveltext;
    rightCol.classList.remove('closed');
    bottomPane.classList.remove('closed');
    curTargets.forEach(function (t) { return t.remove(); });
    regexEntry.innerHTML = '';
    subEntry.innerHTML = '';
    curTargets = [];
    for (var _i = 0, _a = Array.from(curLevel.dynamictargets.sort(function () { return Math.random() - 0.5; }).entries()); _i < _a.length; _i++) {
        var _b = _a[_i], index = _b[0], target = _b[1];
        newTarget = document.createElement('p');
        newTarget.className = 'target scroller';
        newTarget.style = "top: ".concat(index, "em; animation-delay: -").concat(Math.random() * 30, "s;");
        newTarget.innerText = target;
        curTargets.push(newTarget);
        game.append(newTarget);
    }
    for (var _c = 0, _d = curLevel.statictargets; _c < _d.length; _c++) {
        var target = _d[_c];
        newTarget = document.createElement('p');
        newTarget.className = 'target';
        newTarget.innerText = target;
        curTargets.push(newTarget);
        game.append(newTarget);
    }
    curEntries = [];
    spanifyAndCheck();
    for (var i = 0; i < curLevel.entries; i += 1) {
        addRegexEntry(regexEntry);
    }
    navNext.onclick = function () { };
    navPrev.onclick = function () { };
    if (curLevelId === 'end') {
        navNext.classList.add('inactive');
        setTimeout(function () { openMenu(); }, 3500);
    }
    else {
        if (gameData.completedSet.has(curLevelId)) {
            navNext.onclick = function () { start(curLevel.next); };
            navNext.classList.remove('inactive');
        }
        else {
            navNext.classList.add('inactive');
        }
    }
    if (curLevel.prev === null) {
        navPrev.classList.add('inactive');
    }
    else {
        navPrev.onclick = function () { start(curLevel.prev); };
        navPrev.classList.remove('inactive');
    }
    updateMenuLevels();
}
function startNextLevel() {
    if (curLevel.next !== null) {
        start(curLevel.next);
    }
    else {
        openMenu();
        focusLevels([curLevelId]);
    }
}
function addRegexEntry(regexEntry) {
    var newRegexInput = document.createElement('span');
    var newFlagInput = document.createElement('span');
    var newP = document.createElement('p');
    newRegexInput.className = 'regex-input';
    newRegexInput.contentEditable = true;
    newFlagInput.className = 'flag-input';
    newFlagInput.contentEditable = true;
    newP.className = 'regex-entry';
    newP.append('/', newRegexInput, '/');
    if (curLevelId === 'intro') {
        newRegexInput.classList.add('highlight');
    }
    if (!curLevel.hideflags) {
        newP.append(newFlagInput);
    }
    newRegexInput.addEventListener('focusout', fixText);
    newFlagInput.addEventListener('focusout', fixText);
    newRegexInput.addEventListener('focusout', handleEntry);
    newFlagInput.addEventListener('focusout', handleEntry);
    curEntries.push([newRegexInput, newFlagInput]);
    regexEntry.append(newP);
}
function fixText() {
    this.innerText = this.innerText;
}
function regexToIndices(regexString, regexFlags, matchString, includeGroups) {
    regexFlags = regexFlags.toLowerCase();
    if (!regexFlags) {
        regexFlags = "";
    }
    if (!regexFlags.includes('d')) {
        regexFlags += 'd';
    }
    if (!regexFlags.includes('g') && curLevel.hideflags) {
        regexFlags += 'g';
    }
    var indices = [];
    var regex = new RegExp(regexString, regexFlags);
    var lastLastIndex = null;
    do {
        lastLastIndex = regex.lastIndex;
        indices.push(regex.exec(matchString));
    } while (regex.lastIndex !== 0
        && regex.lastIndex !== matchString.length
        && regex.lastIndex !== lastLastIndex);
    //indices.pop()
    indices = indices.filter(function (i) { return i !== null; });
    if (!includeGroups) {
        return indices.map(function (i) { return [__spreadArray([], i.indices[0], true)]; });
    }
    else {
        return indices.map(function (i) { return __spreadArray([], i.indices, true); });
    }
}
var menuOpen = false;
var menuDebounce = false;
function handleKey(e) {
    if (!menuDebounce) {
        switch (e.code) {
            case 'Enter':
                return document.activeElement.blur();
            //case 'KeyJ':
            //    return toggleMenu()
        }
    }
}
navMap.onclick = function () { toggleMenu(); };
function handleEntry(e) {
    if (!menuOpen) {
        document.activeElement.blur();
        spanifyAndCheck();
    }
}
function toggleMenu() {
    if (!menuDebounce) {
        menuDebounce = true;
        if (menuOpen) {
            closeMenu();
        }
        else {
            openMenu();
        }
        setTimeout(function () { return menuDebounce = false; }, 1000);
    }
}
function openMenu() {
    menuOpen = true;
    menu.classList.add('open');
}
function closeMenu() {
    menuOpen = false;
    menu.classList.remove('open');
}
var curX = 0;
var curY = 0;
var zoomLevel = 1;
var startPos = { x: -1, y: -1 };
var lastPos = { x: -1, y: -1 };
var moving = false;
var changedPos = function (x, y) { return !(startPos.x === x && startPos.y === y); };
function showLevelInfo(key) {
    var levelName = levelData[key].name;
    var topics = levelData[key].addref.map(function (ref) {
        return "<span class=\"code\">".concat(ref[0], "</span> - <span class=\"code\">").concat(ref[1], "</span>");
    });
    menuLevelStart.classList.remove('inactive');
    menuLevelStart.onmouseup = function (ev) {
        start(key);
        closeMenu();
        menuDebounce = true;
        setTimeout(function () { return menuDebounce = false; }, 1000);
    };
    menuLevelText.innerHTML = "<h3>".concat(levelName, "</h3><h4>Covered topics:</h4>").concat(topics.join('<br/>'));
}
function focusLevels(levels) {
    var totX = 0;
    var totY = 0;
    for (var _i = 0, levels_1 = levels; _i < levels_1.length; _i++) {
        var levelKey = levels_1[_i];
        var level = levelData[levelKey];
        var mapdata = level.mapdata;
        totX += mapdata.x;
        totY += mapdata.y;
    }
    totX /= levels.length;
    totY /= levels.length;
    curX = -totX;
    curY = -totY;
    zoomLevel = 1;
    updateView();
}
function startDrag(ev) {
    lastPos.x = ev.x;
    lastPos.y = ev.y;
    startPos.x = ev.x;
    startPos.y = ev.y;
    moving = true;
}
function endDrag() {
    moving = false;
}
function moveDrag(ev) {
    if (moving) {
        var deltaX = ev.x - lastPos.x;
        var deltaY = ev.y - lastPos.y;
        curX += deltaX;
        curY += deltaY;
        updateView();
        lastPos.x = ev.x;
        lastPos.y = ev.y;
    }
}
function updateView() {
    menuView.style.transform = "translate(50%, 50%) translate(".concat(curX, "px, ").concat(curY, "px) scale(").concat(zoomLevel, ")");
}
menuRight.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    zoomLevel += ev.deltaY * -0.0006;
    updateView();
});
document.addEventListener('mousemove', moveDrag);
menuRight.addEventListener('mousedown', startDrag);
document.addEventListener('mouseup', endDrag);
var levelMap = new Map();
var lineMap = new Map();
void function createMenuLevels() {
    menuView.innerHTML = '';
    for (var _i = 0, _a = Object.entries(levelData); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], level = _b[1];
        if (!level.mapdata.visible) {
            continue;
        }
        if (level.prev !== null) {
            var line = makeMenuLine(level.mapdata, levelData[level.prev].mapdata);
            lineMap.set(key, line);
            menuView.append(line);
        }
    }
    for (var _c = 0, _d = Object.entries(levelData); _c < _d.length; _c++) {
        var _e = _d[_c], key = _e[0], level = _e[1];
        if (!level.mapdata.visible) {
            continue;
        }
        var levelButton = document.createElement('button');
        levelButton.className = 'level';
        levelButton.style = "top: ".concat(level.mapdata.y, "px; left: ").concat(level.mapdata.x, "px; transform: translate(-50%, -50%);");
        levelButton.innerText = level.name;
        levelMap.set(key, levelButton);
        menuView.append(levelButton);
    }
}();
function updateMenuLevels() {
    var _loop_1 = function (key, button) {
        if (!gameData.completedSet.has(levelData[key].prev)) {
            if (levelData[key].prev !== null) {
                button.classList.add('inactive');
                button.onclick = function () { };
                return "continue";
            }
        }
        button.classList.remove('inactive');
        button.onclick = function (ev) {
            if (!changedPos(ev.x, ev.y)) {
                showLevelInfo(key);
            }
        };
        if (!gameData.completedSet.has(key)) {
            button.classList.add('highlight');
        }
        else {
            button.classList.remove('highlight');
        }
    };
    for (var _i = 0, _a = Array.from(levelMap.entries()); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], button = _b[1];
        _loop_1(key, button);
    }
    updateMenuLines();
}
function updateMenuLines() {
    for (var _i = 0, _a = Array.from(lineMap.entries()); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], line = _b[1];
        if (!gameData.completedSet.has(levelData[key].prev)) {
            if (levelData[key].prev !== null) {
                line.classList.add('inactive');
                continue;
            }
        }
        line.classList.remove('inactive');
    }
}
function makeMenuLine(pos1, pos2) {
    var line = document.createElement('div');
    line.className = 'line';
    var mid = getMidpoint(pos1, pos2);
    var angle = getAngle(pos1, pos2);
    var len = getLength(pos1, pos2);
    line.style = "transform: translate(-50%, -50%) rotate(".concat(angle, "rad); width: ").concat(len, "px; top: ").concat(mid.y, "px; left: ").concat(mid.x, "px;");
    return line;
}
function getMidpoint(p1, p2) {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}
function getAngle(p1, p2) {
    var x = p1.x - p2.x;
    var y = p1.y - p2.y;
    return Math.atan2(y, x);
}
function getLength(p1, p2) {
    return Math.sqrt((Math.pow((p1.x - p2.x), 2)) + (Math.pow((p1.y - p2.y), 2)));
}
//updateMenuLevels()
menuView.style.transform = 'translate(50%, 50%)';
document.addEventListener('keyup', handleKey);
if (isTest) {
    var tests = document.createElement('script');
    tests.setAttribute('src', 'tests.js');
    document.body.append(tests);
}
toggleLight.addEventListener('click', function () {
    document.body.classList.toggle('light');
});
