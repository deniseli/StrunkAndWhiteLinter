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

    describe("Exclamations", function() {
        it("should add error when word is exclamation point.", function() {
            var wordObj = {
                word: "!",
                errs: []
            };
            callTestFunc(wordObj, "exclamations");
            assert.equal(wordObj.errs[0], "Do not attempt to emphasize" +
                " simple statements by using a mark of exclamation. The" +
                " exclamation mark is to be reserved for use after true" +
                " exclamations or commands.");
        });
        it("should not add error when word is not exclamation point.", function() {
            var wordObj = {
                word: "x",
                errs: []
            };
            callTestFunc(wordObj, "exclamations");
            assert.equal(wordObj.errs.length, 0);
        });
    });

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

    describe("Parentheses", function() {
        var err = "Enclose parenthetic expressions between commas.";

        it("should add error to (.", function() {
            var wordObj = { pos: "(", errs: [] };
            callTestFunc(wordObj, "parentheses");
            assert.equal(wordObj.errs[0], err);
        });
        it("should add error to ).", function() {
            var wordObj = { pos: ")", errs: [] };
            callTestFunc(wordObj, "parentheses");
            assert.equal(wordObj.errs[0], err);
        });
        it("should not add error to non-parenthetic character.", function() {
            var wordObj = { pos: "X", errs: [] };
            callTestFunc(wordObj, "parentheses");
            assert.equal(wordObj.errs.length, 0);
        });
    });

    describe("First Person", function() {
        var err = "Do not use the first person in formal writing.";

        it("should add error to I.", function() {
            var wordObj = { word: "I", errs: [] };
            callTestFunc(wordObj, "firstPerson");
            assert.equal(wordObj.errs[0], err);
        });
        it("should add error to me.", function() {
            var wordObj = { word: "me", errs: [] };
            callTestFunc(wordObj, "firstPerson");
            assert.equal(wordObj.errs[0], err);
        });
        it("should add error to my.", function() {
            var wordObj = { word: "my", errs: [] };
            callTestFunc(wordObj, "firstPerson");
            assert.equal(wordObj.errs[0], err);
        });
        it("should add error to mine.", function() {
            var wordObj = { word: "mine", errs: [] };
            callTestFunc(wordObj, "firstPerson");
            assert.equal(wordObj.errs[0], err);
        });
        it("should add error to we.", function() {
            var wordObj = { word: "we", errs: [] };
            callTestFunc(wordObj, "firstPerson");
            assert.equal(wordObj.errs[0], err);
        });
        it("should add error to us.", function() {
            var wordObj = { word: "us", errs: [] };
            callTestFunc(wordObj, "firstPerson");
            assert.equal(wordObj.errs[0], err);
        });
        it("should add error to our.", function() {
            var wordObj = { word: "our", errs: [] };
            callTestFunc(wordObj, "firstPerson");
            assert.equal(wordObj.errs[0], err);
        });
        it("should add error to ours.", function() {
            var wordObj = { word: "ours", errs: [] };
            callTestFunc(wordObj, "firstPerson");
            assert.equal(wordObj.errs[0], err);
        });
        it("should not add error to x.", function() {
            var wordObj = { word: "x", errs: [] };
            callTestFunc(wordObj, "firstPerson");
            assert.equal(wordObj.errs.length, 0);
        });
    });

});
