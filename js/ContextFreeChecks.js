"use strict";

/**
 * Functions that run context independent style checks and append discovered
 * errors to the word object
 * @param {Object} wordObj
 */
module.exports = {

    /** Checks if the word is an exclamation point */
    exclamations: function(wordObj) {
        if (wordObj.word === "!") {
            wordObj.errs.push("Do not attempt to emphasize simple statements" +
                " by using a mark of exclamation. The exclamation mark is to" +
                " be reserved for use after true exclamations or commands.");
        }
    },

    /** Checks if the dashes in a word are necessary */
    inWordDashes: function(wordObj) {
        if (wordObj.word.indexOf("-") !== -1) {
            var noDashes = wordObj.word.replace("-", "");
            if (this.dictionaryContains(noDashes)) {
                wordObj.errs.push("Do not use a hyphen between words that can" +
                    " be better written as one word.");
            }
        }
    },

    /** Use commas instead of parentheses */
    parentheses: function(wordObj) {
        if (wordObj.pos === "(" || wordObj.pos === ")") {
            wordObj.errs.push("Enclose parenthetic expressions between commas.");
        }
    },

    /** Do not use the first person in formal writing */
    firstPerson: function(wordObj) {
        var firstPersonPronouns = ["I", "me", "Me", "my", "My", "mine", "Mine", "we", "We", "us", "Us", "our", "Our", "ours", "Ours"];
        if (firstPersonPronouns.indexOf(wordObj.word) !== -1) {
            wordObj.errs.push("Do not use the first person in formal writing.");
        }
    },

};
