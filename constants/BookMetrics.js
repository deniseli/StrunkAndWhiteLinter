"use strict";

/**
 * Cached metric values for all the books in the cleaned books directory. We do
 * not recalculate large corpus metrics on the fly.
 * Keys should match keys in Metrics.js
 */
module.exports = {
    exclamations: {
        "A Modest Proposal" : 0.014925373134328358,
        "A Tale of Two Cities" : 0.1396761133603239,
        "The Call of the Wild" : 0.012658227848101266,
        "Charlotte's Web" : 0.09631147540983606,
        "Fight Club" : 0.0,
        "Huckleberry Finn" : 0.02355072463768116,
        "The Great Gatsby" : 0.019704433497536946,
        "The Hobbit" : 0.1958762886597938,
        "Wuthering Heights" : 0.1865079365079365
    },
    avgParagraphLength: {
        "A Modest Proposal" : 2.0303030303030303,
        "A Tale of Two Cities" : 5.428571428571429,
        "The Call of the Wild" : 4.471698113207547,
        "Charlotte's Web" : 4.153846153846154,
        "Fight Club" : 2.0380710659898478,
        "Huckleberry Finn" : 6.065934065934066,
        "The Great Gatsby" : 4.951219512195122,
        "The Hobbit" : 5.762376237623762,
        "Wuthering Heights" : 4.893203883495145
    }
};
