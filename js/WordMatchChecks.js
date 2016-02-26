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

var mdfaWords = {
    "abc" : ["err1"],
    "abcd" : ["err15"],
    "cat" : ["err14"],
    "test" : ["err13"],
    "moo" : ["err12"],
    "mooo" : ["err11"]
};

/** Fills in the MDFA */
Checks.prototype.completeMdfa = function() {
    for (var word in mdfaWords) {
        this.mdfa.addWord(word, mdfaWords[word]);
    }
};

module.exports = Checks;
