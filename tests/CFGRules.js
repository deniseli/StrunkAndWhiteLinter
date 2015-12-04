"use strict";

var CFGRules = require("../js/CFGRules.js");

var assert = require("chai").assert;

describe("CFGRules", function() {

    it("should translate NP tags.", function() {
        assert.equal(CFGRules.translate("NN"), "NP");
        assert.equal(CFGRules.translate("NNS"), "NP");
        assert.equal(CFGRules.translate("NNP"), "NP");
        assert.equal(CFGRules.translate("NNPS"), "NP");
    });

    it("should translate VP tags.", function() {
        assert.deepEqual(CFGRules.translate("VB"), ["VP", "VB"]);
        assert.equal(CFGRules.translate("VBD"), "VP");
        assert.equal(CFGRules.translate("VBN"), "VP");
        assert.equal(CFGRules.translate("VBP"), "VP");
        assert.equal(CFGRules.translate("VBZ"), "VP");
    });

    it("should translate JJ tags.", function() {
        assert.equal(CFGRules.translate("JJ"), "JJ");
        assert.equal(CFGRules.translate("JJR"), "JJ");
        assert.equal(CFGRules.translate("JJS"), "JJ");
    });

    it("should get NP -> DT NP rule.", function() {
        assert.equal(CFGRules.get("DT", "NP"), "NP");
    });

    it("should get NP -> JJ NP rule.", function() {
        assert.equal(CFGRules.get("JJ", "NP"), "NP");
    });

    it("should get S -> NP VP rule.", function() {
        assert.equal(CFGRules.get("NP", "VP"), "S");
    });

});
