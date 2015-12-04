"use strict";

var InputCorpus = require("../js/InputCorpus.js");

var assert = require("chai").assert;

describe("InputCorpus", function() {

    it("should construct a data structure containing all the right words.", function() {
        var sen = getTestSen();
        var words = ["This", "is", "a", "test", "."];
        checkSentenceAttrEquals(sen, "word", words);
    });

    it("should tag words with the right part of speech.", function() {
        var sen = getTestSen();
        var tags = ["DT", "VBZ", "DT", "NN", "."];
        checkSentenceAttrEquals(sen, "pos", tags);
    });

    var getTestSen = function() {
        var corpus = new InputCorpus("This is a test.");
        assert.equal(corpus.corpus.length, 1);
        return corpus.corpus[0]
    };

    /**
     * @param sen {Array<Object>} an array of word objects
     * @param attrName {String} name of the word object attribute to check
     * @param values {Array} expected values
     */
    var checkSentenceAttrEquals = function(sen, attrName, values) {
        for (var i in sen) {
            assert.equal(sen[i][attrName], values[i]);
        }
    }

    it("should delimit paragraphs using an empty list.", function() {
        var corpus = new InputCorpus("This is a sentence.\nThis is a new paragraph.");
        assert.equal(corpus.corpus.length, 3);
        assert.equal(corpus.corpus[0].length, 5);
        assert.equal(corpus.corpus[1].length, 0);
        assert.equal(corpus.corpus[2].length, 6);
    });

});

