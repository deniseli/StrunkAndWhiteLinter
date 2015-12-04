"use strict";

var SEN_TERMINATORS = [".", "!", "?"];

/**
 * Functions that output certain metrics about the corpus
 * @return {float} metric
 */
module.exports = {

    /** Calculates percentage of sentence terminators that are exclamation points */
    exclamations: function() {
        var numTerms = 0.0;
        var numExcla = 0.0;
        this.corpus.corpus.forEach(function(sen) {
            sen.forEach(function(word) {
                if (SEN_TERMINATORS.indexOf(word.word) !== -1) {
                    numTerms++;
                    if (word.word == "!") {
                        numExcla++;
                    }
                }
            });
        });
        return numExcla / numTerms;
    },

    /** Calculates the average paragraph length */
    avgParagraphLength: function() {
        var numSens = 0.0;
        var numParas = 1.0;
        this.corpus.corpus.forEach(function(sen) {
            if (sen.length === 0) {
                numParas++;
            } else {
                numSens++;
            }
        });
        return numSens / numParas;
    },

};
