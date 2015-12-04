"use strict";

/**
 * Disclaimer: This file tests the accuracy of the CFG Parser to the minimum
 * bound of our needs. It is not meant to parse whole sentences accurately
 * because we do not need it to. It is not expected to have high accuracy
 * because it depends on the NPM "pos" module, which is relatively inaccurate.
 */

var CFGParser = require("../js/CFGParser.js");

var assert = require("chai").assert;

/** Generate parser for simple sentence */
var genSimpleParser = function() {
    var sentence = [
        { pos: "NN" }, // 0 Spring
        { pos: "VB" }, // 1 is
        { pos: "JJ" }, // 2 here
        { pos: "." },  // 3 .
    ];
    return new CFGParser(sentence);
};

describe("CFGParser", function() {

    it("should output correct parsing for simple sentence.", function() {
        var parser = genSimpleParser();

        assert(parser.chart.getCell(0,0).getItem("NP") !== undefined);
        assert(parser.chart.getCell(1,1).getItem("VP") !== undefined);
        assert(parser.chart.getCell(2,2).getItem("JJ") !== undefined);
        assert(parser.chart.getCell(3,3).getItem(".") !== undefined);

        assert(parser.chart.getCell(0,1).getItem("S") !== undefined);
        assert(parser.chart.getCell(1,2).getItem("VP") !== undefined);
        assert.equal(Object.keys(parser.chart.getCell(2,3).items).length, 0);

        assert(parser.chart.getCell(0,2).getItem("S") !== undefined);
        assert(parser.chart.getCell(1,3).getItem("TOP") !== undefined);

        assert(parser.chart.getCell(0,3).getItem("TOP") !== undefined);

        assert.equal(parser.toString(), "( TOP ( S [NP] ( VP [VP] [JJ] ) ) [.] )");
    });

    it("should get the correct label lists for each word of the simple sentence.", function() {
        var parser = genSimpleParser();

        assert.deepEqual(parser.getLabels(0,0), ["NP"]);
        assert.deepEqual(parser.getLabels(1,1), ["VP", "VB"]);
        assert.deepEqual(parser.getLabels(2,2), ["JJ"]);
        assert.deepEqual(parser.getLabels(3,3), ["."]);

        assert.deepEqual(parser.getLabels(0,1), ["S"]);
        assert.deepEqual(parser.getLabels(1,2), ["VP"]);
        assert.deepEqual(parser.getLabels(2,3), []);

        assert.deepEqual(parser.getLabels(0,2), ["S"]);
        assert.deepEqual(parser.getLabels(1,3), ["TOP"]);

        assert.deepEqual(parser.getLabels(0,3), ["TOP"]);
    });

    it("should check if a parse node has a label.", function() {
        var parser = genSimpleParser();
        assert(parser.hasLabel(0, 0, "NP"));
        assert(!parser.hasLabel(0, 0, "VP"));
    });

});
