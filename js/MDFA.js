"use strict";

var START = "S";
var REJECT = "R";

var WORD_LEN_ERR = "Invalid word: Must be at least 1 character long.";

/**
 * @constructor
 * Builds a modified DFA that matches (ignoring case) single-word strings and
 * returns its associated list of output strings. Assumes any missing
 * transitions lead to a generic reject state.
 */
var MDFA = function() {
    this.states = {}; // name -> state
    this.addState(START, []);
    this.addState(REJECT, []);
};

/**
 * @param {String} word
 * @return {Array<String>} output strings for word
 */
MDFA.prototype.run = function(word) {
    var q = this.states[START];
    for (var i = 0; i < word.length; i++) {
        q = q.trans[word[i]];
        if (!q) return [];
    }
    return q.matches(word) ? q.out : [];
};

/**
 * Adds the given word and its associated list of output strings to the MDFA
 * @param {String} word: must be at least length 1
 * @param {Array<String>} out
 */
MDFA.prototype.addWord = function(word, out) {
    if (word.length < 1) {
        console.error(WORD_LEN_ERR);
        return;
    }
    var q = this.states[START];
    for (var i = 1; i < word.length; i++) {
        var s = q.trans[word[i - 1]];
        if (!s) s = this.addState(word.substring(0,i), []);
        q.addTransition(word[i - 1], s);
        q = s;
    }
    var s = q.trans[word[i - 1]];
    if (!s) {
        s = this.addState(word, out);
    } else {
        s.addOut(out);
    }
    q.addTransition(word[word.length - 1], s);
};

/**
 * Adds the state with name and output strings to the MDFA
 * @param {String} name
 * @param {Array<String>} out
 */
MDFA.prototype.addState = function(name, out) {
    this.states[name] = new State(name, out);
    return this.states[name];
};

/**
 * @constructor
 * Creates a state with 
 * @param {String} n
 * @param {Array<String>} o
 */
var State = function(n, o) {
    this.name = n;
    this.out = o;
    this.trans = {};
};

/** @param {Array<String>} o */
State.prototype.addOut = function(o) {
    this.out = this.out.concat(o);
}

/**
 * @param {char} c: input character
 * @param {State} q: 'to' state
 */
State.prototype.addTransition = function(c, q) {
    this.trans[c.toLowerCase()] = q;
    this.trans[c.toUpperCase()] = q;
}

/**
 * @param {String} word
 * @return {boolean} whether the word matches this state's name
 */
State.prototype.matches = function(w) {
    return w.toLowerCase() === this.name.toLowerCase();
}

module.exports = MDFA;
