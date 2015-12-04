"use strict";

var BookMetrics = require("../constants/BookMetrics");

/** Provides functions for acting on the constants defined in BookMetrics.js */
var BookMetricDistributions = {};

/** @return {Object} metrics in format for d3plus */
BookMetricDistributions.graphingData = function(corpusMetrics) {
    var data = [];
    for (var metric in BookMetrics) {
        for (var book in BookMetrics[metric]) {
            data.push(getMetricBookObj(metric, book));
        }
        data.push(getMetricBookObj(metric, "Your Text", corpusMetrics[metric]))
    }
    return data;
};

/** @return a single row of a d3plus compliant book metric */
var getMetricBookObj = function(metric, book, value) {
    return {
        "metric" : metric,
        "name" : book,
        "normalized value" :
        BookMetricDistributions.normalized(metric, value || BookMetrics[metric][book])
    };
};

/** @return {float} the value scaled to the range of metric */
BookMetricDistributions.normalized = function(metric, value) {
    var min = BookMetricDistributions.min(metric)
    var range = BookMetricDistributions.max(metric) - min;
    return (value - min) / range;
}

/**
 * @param metric {String} name of metric
 * @return {float} minimum of distribution for the given metric
 */
BookMetricDistributions.min = function(metric) {
    return getSortedMetrics(metric)[0];
};

/**
 * @param metric {String} name of metric
 * @return {float} lower quartile of distribution for the given metric
 */
BookMetricDistributions.q1 = function(metric) {
    var sorted = getSortedMetrics(metric);
    var half = sorted.length % 2 == 1 ?
        sorted.slice(0, (sorted.length - 1) / 2) :
        sorted.slice(0, sorted.length / 2);
    return median(half);
};

/**
 * @param metric {String} name of metric
 * @return {float} median of distribution for the given metric
 */
BookMetricDistributions.median = function(metric) {
    return median(getSortedMetrics(metric));
};

/**
 * @param metric {String} name of metric
 * @return {float} upper quartile of distribution for the given metric
 */
BookMetricDistributions.q3 = function(metric) {
    var sorted = getSortedMetrics(metric);
    var half = sorted.length % 2 == 1 ?
        sorted.slice((sorted.length - 1) / 2 + 1, sorted.length) :
        sorted.slice(sorted.length / 2, sorted.length);
    return median(half);
};

/**
 * @param metric {String} name of metric
 * @return {float} maximum of distribution for the given metric
 */
BookMetricDistributions.max = function(metric) {
    var sorted = getSortedMetrics(metric);
    return sorted[sorted.length - 1]
};

/** @return {Array<float>} sorted array of values for the given metric */
var getSortedMetrics = function(metric) {
    return Object.keys(BookMetrics[metric]).map(function(key) {
        return BookMetrics[metric][key];
    }).sort();
};

/**
 * @param {Array} list: sorted list
 * @return median of the list
 */
var median = function(list) {
    if (list.length % 2 == 1) {
        return list[(list.length - 1) / 2];
    }
    var i = list.length / 2 - 1;
    return (list[i] + list[i + 1]) / 2;
};


module.exports = BookMetricDistributions;
