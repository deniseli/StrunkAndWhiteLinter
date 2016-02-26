"use strict";

var WordMatchChecks = require("./WordMatchChecks.js");

/**
 * @constructor
 * @param {InputCorpus} corpus
 * @param {Object<String, boolean>} dictionary
 */
var Validator = function(corpus, dictionary) {
    this.corpus = corpus;
    this.dictionary = dictionary;
    this.wordMatchChecks = new WordMatchChecks();
};

Validator.prototype.corpusMetrics = require("./Metrics.js");
Validator.prototype.contextDepChecks = require("./ContextDepChecks.js");
Validator.prototype.contextFreeChecks = require("./ContextFreeChecks.js");

/** Check if word exists in dictionary */
Validator.prototype.dictionaryContains = function(word) {
    return this.dictionary[word] ? true : false;
};

/** Run all the checks and metric calculations */
Validator.prototype.runAll = function() {
    this.runContextDepChecks();
    this.runContextFreeChecks();
    this.runWordMatchChecks();
    this.calcCorpusMetrics();
};

/**
 * Generates a map of metric to value, where the metric names come from the
 * keys of the corpus metric list
 * @return {Object<String, float>} metrics
 */
Validator.prototype.calcCorpusMetrics = function() {
    var metrics = {};
    for (var metric in this.corpusMetrics) {
        var func = this.corpusMetrics[metric].bind(this)
        metrics[metric] = func();
    }
    this.corpus.metrics = metrics;
};

/**
 * Runs all the listed context dependent checks and adds discovered errors to
 * the corpus
 */
Validator.prototype.runContextDepChecks = function() {
    for (var check in this.contextDepChecks) {
        var func = this.contextDepChecks[check].bind(this);
        func();
    }
};

/**
 * Runs all the listed context independent checks and adds discovered errors to
 * the corpus
 */
Validator.prototype.runContextFreeChecks = function() {
    for (var check in this.contextFreeChecks) {
        this.corpus.corpus.forEach(function(sen) {
            sen.forEach(function(wordObj) {
                var func = this.contextFreeChecks[check].bind(this);
                func(wordObj);
            }.bind(this));
        }.bind(this));
    }
};

/**
 * Runs all the word match checks and adds discovered errors to the corpus
 */
Validator.prototype.runWordMatchChecks = function() {
    this.corpus.corpus.forEach(function(sen) {
        sen.forEach(function(wordObj) {
            var newErrs = this.wordMatchChecks.run(wordObj.word);
            wordObj.errs = wordObj.errs.concat(newErrs);
        }.bind(this));
    }.bind(this));
};


module.exports = Validator;
