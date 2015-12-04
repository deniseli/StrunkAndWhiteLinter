"use strict";

/**
 * Provides access to a list of binary rules for CFG (context free grammar)
 * parsing.
 */
var CFGRules = {};

/**
 * @param {String} POS tag from Penn Treebank
 * @return {String} POS tag supported by this file
 */
CFGRules.translate = function(pos) {
    var labels = []
    for (var parent in translations) {
        if (translations[parent].indexOf(pos) != -1) {
            labels.push(parent);
        }
    }
    if (labels.length == 0) {
        console.warn("Unsupported POS tag: " + pos);
    }
    return labels;
};

/**
 * @param {String} left_label: label of left child for binary rule
 * @param {String} right_label: label of right child for binary rule
 * @return {Object} rule
 */
CFGRules.get = function(left_label, right_label) {
    return rules[toKey(left_label, right_label)];
};

/**
 * Forms a valid JS key from the two input strings
 */
var toKey = function(left_label, right_label) {
    return left_label + "," + right_label;
};

/**
 * Mapping from this file's label space to the Penn Treebank's label space.
 * Relationships should be one-to-many, not many-to-many.
 */
var translations = {
    "NP" : ["NN", "NNS", "NNP", "NNPS", "VBG", "PRP", "WP"],
    "VP" : ["VB", "VBD", "VBN", "VBP", "VBZ", "MD", "IN"],
    "VB" : ["VB"],
    "JJ" : ["JJ", "JJR", "JJS", "MD", "PRP$", "WP$"],
    "DT" : ["DT"],
    "RB" : ["RB", "RBR", "RBS", "WRB"],
    "WP" : ["WP"],
    "CC" : ["CC"],
    "IN" : ["IN"],
    "." : [".", "!"],
    "COMMA" : [","],
    "S" : ["UH"]
};

/** Inverse mapping for binary rules */
var rules = {
    // Whole sentence
    "S,." : "TOP",
    "VP,." : "TOP",

    // Complex subsentence
    "COMMA,CC" : "CC_phrase",
    "CC_phrase,S" : "compound_piece",
    "S,compound_piece" : "S",

    // Independent clauses
    "NP,VP" : "S",
    "WP,S" : "S",
    "S,NP" : "S",

    // Noun phrase chunking (relatively complete)
    "DT,NP" : "NP",
    "JJ,NP" : "NP",
    "NP,NP" : "NP",
    "PP,NP" : "NP",
    "TO,VB" : "NP",

    // Verb phrase chunking (relatively complete)
    "VP,NP" : "VP",
    "VP,JJ" : "VP",
    "RB,VP" : "VP",
    "VP,RB" : "VP",
};

module.exports = CFGRules;
