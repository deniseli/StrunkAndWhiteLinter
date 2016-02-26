"use strict";

var WordMatchChecks = require("../js/WordMatchChecks.js");

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

describe("Word Match Checks", function() {

    describe("Exclamations", function() {
        var err = "Do not attempt to emphasize" +
            " simple statements by using a mark of exclamation. The" +
            " exclamation mark is to be reserved for use after true" +
            " exclamations or commands.";
        it("should add error when word is exclamation point.", function() {
            var errs = runCheck("!");
            assert.equal(errs[0], err);
        });
        it("should not add error when word is not exclamation point.", function() {
            checkDefaultCase(err);
        });
    });

    describe("Parentheses", function() {
        var err = "Enclose parenthetic expressions between commas.";

        it("should add error to (.", function() {
            var errs = runCheck("(");
            assert.equal(errs[0], err);
        });
        it("should add error to ).", function() {
            var errs = runCheck(")");
            assert.equal(errs[0], err);
        });
        it("should not add error to non-parenthetic character.", function() {
            checkDefaultCase(err);
        });
    });

    describe("First Person", function() {
        var err = "Do not use the first person in formal writing.";

        it("should add error to I.", function() {
            var errs = runCheck("I");
            assert.equal(errs[0], err);
        });
        it("should add error to me.", function() {
            var errs = runCheck("me");
            assert.equal(errs[0], err);
        });
        it("should add error to my.", function() {
            var errs = runCheck("my");
            assert.equal(errs[0], err);
        });
        it("should add error to mine.", function() {
            var errs = runCheck("mine");
            assert.equal(errs[0], err);
        });
        it("should add error to we.", function() {
            var errs = runCheck("we");
            assert.equal(errs[0], err);
        });
        it("should add error to us.", function() {
            var errs = runCheck("us");
            assert.equal(errs[0], err);
        });
        it("should add error to our.", function() {
            var errs = runCheck("our");
            assert.equal(errs[0], err);
        });
        it("should add error to ours.", function() {
            var errs = runCheck("ours");
            assert.equal(errs[0], err);
        });
        it("should not add error to x.", function() {
            checkDefaultCase(err);
        });
    });

});
