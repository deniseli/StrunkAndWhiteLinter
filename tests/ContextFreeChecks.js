"use strict";

var Validator = require("../js/Validator.js");

var assert = require("chai").assert;

/** Call the named function with the given word object */
var callTestFunc = function(wordObj, funcName) {
    var testCorpus = genFakeCorpusWithWordObj(wordObj);
    var dict = {
        "word": true,
    };
    var validator = new Validator(testCorpus, dict);
    var checkFunc = validator.contextFreeChecks[funcName].bind(validator);
    checkFunc(wordObj);
};

/** Generate a fake corpus containing the word object */
var genFakeCorpusWithWordObj = function (wordObj) {
    var corpus = {};
    corpus.corpus = [[wordObj]];
    return corpus;
};

describe("Context Independent Checks", function() {
    describe("In-Word Dashes", function() {
        it("should add error when real words has dashes.", function() {
            var wordObj = { word: "wo-rd", errs: [] };
            callTestFunc(wordObj, "inWordDashes");
            assert.equal(wordObj.errs[0], "Do not use a hyphen between" +
                " words that can be better written as one word.");
        });
        it("should not add error when nonreal words has dashes.", function() {
            var wordObj = { word: "as-df", errs: [] };
            callTestFunc(wordObj, "inWordDashes");
            assert.equal(wordObj.errs.length, 0);
        });
        it("should not add error when word has no dashes.", function() {
            var wordObj = { word: "word", errs: [] };
            callTestFunc(wordObj, "inWordDashes");
            assert.equal(wordObj.errs.length, 0);
        });
    });
});
