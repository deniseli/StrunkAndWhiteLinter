"use strict";

var InputCorpus = require("../js/InputCorpus.js");
var Validator = require("../js/Validator.js");

var assert = require("chai").assert;

/** Call the check function with the given name */
var callTestFunc = function(testCorpus, funcName) {
    var validator = new Validator(testCorpus, {});
    var checkFunc = validator.contextDepChecks[funcName].bind(validator);
    checkFunc();
};

/** Generate a fake corpus */
var genDefaultFakeCorpus = function() {
    return genFakeCorpusWithWordSeq(["x", "x", "x", "x", "."]);
};

/** Generate a fake corpus with word sequence */
var genFakeCorpusWithWordSeq = function(words) {
    return genFakeCorpusWithSenSeq([words]);
};

var genFakeCorpusWithSenSeq = function(sens) {
    return { corpus: sens.map(function(sen) {
        return genWordObjs(sen);
    }) };
};

var genWordObjs = function(words) {
    return words.map(function(word) {
        return {
            word: word,
            pos: "X",
            errs: []
        };
    });
};

/** Assert there are no errors in the corpus */
var assertNoErrs = function(corpus) {
    corpus.corpus.forEach(function(sen) {
        for (var i = 0; i < sen.length; i++) {
            assert(!sen[i].errs || sen[i].errs.length === 0);
        }
    });
};

describe("Context Dependent Checks", function() {

    describe("Singular Possessives", function() {
        var err = "Form the possessive singular of nouns by adding 's.";

        it("should add error for sequence NN ' not-s.", function() {
            var testCorpus = genFakeCorpusWithSeq("NNP", true, false);
            callTestFunc(testCorpus, "singularPossessive");
            assert.equal(testCorpus.corpus[0][0].errs[0], err);
        });
        it("should add error for sequence NNP ' not-s.", function() {
            var testCorpus = genFakeCorpusWithSeq("NNP", true, false);
            callTestFunc(testCorpus, "singularPossessive");
            assert.equal(testCorpus.corpus[0][0].errs[0], err);
        });

        it("should not add error for sequence NN ' s.", function() {
            var testCorpus = genFakeCorpusWithSeq("NN", true, true);
            callTestFunc(testCorpus, "singularPossessive");
            assertNoErrs(testCorpus);
        });
        it("should not add error for sequence X ' not-s.", function() {
            var testCorpus = genFakeCorpusWithSeq("X", true, false);
            callTestFunc(testCorpus, "singularPossessive");
            assertNoErrs(testCorpus);
        });
        it("should not add error for sequence NN X not-s.", function() {
            var testCorpus = genFakeCorpusWithSeq("NN", false, false);
            callTestFunc(testCorpus, "singularPossessive");
            assertNoErrs(testCorpus);
        });

        /**
         * Generate a test corpus
         * @param {String} nounTag: pos for word object
         * @param {boolean} useApos: whether noun should be followed by apostrophe
         * @param {boolean{ useS: whether the maybe apostrophe should be followed by 's'
         * @return {InputCorpus} test corpus
         */
        var genFakeCorpusWithSeq = function(nounTag, useApos, useS) {
            var corpus = {};
            corpus.corpus = [[
                { word: "noun", pos: nounTag, errs: [] },
                { word: useApos ? "'" : "x", pos: "X", errs: [] },
                { word: useS ? "s" : "x", pos: "X", errs: [] }
            ]];
            return corpus;
        }
    });

    describe("As X or Y than", function() {
        var err = "Expressions of this type should be corrected by" +
            " rearranging the sentences. e.g. \"My opinion is as good or" +
            " better than his.\" -> \"My opinion is as good as his, if not" +
            " better.\"";

        it("should add error for sequence 'as JJ or JJ than'.", function() {
            var testCorpus = genFakeCorpusWithSeq("JJ");
            callTestFunc(testCorpus, "asXOrYThan");
            assert.equal(testCorpus.corpus[0][2].errs[0], err);
        });
        it("should add error for sequence 'as JJR or JJR than'.", function() {
            var testCorpus = genFakeCorpusWithSeq("JJR");
            callTestFunc(testCorpus, "asXOrYThan");
            assert.equal(testCorpus.corpus[0][2].errs[0], err);
        });
        it("should add error for sequence 'as JJS or JJS than'.", function() {
            var testCorpus = genFakeCorpusWithSeq("JJS");
            callTestFunc(testCorpus, "asXOrYThan");
            assert.equal(testCorpus.corpus[0][2].errs[0], err);
        });
        it("should not add error for sequence 'as X or X than'.", function() {
            var testCorpus = genFakeCorpusWithSeq("X");
            callTestFunc(testCorpus, "asXOrYThan");
            assertNoErrs(testCorpus);
        });

        /**
         * Generate a test corpus with sentence "It is as _ or _ than his."
         * @param {String} tag: POS tag the _'s should have
         * @return {InputCorpus} test corpus
         */
        var genFakeCorpusWithSeq = function(tag) {
            var corpus = {};
            corpus.corpus = [[
                { word: "It" },
                { word: "is" },
                { word: "as", errs: [] },
                { pos: tag },
                { word: "or" },
                { pos: tag },
                { word: "than" },
                { word: "his" },
                { word: "." }
            ]];
            return corpus;
        }
    });

    describe("As to whether", function() {
        var err = "Do not use \"as to whether.\" \"Whether\" is sufficient.";

        it("should add error when sentence contains 'as to whether'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["as", "to", "whether"]);
            callTestFunc(testCorpus, "asToWhether");
            assert.equal(testCorpus.corpus[0][0].errs[0], err);
        });
        it("should add error when sentence contains 'As to whether'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["As", "to", "whether"]);
            callTestFunc(testCorpus, "asToWhether");
            assert.equal(testCorpus.corpus[0][0].errs[0], err);
        });
        it("should not add error when sentence does not contain 'A/as to whether'.", function() {
            var testCorpus = genDefaultFakeCorpus();
            callTestFunc(testCorpus, "asToWhether");
            assertNoErrs(testCorpus);
        });
    });

    describe("As yet", function() {
        var err = "Do not use \"as yet.\" \"Yet\" nearly always is as good, if not better.";

        it("should add error when sentence contains 'as yet'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["as", "yet"]);
            callTestFunc(testCorpus, "asYet");
            assert.equal(testCorpus.corpus[0][0].errs[0], err);
        });
        it("should add error when sentence contains 'As yet'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["As", "yet"]);
            callTestFunc(testCorpus, "asYet");
            assert.equal(testCorpus.corpus[0][0].errs[0], err);
        });
        it("should add error when sentence contains 'as yet'.", function() {
            var testCorpus = genDefaultFakeCorpus();
            callTestFunc(testCorpus, "asYet");
            assertNoErrs(testCorpus);
        });
    });

    describe("Oxford Comma", function() {
        var err = "In a series of three or more terms with a single" +
            " conjunction, use a comma after each term except the last.";

        it("should add error when sentence has patturn NP, NP and NP.", function() {
            var testCorpus = new InputCorpus("I like fluffy cats, fat dogs and radios!");
            callTestFunc(testCorpus, "oxfordComma");
            assert.equal(testCorpus.corpus[0][7].errs[0], err);
        });
        it("should add error when sentence has patturn JJ, JJ or JJ.", function() {
            var testCorpus = new InputCorpus("Are your people valuable, healthy or civilized?");
            callTestFunc(testCorpus, "oxfordComma");
            assert.equal(testCorpus.corpus[0][6].errs[0], err);
        });
        it("should add error when sentence has patturn VP, VP and VP.", function() {
            var testCorpus = new InputCorpus("Have breakfast, take a shower and arrive on time.");
            callTestFunc(testCorpus, "oxfordComma");
            assert.equal(testCorpus.corpus[0][6].errs[0], err);
        });
        it("should not add error when sentence has patturn NP, NP, and NP.", function() {
            var testCorpus = new InputCorpus("I like fluffy cats, fat dogs, and radios!");
            callTestFunc(testCorpus, "oxfordComma");
            assertNoErrs(testCorpus);
        });
        it("should not add error when sentence has patturn JJ, JJ, or JJ.", function() {
            var testCorpus = new InputCorpus("Are your people valuable, healthy, or civilized?");
            callTestFunc(testCorpus, "oxfordComma");
            assertNoErrs(testCorpus);
        });
        it("should not add error when sentence has patturn VP, VP, and VP.", function() {
            var testCorpus = new InputCorpus("Have breakfast, take a shower, and arrive on time.");
            callTestFunc(testCorpus, "oxfordComma");
            assertNoErrs(testCorpus);
        });
        it("should add error when sentence has patturn NP, NP, NP and NP.", function() {
            var testCorpus = new InputCorpus("Bob keeps mongooses, parrots, fish and cats.");
            callTestFunc(testCorpus, "oxfordComma");
            assert.equal(testCorpus.corpus[0][7].errs[0], err);
        });
    });

    describe("Date Format", function() {
        var err = "You should write dates as 'January 1, 2000' or '1 January 2000'.";
        it("should not add error to 'January 1, 2000'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "January", "1", ",", "2000", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assertNoErrs(testCorpus);
        });
        it("should not add error to '1 January 2000'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "1", "January", "2000", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assertNoErrs(testCorpus);
        });
        it("should not add error to '01/32/00'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "01", "/", "32", "/", "00", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assertNoErrs(testCorpus);
        });
        it("should not add error to '13/31/00'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "13", "/", "31", "/", "00", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assertNoErrs(testCorpus);
        });
        it("should not add error to '01/01/000'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "01", "/", "01", "/", "000", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assertNoErrs(testCorpus);
        });
        it("should add error to 'January 1 2000'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "January", "1", "2000", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assert.equal(testCorpus.corpus[0][3].errs[0], err);
        });
        it("should add error to 'January, 1, 2000'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "January", ",", "1", ",", "2000", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assert.equal(testCorpus.corpus[0][3].errs[0], err);
        });
        it("should add error to '1, January 2000'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "1", ",", "January", "2000", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assert.equal(testCorpus.corpus[0][3].errs[0], err);
        });
        it("should add error to '1 January, 2000'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "1", ",", "January", ",", "2000", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assert.equal(testCorpus.corpus[0][3].errs[0], err);
        });
        it("should add error to '01/01/00'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "01", "/", "01", "/", "00", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assert.equal(testCorpus.corpus[0][3].errs[0], err);
        });
        it("should add error to '01/01/2000'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "01", "/", "01", "/", "2000", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assert.equal(testCorpus.corpus[0][3].errs[0], err);
        });
        it("should add error to '1/1/00'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "1", "/", "1", "/", "00", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assert.equal(testCorpus.corpus[0][3].errs[0], err);
        });
        it("should add error to '1/1/2000'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "date", "was", "1", "/", "1", "/", "2000", "."]);
            callTestFunc(testCorpus, "dateFormat");
            assert.equal(testCorpus.corpus[0][3].errs[0], err);
        });
        it("should not add error to non-date input.", function() {
            var testCorpus = genDefaultFakeCorpus();
            callTestFunc(testCorpus, "dateFormat");
            assertNoErrs(testCorpus);
        });
    });

    describe("Omit Needless Words", function() {

        it("should add error to 'The question as to whether'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "question", "as", "to", "whether"]);
            callTestFunc(testCorpus, "omitNeedlessWords");
            for (var i = 0; i < testCorpus.corpus[0].length; i++) {
                assert.equal(testCorpus.corpus[0][i].errs[0],
                    "Vigorous writing is concise. Omit needless words by" +
                    " replacing \"the question as to whether\" with \"whether\".");
            }
        });
        it("should add error to 'But the question as to whether'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["But", "the", "question", "as", "to", "whether"]);
            callTestFunc(testCorpus, "omitNeedlessWords");
            for (var i = 1; i < testCorpus.corpus[0].length; i++) {
                assert.equal(testCorpus.corpus[0][i].errs[0],
                    "Vigorous writing is concise. Omit needless words by" +
                    " replacing \"the question as to whether\" with \"whether\".");
            }
        });
        it("should add error to 'There is no doubt but that'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["There", "is", "no", "doubt", "but", "that"]);
            callTestFunc(testCorpus, "omitNeedlessWords");
            for (var i = 0; i < testCorpus.corpus[0].length; i++) {
                assert.equal(testCorpus.corpus[0][i].errs[0],
                    "Vigorous writing is concise. Omit needless words by" +
                    " replacing \"there is no doubt but that\" with \"doubtless\".");
            }
        });
        it("should add error to 'For fuel purposes'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["For", "fuel", "purposes"]);
            callTestFunc(testCorpus, "omitNeedlessWords");
            for (var i = 0; i < testCorpus.corpus[0].length; i++) {
                assert.equal(testCorpus.corpus[0][i].errs[0],
                    "Vigorous writing is concise. Omit needless words by" +
                    " replacing \"for * purposes\" with \"for *\".");
            }
        });
        it("should add error to 'In a hasty manner'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["In", "a", "hasty", "manner"]);
            callTestFunc(testCorpus, "omitNeedlessWords");
            for (var i = 0; i < testCorpus.corpus[0].length; i++) {
                assert.equal(testCorpus.corpus[0][i].errs[0],
                    "Vigorous writing is concise. Omit needless words by" +
                    " replacing \"in a * manner\" with \"ADV(*)\".");
            }
        });
        it("should add error to 'This is a subject that'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["This", "is", "a", "subject", "that"]);
            callTestFunc(testCorpus, "omitNeedlessWords");
            for (var i = 0; i < testCorpus.corpus[0].length; i++) {
                assert.equal(testCorpus.corpus[0][i].errs[0],
                    "Vigorous writing is concise. Omit needless words by" +
                    " replacing \"this is a * that\" with \"this *\".");
            }
        });
        it("should add error to 'A strange one'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["A", "strange", "one"]);
            callTestFunc(testCorpus, "omitNeedlessWords");
            for (var i = 0; i < testCorpus.corpus[0].length; i++) {
                assert.equal(testCorpus.corpus[0][i].errs[0],
                    "Vigorous writing is concise. Omit needless words by" +
                    " replacing \"a * one\" with \"*\".");
            }
        });
        it("should add error to 'The reason why is that'.", function() {
            var testCorpus = genFakeCorpusWithWordSeq(["The", "reason", "why", "is", "that"]);
            callTestFunc(testCorpus, "omitNeedlessWords");
            for (var i = 0; i < testCorpus.corpus[0].length; i++) {
                assert.equal(testCorpus.corpus[0][i].errs[0],
                    "Vigorous writing is concise. Omit needless words by" +
                    " replacing \"the reason why is that\" with \"because\".");
            }
        });
    });

    describe("Loose Sentences", function() {
        var err = "Avoid a succession of loose sentences.";

        it("should error for 3 loose sentences.", function() {
            var testCorpus = new InputCorpus(
                "Some tanks are big, and some airplanes are small. " +
                "Railroads are long, and some roads are short. " +
                "Cats are felines, but boats are big.");
            callTestFunc(testCorpus, "looseSentences");
            assert.equal(testCorpus.corpus[0][0].errs[0], err);
            assert.equal(testCorpus.corpus[1][0].errs[0], err);
            assert.equal(testCorpus.corpus[2][0].errs[0], err);
        });
        it("should not error for 2 loose sentences.", function() {
            var testCorpus = new InputCorpus(
                "Some tanks are big, and some airplanes are small. " +
                "Cats are felines, but boats are big.");
            callTestFunc(testCorpus, "looseSentences");
            assert.equal(testCorpus.corpus[0][0].errs.length, 0);
            assert.equal(testCorpus.corpus[1][0].errs.length, 0);
        });
    });

});
