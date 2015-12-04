"use strict";

var pos = require("pos");

var CFGParser = require("./CFGParser.js");

/**
 * @constructor
 * @param {String} text
 *   single string of text to be split into sentences and tagged with POS
 */
var InputCorpus = function(text) {
    var sentences = this.genSentences(text);
    this.corpus = this.genCorpus(sentences);
    this.parsed = this.genParseTree();
};

/**
 * Splits the input text into sentences and stores them.
 * @param {String} text
 *   single string of text to be split into sentences
 * @return input text split into sentences
 */
InputCorpus.prototype.genSentences = function(text) {
    var splitInput = text.split(/([.!?]+)/g);
    var sentences = [];
    var started = false;
    for (var i = 0; i < splitInput.length - 1; i += 2) {
        var fullSentence = splitInput[i] + splitInput[i + 1];
        if (fullSentence[0] == "\n") {
            if (started) {
                sentences.push("\n");
            }
        } else {
            started = true;
        }
        sentences.push(fullSentence.trim());
    }
    return sentences;
};

/**
 * Generates the object used to represent the corpus
 * @param {Array<String>} sentences
 * @return data structure holding corpus
 */
InputCorpus.prototype.genCorpus = function(sentences) {
    var corpus = [];
    for (var i = 0; i < sentences.length; i++) {
        corpus.push(this.genSentenceStruct(sentences[i]));
    }
    return corpus;
};

/**
 * Generates the data structure for each sentence
 * @param {String} sentence
 * @return data structure holding words in the sentence
 */
InputCorpus.prototype.genSentenceStruct = function(sentence) {
    var struct = [];
    var tagged = this.tagString(sentence);
    for (var i in tagged) {
        struct.push({
            word: tagged[i][0],
            pos: tagged[i][1],
            errs: []
        });
    }
    return struct;
};

/**
 * Tags a sentence using the pos module
 * @param {String} text
 * @return tagged sequence
 */
InputCorpus.prototype.tagString = function(text) {
    var words = new pos.Lexer().lex(text);
    var tagger = new pos.Tagger();
    return tagger.tag(words);
};

/** 
 * Generate the CKY parse tree for each sentence
 * @return {Array<CFGParser>} data structure holding parse trees
 */
InputCorpus.prototype.genParseTree = function() {
    return this.corpus.map(function(sen) {
        return new CFGParser(sen);
    });
};

module.exports = InputCorpus;
