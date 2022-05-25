import { overlapSpan } from "./code.js";
{
    let isTest = /(?:localhost|127\.0\.0\.1)/.test(document.location.hostname);
    if (isTest) {
        function doTest(f, expected) {
            let result = f();
            if (result === expected) {
                console.log(`test returned ${expected}, as expected`);
            }
            else {
                console.error(`test did not return\n${expected}\ninstead got\n${result}`);
            }
        }
        console.group('overlapSpan() tests');
        doTest(() => {
            return overlapSpan('regex', [['at', 0, 2], ['at', 2, 4], ['ht', 0, 5]]);
        }, '<span class="at ht">re</span><span class="at ht">ge</span><span class="ht">x</span>');
        console.groupEnd();
    }
}
