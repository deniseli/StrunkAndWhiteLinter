"use strict";

var Validator = require("../js/Validator.js");

var assert = require("chai").assert;

describe("Metrics", function() {

    describe("Exclamations", function() {
        it("should count number of exclamations in corpus.", function() {
            var testCorpus = {};
            testCorpus.corpus = [
                genFakeSentenceWithTerm("."),
                genFakeSentenceWithTerm("."),
                genFakeSentenceWithTerm("!"),
                genFakeSentenceWithTerm("?")
            ];
            var validator = new Validator(testCorpus, {});
            var metricFunc = validator.corpusMetrics.exclamations.bind(validator);
            assert.equal(metricFunc(), 0.25);
        });
        var genFakeSentenceWithTerm = function(term) {
            return [ { word: "x" }, { word: "x" }, { word: term } ];
        };
    });

    describe("Average Paragraph Length", function() {
        it("should get average number of sentences per paragraph.", function() {
            var testCorpus = {};
            testCorpus.corpus = [ [1], [], [1], [1], [1], [1], [], [1] ];
            var validator = new Validator(testCorpus, {});
            var metricFunc = validator.corpusMetrics.avgParagraphLength.bind(validator);
            assert.equal(metricFunc(), 2.0);
        });
    });

});
