import {Level, LevelName} from './types.js'
const levelData = new Map<LevelName, Level>([
    ['intro',{name:'Intro',
    statictargets:['regex'],
    dynamictargets:[],
    matchregex:'regex',
	restrictiontext:'No restrictions',
	regexrestriction:['.*', ''],
    matchregexflags:'g',
    checkgroups: false,
    entries: 1,
    hideflags: true,
    leveltext:'Welcome to Regex Gallery! Regex is an extremely powerful tool for searching and replacing within text. To start off, try matching the word "regex" as seen on the left. To start, enter a regular expression into the space in the bottom left between the <span class="code">//</span>.<br/><br/>The simplest way to match something with regex is to simply type it out. Most characters in regex have no explicit meaning on their own and can be used with no special considerations.',
    addref:[],
    next:['cats_and_bars'],
    prev:[],
    mapdata: {
        pos: {
            x: 0,
            y: 0
        },
        visible:true,
        attributes:[]
    }}],
    ['cats_and_bars',{name:'Cats and Bars',
    statictargets:['cat', 'bar'],
    dynamictargets:['bat', 'rat',
                    'bar', 'par', 'jar',
                    'bot', 'lot', 'jot', 'rot', 'cot'],
    matchregex:'.a.',
	restrictiontext:'No restrictions',
	regexrestriction:['.*', ''],
    matchregexflags:'g',
    checkgroups: false,
    entries: 1,
    hideflags: true,
    leveltext:'Here you will need the first special token, <span class="code">.</span><br/><br/>The <span class="code">.</span> token is a "wildcard"; it will match any character or symbol in a given position.<br/><br/>To complete this level, you should match any 3 letter word with an "a" in the center.',
    addref:[['.', 'wildcard']],
    next:['more_specific_non', 'an_unknown_quantity_i'],
    prev:['intro'],
    mapdata: {
        pos: {
            x: 90,
            y: 0
        },
        visible:true,
        attributes:[]
    }}],
    ['more_specific_non',{name:'More Specific Non-specificity',
    statictargets:['dab', 'cat', 'cob'],
    dynamictargets:['cab', 'dob', 'cot', 'jot', 'cam', 'dot', 'datum', 'jacob','fab','tob','bob'],
    matchregex:'[dc][oa][tb]',
	restrictiontext:'No restrictions',
	regexrestriction:['.*', ''],
    matchregexflags:'g',
    checkgroups: false,
    entries: 1,
    hideflags: true,
    leveltext:'Perhaps <span class="code">.</span> is too vague for you. Maybe you only want to match a certain set of characters in a certain position, rather than any character in that position.<br/><br/>Good news! With regex, there\'s always a way! <span class="code">[ ... ]</span> provides a way to match a set of characters, also known as a character class.<br/><br/>For example, the regex <span class="code">m[aeiou]t</span> would match any 3 characters that starts with m, ends with t, and has a vowel in the middle. (met, or mat, or mot, etc...)<br/><br/>For this level, you must match a set of 3 characters, each of which can be one of two options. Try working out the two possible characters you need in each position from the targets provided on the left.',
    addref:[['[...]', 'set of characters']],
    next:['word_esque'],
    prev:['cats_and_bars'],
    mapdata: {
        pos: {
            x: 180,
            y: -40
        },
        visible:true,
        attributes:[]
    }}],
    ['word_esque',{name:'Word-esque',
    statictargets:['%##@', 'Rita', 'pack', 'rend'],
    dynamictargets:['%a%a', '&how', 'helm', 'salt', 'then', 'bool'],
    matchregex:'\\w{4}',
	restrictiontext:'No restrictions',
	regexrestriction:['.*', ''],
    matchregexflags:'g',
    checkgroups: false,
    entries: 1,
    hideflags: true,
    leveltext:'Character classes are extremely useful, but can get lengthy in certain cases. Regex provides some shortcuts for commonly needed character classes.<br/><br/><span class="code">\\w</span> is one such shortcut. It corresponds to a character class which matches any letter (uppercase or lower), any number, and underscores. It\'s formal name is the \'word character\', which may be somewhat offputting due to it\'s aforementioned inclusion of numbers and underscores.<br/><br/>Side note: for most of these \'shortcuts\', if you capitalize the letter, i.e. <span class="code">\\W</span>, it has the effect of inverting the selection. (in this case it would be any character that <em>isn\'t</em> a letter, number or underscore)',
    addref:[['\\w', 'equivalent to [a-zA-Z0-9_]'],
            ['\\W', 'equivalent to [^a-zA-Z0-9_]']],
    next:['beyond_the_boundary', 'digit_adjacent'],
    prev:['more_specific_non'],
    mapdata: {
        pos: {
            x: 270,
            y: -80
        },
        visible:true,
        attributes:[]
    }}],
    ['an_unknown_quantity_i',{name:'An Unknown Quantity, Part I',
    statictargets:['ct scan', 'cat scan', 'emi scan'],
    dynamictargets:['caaaat', 'caaaaaaaaaaaaaaaaaaaat'],
    matchregex:'ca*t',
	restrictiontext:'No restrictions',
	regexrestriction:['.*', ''],
    matchregexflags:'g',
    checkgroups:false,
    entries:1,
    hideflags:true,
    leveltext:'Up to this point, we have only dealt with matching text of a specific length, but what if you dont know the exact length? For example, you might be trying to parse some robotically scanned text of a book where there are occasionally double spaces in the text. The following levels will deal with modifiers that can make a regular expression match text of variable length.<br/><br/>First up: <span class="code">*</span>. This modifier applies to the token directly preceding it and means \'zero or more\'. A token in this case does not necessarily mean a single character in your regular expression; <span class="code">\\w</span>, <span class="code">[abc]</span>, and <span class="code">(?:abc)</span> are all examples of singlular tokens. (That last one is called a \'non-capturing group\' and will be covered later.)',
    addref:[['*', '0 or more']],
    next:['an_unknown_quantity_ii'],
    prev:['cats_and_bars'],
    mapdata: {
        pos: {
            x: 180,
            y: 40
        },
        visible:true,
        attributes:[]
    }}],
    ['an_unknown_quantity_ii',{name:'An Unknown Quantity, Part II',
    statictargets:['<Tarzan>', '<Tarzan', 'Tarzan>', 'Tarzan'],
    dynamictargets:['<Jane>', '><>', '><>', '><>', '><>'],
    matchregex:'<?Tarzan>?',
	restrictiontext:'No restrictions',
	regexrestriction:['.*', ''],
    matchregexflags:'g',
    checkgroups:false,
    entries:1,
    hideflags:true,
    leveltext:'<span class="code">?</span> is a quantifier token like <span class="code">*</span>, but instead of matching zero or more of a token, it will match zero or exactly one. It is often referred to the \'optional\' quantifier.<br/><br/>For this level, you must match Tarzan and any angle brackets that surround him if they exist.',
    addref:[['?', '0 or 1 (aka optional)']],
    next:['end'],
    prev:['an_unknown_quantity_i'],
    mapdata: {
        pos: {
            x: 270,
            y: 40
        },
        visible:true,
        attributes:[]
    }}],
    ['beyond_the_boundary',{name:'Beyond the Boundary',
    statictargets:['catfish', 'bobcat', 'catatonic'],
    dynamictargets:['certificate', 'catalonia', 'located', 'cathode'],
    matchregex:'\\bcat',
	restrictiontext:'No restrictions',
	regexrestriction:['.*', ''],
    matchregexflags:'g',
    checkgroups: false,
    entries: 1,
    hideflags: true,
    leveltext:'Next up: <span class="code">\\b</span>. This token is known as a \'word boundary assertion\'. It does not match a character, but rather a space between a word character and a non-word character. This is most often used to match whole words, avoiding a match when a word is contained within another word. For example, to match the word \'plot\', but not \'subplot\'.<br/><br/><span class="code">\\B</span> is a similar token in that it matches a space between two characters; it is however the inverse of <span class="code">\\b</span> and will match the space between two characters that are either both word characters or both non-word characters.',
    addref:[['\\b', 'word boundary (zero length)'],
            ['\\B', 'non-word boundary (zero length)']],
    next:['end'],
    prev:['word_esque'],
    mapdata: {
        pos: {
            x: 360,
            y: -40
        },
        visible:true,
        attributes:[]
    }}],
    ['digit_adjacent',{name:'Digit Adjacent',
    statictargets:['(555) 867-5309', '', '(123) 456-7890'],
    dynamictargets:[],
    matchregex:'\\d{3}-\\d{4}',
	restrictiontext:'No restrictions',
	regexrestriction:['.*', ''],
    matchregexflags:'g',
    checkgroups:false,
    entries:1,
    hideflags:true,
    leveltext:'Character Class <span class="code">\\d</span>. This token is another of the convenience classes for matching a set of characters, and will match any number. (Essentially equivalent to <span class="code">[0-9]</span>.)<br/><br/>As usual, this token can be inverted (<span class="code">\\D</span>) to match any character that is <em>not</em> a number.',
    addref:[['\\d', 'digit character'],
            ['\\D', 'non-digit character']],
    next:['regarding_flags_i'],
    prev:['word_esque'],
    mapdata: {
        pos: {
            x: 360,
            y: -120
        },
        visible:true,
        attributes:[]
    }}],
    ['regarding_flags_i',{name:'Regarding Flags: I',
    statictargets:['IDENTIFICATION DIVISION', 'identification division'],
    dynamictargets:['IDENTIFICATION division', 'identification DIVISION', 'iDeNtIfIcAtIoN DiViSiOn'],
    matchregex:'identification division',
	restrictiontext:'Must not use character classes or groups',
	regexrestriction:['^(?!.*\\[|.*\\().*$', ''],
    matchregexflags:'i',
    checkgroups:false,
    entries:1,
    hideflags:false,
    leveltext:'Regular Expressions can also have \'flags\' attached to them. Flags are essentially toggle switches for various settings or behaviors an expression can have.<br/><br/>A new text entry field has been unlocked for you, to the right of the regex entry. This is where you can specify flags for your regex. A simple, but quite useful flag is the <span class="code"><span class="flag">i</span></span> flag. When this flag is set, the regular expression will ignore the casing of any letter. Non-letter characters are unaffected.',
    addref:[['<span class="flag">i</span>', 'case insensitive flag']],
    next:['end'],
    prev:['digit_adjacent'],
    mapdata: {
        pos: {
            x: 360,
            y: -200
        },
        visible:true,
        attributes:['blue']
    }}],
    ['regarding_flags_ii',{name:'Regarding Flags: II',
    statictargets:['a b c d e f g'],
    dynamictargets:[],
    matchregex:'.',
	restrictiontext:'No restrictions',
	regexrestriction:['.*', ''],
    matchregexflags:'g',
    checkgroups:false,
    entries:1,
    hideflags:false,
    leveltext:'',
    addref:[['<span class="flag">g</span>', 'global flag']],
    next:['end'],
    prev:['regarding_flags_i'],
    mapdata: {
        pos: {
            x: 360,
            y: -280
        },
        visible:false,
        attributes:['blue']
    }}],
    ['a_known_quantity',{name:'A Known Quantity',
    statictargets:['two', 'three', 'four', 'eleven'],
    dynamictargets:['books', 'cars', 'planes', 'fun words', 'slowly', ''],
    matchregex:'.{5}',
	restrictiontext:'Must be under 5 characters long',
	regexrestriction:['^.{0,4}$', ''],
    matchregexflags:'g',
    checkgroups: false,
    entries: 1,
    hideflags: true,
    leveltext:'Matching an unknown number of characters is nice and all, but you know exactly how many you need? Sure, you could type them all out like <span class="code">eeeeeee</span>, but that\'s a bit repetitive and can become difficult to read.<br/><br/>Introducing the all-purpose specific quantifier, <span class="code">{x}</span>! Simply replace the \'x\' with the number of times you wish to match the preceding token, and voila! <span class="code">eeeeeee</span> can be reduced simply to <span class="code">e{7}</span>!<br/><br/>For this level, simply match 5 of any character using the method above... <span class="require">But you must use less than 5 characters in your regex.</span>',
    addref:[['{x}','exactly x of preceding token']],
    next:['end'],
    prev:['an_unknown_quantity_i'],
    mapdata: {
        pos: {
            x: 270,
            y: 120
        },
        visible:true,
        attributes:[]
    }}],
    ['end',{name:'The End',
    statictargets:['THE END', '(of this path)'],
    dynamictargets:[],
    matchregex:'the end',
	restrictiontext:'No restrictions',
	regexrestriction:['.*', ''],
    matchregexflags:'g',
    checkgroups: false,
    entries: 0,
    hideflags: true,
    leveltext:'THE END<br/>(of this path)',
    addref:[],
    next:[],
    prev:[],
    mapdata: {
        pos: {
            x: -999,
            y: -999
        },
        visible:false,
        attributes:[]
    }}]
])

export {levelData}