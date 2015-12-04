"use strict";

var BookMetricDistributions = require("../js/BookMetricDistributions.js");

var BookMetrics = require("../constants/BookMetrics.js");

var assert = require("chai").assert;

describe("BookMetricDistributions", function() {

    it("should cover all books and metrics for graphing.", function() {
        var covered = genCoverageDict();
        var data = BookMetricDistributions.graphingData({
            exclamations: 0,
            avgParagraphLength: 0
        });
        var yourTextCount = 0;
        data.forEach(function(metricVal) {
            if (metricVal.name === "Your Text") {
                yourTextCount++;
            } else {
                covered[metricVal.metric][metricVal.name] = true;
            }
        });
        assert.equal(yourTextCount, 2);
        assertCoverageDict();
    });
    it("should calculate correct mins.", function() {
        assert.equal(BookMetricDistributions.min("exclamations"), 0);
        assert.equal(BookMetricDistributions.min("avgParagraphLength"), 2.0303030303030303);
    });
    it("should calculate correct q1s.", function() {
        assert.equal(BookMetricDistributions.q1("exclamations"), 0.013791800491214812);
        assert.equal(BookMetricDistributions.q1("avgParagraphLength"), 3.095958609918001);
    });
    it("should calculate correct medians.", function() {
        assert.equal(BookMetricDistributions.median("exclamations"), 0.02355072463768116);
        assert.equal(BookMetricDistributions.median("avgParagraphLength"), 4.893203883495145);
    });
    it("should calculate correct q3s.", function() {
        assert.equal(BookMetricDistributions.q3("exclamations"), 0.16309202493413022);
        assert.equal(BookMetricDistributions.q3("avgParagraphLength"), 5.5954738330975955);
    });
    it("should calculate correct maxes.", function() {
        assert.equal(BookMetricDistributions.max("exclamations"), 0.1958762886597938);
        assert.equal(BookMetricDistributions.max("avgParagraphLength"), 6.065934065934066);
    });

    /** @return {Object} dict mapping metrics and books to `false` */
    var genCoverageDict = function() {
        var covered = {};
        Object.keys(BookMetrics).forEach(function(metric) {
            covered[metric] = {};
            Object.keys(BookMetrics[metric]).forEach(function(book) {
                covered[metric][book] = false;
            });
        });
        return covered;
    };

    /** Asserts all the terminal values in dict are true */
    var assertCoverageDict = function(covered) {
        for (var metric in covered) {
            for (var book in covered[metric]) {
                assert(covered[metric][book]);
            }
        }
    };

});
