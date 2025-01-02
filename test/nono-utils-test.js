import * as nono from '../js/util/nono-utils.js';

testSolve1();
testSolve2();

function testSolve1() {
    let horHints = [
        [2,2],
        [4,4],
        [1,2,2],
        [5,2,1],
        [1,2,4],
        [4,1,1],
        [1,1,3],
        [5,1],
    ];

    let verHints = [
        [6],
        [2,1,1,1],
        [2,5],
        [5,1],
        [3,1],
        [1],
        [1,5],
        [2,2,1],
        [3,3],
        [3]
    ];

    nono.solveNonogram(horHints, verHints);
}

function testSolve2() {
    let horHints = [
        [1],
        [1,2],
        [1],
        [5]
    ];

    let verHints = [
        [1,1],
        [1,1],
        [1],
        [1,1],
        [3]
    ];

    nono.solveNonogram(horHints, verHints);
}