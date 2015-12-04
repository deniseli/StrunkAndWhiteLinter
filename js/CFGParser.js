"use strict";

var CFGRules = require("./CFGRules.js");

/**
 * @constructor
 * Builds a parse tree for a CFG (context free grammar) using the CKY algorithm
 * @param {Array<Object>} sentence: list of word objects
 */
var CFGParser = function(sentence) {
    this.chart = new Chart(sentence.length);
    this.populateLeafNodes(sentence);
    this.populateInternalNodes();
};

/** Prints out the tree from its root */
CFGParser.prototype.toString = function() {
    return this.chart.getRoot().toString();
};

/**
 * @param {int} i: lower boundary inclusive for parse tree
 * @param {int} j: upper boundary inclusive for parse tree
 * @return {Array<String>}
 *   list of labels for the ith - jth words in the input sentence
 */
CFGParser.prototype.getLabels = function(i, j) {
    var cell = this.chart.getCell(i, j);
    return Object.keys(cell.items);
};

/**
 * @param {int} i: lower boundary inclusive for parse tree
 * @param {int} j: upper boundary inclusive for parse tree
 * @param {String} label: the label to match
 * @return {boolean}
 */
CFGParser.prototype.hasLabel = function(i, j, label) {
    return this.getLabels(i, j).indexOf(label) !== -1;
};

/** @return {Array<String>} the labels of the two topmost children */
CFGParser.prototype.getPrimaryStructure = function() {
    var root = this.chart.getRoot();
    if (!root) {
        return;
    }
    var primaryChildren = root.children[0].children;
    if (primaryChildren.length === 0) {
        return;
    }
    return [primaryChildren[0].label, primaryChildren[1].label];
};

/**
 * Fill the diagonal of the chart with the POS for each word
 * @param {Array<Object>} sentence: list of word objects
 */
CFGParser.prototype.populateLeafNodes = function(sentence) {
    for (var i = 0; i < sentence.length; i++) {
        var word = sentence[i];
        var cell = this.chart.getCell(i, i);
        var translations = CFGRules.translate(word.pos);
        translations.forEach(function(label) {
            cell.addItem(new Item(label, []));
        });
    }
};

/** Builds the parse tree up from the leaf nodes */
CFGParser.prototype.populateInternalNodes = function() {
    var N = this.chart.N;
    for (var offset = 1; offset < N; offset++) {
        for (var j = offset; j < N; j++) {
            this.fillCell(j - offset, j);
        }
    }
};

/**
 * Fill one cell of the chart by considering each binary split
 *   sen[i]...sen[k] | sen[k+1]...sen[j]
 */
CFGParser.prototype.fillCell = function(i, j) {
    var cell = this.chart.getCell(i, j);
    for (var k = i; k < j; k++) {
        var left_cell = this.chart.getCell(i, k);
        var right_cell = this.chart.getCell(k+1, j);
        this.checkCellSplit(cell, left_cell.items, right_cell.items);
    }
};

/** Consider a binary split of a cell between the two child cells */
CFGParser.prototype.checkCellSplit = function(cell, left_items, right_items) {
    for (var left_label in left_items) {
        for (var right_label in right_items) {
            var left_item = left_items[left_label];
            var right_item = right_items[right_label];
            var rule = CFGRules.get(left_label, right_label);
            if (rule) {
                var children = [left_item, right_item];
                cell.addItem(new Item(rule, children));
            }
        }
    }
};


/**
 * @constructor
 * Stores the upper triangular dynamic programming trellis used in the CKY
 * parsing algorithm for parsing CFGs.
 * @param {int} N: length of sentence
 */
var Chart = function(N) {
    this.N = N;
    this.chart = new Array(this.N);
    for (var i = 0; i < this.N; i++) {
        this.chart[i] = new Array(this.N);
        for (var j = 0; j < this.N; j++) {
            this.chart[i][j] = new Cell();
        }
    }
};

/** Get "TOP" item from the root node */
Chart.prototype.getRoot = function() {
    if (this.N > 0) {
        return this.getCell(0, this.N - 1).getItem("TOP");
    }
};

/**
 * @param {int} i: lower boundary for parse tree
 * @param {int} j: upper boundary for parse tree
 * @return {Cell}:
 *   the cell holding the parse tree nodes for sentence[i]...sentence[j]
 */
Chart.prototype.getCell = function(i, j) {
    return this.chart[i][j];
};


/**
 * @constructor
 * Stores all the parse tree nodes that share a common span
 */
var Cell = function() {
    this.items = {};
};

Cell.prototype.addItem = function(item) {
    this.items[item.label] = item;
};

Cell.prototype.getItem = function(label) {
    if (label in this.items) {
        return this.items[label];
    }
};


/**
 * @constructor
 * Stores the value of a node in a parse tree
 * @param {String} label: chunk name
 * @param {Array<Item>} children: back pointers
 */
var Item = function(label, children) {
    this.label = label;
    this.children = children;
};

Item.prototype.toString = function() {
    if (this.children.length === 0) {
        return "[" + this.label + "]";
    }
    var str = "( " + this.label + " ";
    this.children.forEach(function(child) {
        str += child.toString() + " ";
    });
    return str + ")";
};


module.exports = CFGParser;
