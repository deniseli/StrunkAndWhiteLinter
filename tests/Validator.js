"use strict";

var InputCorpus = require("../js/InputCorpus.js");
var Validator = require("../js/Validator.js");

var assert = require("chai").assert;
var sinon = require("sinon");

/** Get a test validator instance */
var setupValidator = function(testCorpus) {
    testCorpus = testCorpus || { corpus: [[
        {word: "x"}
    ]] };
    var dict = {
        "a": true,
        "b": true,
        "c": true
    };
    return new Validator(testCorpus, dict);
};

describe("Validator", function() {

    it("should check if dictionary contains a word.", function() {
        var validator = setupValidator();
        assert.equal(validator.dictionaryContains("a"), true);
        assert.equal(validator.dictionaryContains("b"), true);
        assert.equal(validator.dictionaryContains("c"), true);
        assert.equal(validator.dictionaryContains("d"), false);
    });

    it("should run all the checks when runAll is called.", function() {
        var validator = setupValidator();
        var contextFreeCheck = sinon.spy();
        var contextDepCheck = sinon.spy();
        var metricCheck = sinon.spy();
        validator.contextFreeChecks = { test: contextFreeCheck };
        validator.contextDepChecks = { test: contextDepCheck };
        validator.corpusMetrics = { test: metricCheck };
        validator.runAll();
        assert.equal(contextFreeCheck.called, true);
        assert.equal(contextDepCheck.called, true);
        assert.equal(metricCheck.called, true);
    });

    it("should not crash when running all current tests on simple corpus.", function() {
        var testCorpus = new InputCorpus("In The Importance of Being Earnest," +
            " Oscar Wilde illustrates the repulsive force between clearly" +
            " defined knowledge and the upper class through examination of" +
            " the attraction felt by young, upper-class women towards" +
            " mysterious men, the threat posed to the elite by thought and" +
            " exploration, and the manipulation of etiquette allowed by" +
            " loose moral definitions.");
        var validator = setupValidator(testCorpus);
        validator.runAll();
    });

});
