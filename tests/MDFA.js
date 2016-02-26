"use strict";

var MDFA = require("../js/MDFA.js");

var sinon = require("sinon");
var assert = require("chai").assert;

/**
 * @param {String} word
 * @return {Array<String>} errs
 */
var runCheck = function(word) {
    var checks = new WordMatchChecks();
    return checks.run(word);
};

/**
 * @param {String} err: should not appear in run of non-erroring string
 */
var checkDefaultCase = function(err) {
    var errs = runCheck("x");
    assert.equal(errs.indexOf(err), -1);
}

describe("MDFA", function() {

    describe("addWord", function() {
        it("should error on length 0 word", function() {
            sinon.spy(console, "error");
            var mdfa = new MDFA();
            mdfa.addWord("");
            assert(console.error.calledWith("Invalid word: Must be at least 1 character long."));
            console.error.restore();
        });
        it("should add word properly", function() {
            var mdfa = new MDFA();
            assertWordAdded(mdfa);
        });
        it("should add branching word properly", function() {
            var mdfa = new MDFA();
            mdfa.addWord("wool");
            assertWordAdded(mdfa);
        });

        /** asserts "word" was added correctly to the mdfa */
        var assertWordAdded = function(mdfa) {
            mdfa.addWord("word", ["err"]);
            assert.equal(mdfa.states["S"].trans["w"], mdfa.states["w"]);
            assert.equal(mdfa.states["S"].trans["W"], mdfa.states["w"]);
            assert.equal(mdfa.states["w"].trans["o"], mdfa.states["wo"]);
            assert.equal(mdfa.states["w"].trans["O"], mdfa.states["wo"]);
            assert.equal(mdfa.states["wo"].trans["r"], mdfa.states["wor"]);
            assert.equal(mdfa.states["wo"].trans["R"], mdfa.states["wor"]);
            assert.equal(mdfa.states["wor"].trans["d"], mdfa.states["word"]);
            assert.equal(mdfa.states["wor"].trans["D"], mdfa.states["word"]);
            assert.equal(mdfa.states["word"].out[0], "err");
        }
    });

});
