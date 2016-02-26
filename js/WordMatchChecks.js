"use strict";

var MDFA = require("./MDFA.js");

/**
 * @constructor
 * Implementation of MDFA
 */
var Checks = function() {
    this.mdfa = new MDFA();
    this.completeMdfa();
};

/**
 * @param {String} word
 * @return {Array<String>} list of errors matching word
 */
Checks.prototype.run = function(word) {
    return this.mdfa.run(word);
};

var PARENS_ERR = "Enclose parenthetic expressions between commas.";
var FIRST_PERS_ERR = "Do not use the first person in formal writing.";

var mdfaWords = {
    "!" : ["Do not attempt to emphasize simple statements by using a mark of exclamation. The exclamation mark is to be reserved for use after true exclamations or commands."],
    "(" : [PARENS_ERR],
    ")" : [PARENS_ERR],
    "I" : [FIRST_PERS_ERR],
    "me" : [FIRST_PERS_ERR],
    "my" : [FIRST_PERS_ERR],
    "mine" : [FIRST_PERS_ERR],
    "we" : [FIRST_PERS_ERR],
    "us" : [FIRST_PERS_ERR],
    "our" : [FIRST_PERS_ERR],
    "ours" : [FIRST_PERS_ERR]
};

/** Fills in the MDFA */
Checks.prototype.completeMdfa = function() {
    for (var word in mdfaWords) {
        this.mdfa.addWord(word, mdfaWords[word]);
    }
};

module.exports = Checks;
