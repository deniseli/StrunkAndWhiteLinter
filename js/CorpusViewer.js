"use strict";

var $ = require("jquery");

var BookMetricDistributions = require("./BookMetricDistributions.js");
var InputCorpus = require("./InputCorpus.js");

var BookMetrics = require("../constants/BookMetrics");

var CorpusViewer = {};

var DIAG_ID = "badWordDiagnostics";
var DIAG_SELECTOR = "#" + DIAG_ID;
var METRIC_SELECTOR = "#metrics";
var OUT_SELECTOR = "#out";

/**
 * Renders the corpus in the appropriate container
 * @param {InputCorpus} corpus
 */
CorpusViewer.render = function(corpus) {
    renderMetrics(corpus);
    renderCorpus(corpus);
}

/** Renders temorary loading notes */
CorpusViewer.renderLoadingDivs = function() {
    clearMetricDiv();
    $(METRIC_SELECTOR).html("...Loading...");
};

/** Clears the div meant to contain corpus metrics */
var clearMetricDiv = function() {
    $(METRIC_SELECTOR).remove();
    $("body").append("<div id='metrics'></div>");
};

/** Clears the div meant to contain the corpus output */
var clearOutputDiv = function() {
    $(OUT_SELECTOR).remove();
    $("body").append("<div id='out'></div>");
};

/** Renders metric portion of the input corpus */
var renderMetrics = function(corpus) {
    clearMetricDiv();
    renderMetricTable(corpus);
    renderMetricBoxAndWhiskers(corpus);
};

/** Renders the table of metrics calcuated for this corpus */
var renderMetricTable = function(corpus) {
    var div = $(METRIC_SELECTOR);
    div.append("<h3>Overall Metrics</h3>");
    div.append("<table></table>");
    var table = $("table");
    table.append("<tr><th>Metric</th><th>Value</th><th>Scaled Value</th></tr>");
    for (var metric in corpus.metrics) {
        var scaledVal = BookMetricDistributions.normalized(metric, corpus.metrics[metric]);
        var isBad = scaledVal > 1 || scaledVal < 0;
        table.append(genRowElem(isBad, metric, corpus.metrics[metric], scaledVal));
    }
};

/**
 * @param {boolean} badMetric: whether the element should have badMetric class
 * @param {String} metric
 * @param {float} value
 * @param {float} scaledVal
 * @param {Element} row for the overall metrics table
 */
var genRowElem = function(badMetric, metric, value, scaledVal) {
    var rowElem = $("<tr" + (badMetric ? " class='bad'" : "") +
        "><td class='metric-label'>" + metric + "</td><td>" +
        value + "</td><td>" + scaledVal + "</td></tr>");
    if (badMetric) {
        bindErrorDiag(rowElem, metric, value);
    }
    return rowElem;
};

/**
 * Binds the appropriate error dialog to the elem's mouseenter
 * @param {Element} elem
 * @param {String} metric
 * @param {float} value
 */
var bindErrorDiag = function(elem, metric, value) {
    var errs = ["This metric (" + metric +
        ") is outside the expected range. It has evaluated to " +
        value + ", but it should lie in the range: " +
        "[" + BookMetricDistributions.min(metric).toFixed(3) +
        ", " + BookMetricDistributions.max(metric).toFixed(3) + "]."];
    var renderDiag = renderBadWordDiag.bind(this, errs);
    elem.mouseenter(renderDiag);
};

/** Renders the d3 visualization with classic metric distributions */
var renderMetricBoxAndWhiskers = function(corpus) {
    var div = $(METRIC_SELECTOR);
    div.append("<h3>Scaled Metrics Against Classics</h3>");
    div.append("<div id='metric-box-and-whisker-plots'>/<div>");
    var data = BookMetricDistributions.graphingData(corpus.metrics);
    var viz = d3plus.viz()
        .data(data)
        .container("#metric-box-and-whisker-plots")
        .type("box")
        .id("name")
        .x("metric")
        .y("normalized value")
        .ui([{
            "label": "Visualization Type",
            "method": "type",
            "value": ["scatter","box"]
        }])
        .draw();
}

/** Renders text portion of the input corpus */
var renderCorpus = function(corpus) {
    clearOutputDiv();
    var div = $(OUT_SELECTOR);
    div.append("<h3>Annotated Text</h3>");
    corpus.corpus.forEach(function(sen) {
        if (sen.length == 0) {
            startNewParagraph();
        }
        sen.forEach(function(wordObj) {
            renderWordIncremental(wordObj);
        });
    });
};

/** Add newlines to the output div to denote a paragraph break */
var startNewParagraph = function() {
    var div = $(OUT_SELECTOR);
    div.append("<br><br>");
}

/**
 * Appends a word to the output div
 * @param {Object} wordObj
 */
var renderWordIncremental = function(wordObj) {
    var div = $(OUT_SELECTOR);
    if (wordObj.errs.length == 0) {
        renderBasicWordIncremental(wordObj.word);
    } else {
        renderBadWordIncremental(wordObj);
    }
};

/**
 * Appends a basic (without errors) word to the output div
 * @param {String} word
 */
var renderBasicWordIncremental = function(word) {
    $(OUT_SELECTOR).append("<span>" + word + "</span> ");
};

/**
 * Appends a word with errors to the output div
 * @param {Object} wordObj
 */
var renderBadWordIncremental = function(wordObj) {
    var div = $(OUT_SELECTOR);
    var wordElem = $("<span class='bad'>" + wordObj.word + "</span>")
    var renderDiag = renderBadWordDiag.bind(this, wordObj.errs);
    wordElem.mouseenter(renderDiag);
    div.append(wordElem);
    div.append(" ");
};

/**
 * Renders the list of errors for a bad word
 * @param {Array<String>} errs
 * @param {Event} e
 */
var renderBadWordDiag = function(errs, e) {
    removeBadWordDiagBox();
    $("body").append("<div id='" + DIAG_ID +
                     "' style='left:" + e.pageX +
                     ";top:" + e.pageY + "'>");
    var div = $(DIAG_SELECTOR);
    div.click(removeBadWordDiagBox);
    errs.forEach(function(err) {
        div.append("<div>" + err + "</div>");
    });
};

/** Remove diagnostics box */
var removeBadWordDiagBox = function(e) {
    $(DIAG_SELECTOR).remove();
};

module.exports = CorpusViewer;
