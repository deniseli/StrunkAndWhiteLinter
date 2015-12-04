"use strict";

var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var MATCH_ANY = "*";

/**
 * Functions that run context dependent style checks and append discovered
 * errors to the word objects in the corpus
 */
module.exports = {

    /**
     * Form the possessive singular of nouns by adding 's.
     * Known bug: NN currently covers both singular nouns and mass nouns, so
     * this check will over-report.
     */
    singularPossessive: function() {
        var singNounTags = ["NN", "NNP"];
        this.corpus.corpus.forEach(function(sen) {
            for (var i = 0; i < sen.length - 2; i++) {
                if (singNounTags.indexOf(sen[i].pos) !== -1 &&
                    sen[i+1].word === "'" &&
                    sen[i+2].word !== "s") {
                    sen[i].errs.push("Form the possessive singular of nouns" +
                                     " by adding 's.");
                }
            }
        });
    },

    /**
     * Do not use expressions "as _ or _ than", such as "as good or better
     * than".
     */
    asXOrYThan: function() {
        var adjTags = ["JJ", "JJR", "JJS"];
        this.corpus.corpus.forEach(function(sen) {
            for (var i = 0; i < sen.length - 4; i++) {
                if (sen[i].word === "as" &&
                    adjTags.indexOf(sen[i+1].pos) != -1 &&
                    sen[i+2].word === "or" &&
                    adjTags.indexOf(sen[i+3].pos) != -1 &&
                    sen[i+4].word === "than") {
                    sen[i].errs.push("Expressions of this type should be" +
                        " corrected by rearranging the sentences. e.g. \"My" +
                        " opinion is as good or better than his.\" -> \"My" +
                        " opinion is as good as his, if not better.\"");
                }
            }
        });
    },

    /** Use just "whether" in place of "as to whether". */
    asToWhether: function() {
        this.corpus.corpus.forEach(function(sen) {
            for (var i = 0; i < sen.length - 2; i++) {
                if ((sen[i].word === "as" || sen[i].word === "As") &&
                    sen[i+1].word === "to" &&
                    sen[i+2].word === "whether") {
                    sen[i].errs.push("Do not use \"as to whether.\"" +
                                      " \"Whether\" is sufficient.");
                }
            }
        });
    },

    /** Yet is always nearly as good, if not better than, "as yet". */
    asYet: function() {
        this.corpus.corpus.forEach(function(sen) {
            for (var i = 0; i < sen.length - 1; i++) {
                if ((sen[i].word === "as" || sen[i].word === "As") &&
                    sen[i+1].word === "yet") {
                    sen[i].errs.push("Do not use \"as yet.\" \"Yet\" nearly" +
                                     " always is as good, if not better.");
                }
            }
        });
    },

    /**
     * Oxford comma
     * Detect incorrect comma usage in the form X, X CC X where X is some label
     * Known (unavoidable) issue: The oxford comma is necessary due to the
     *   structural ambiguity that would otherwise arise, so this check will
     *   over report.
     */
    oxfordComma: function() {
        var err = "In a series of three or more terms with a single" +
            " conjunction, use a comma after each term except the last.";
        for (var i in this.corpus.corpus) {
            var sen = this.corpus.corpus[i];
            var parsedSen = this.corpus.parsed[i];

            // Determine if sentence could have form X, X CC X
            var indices = hasXCommaYCCZPattern(sen);
            if (!indices) continue;

            // Check for X's
            var comma1 = indices[0];
            var comma2 = indices[1];
            var cc = indices[2];
            var possibLabels = parsedSen.getLabels(comma2 + 1, cc - 1);
            possibLabels.forEach(function(label) {
                errCheckXCommaXCCXPattern(label, comma1, comma2, cc, parsedSen, sen, err);
            });
        }
    },

    /**
     * Ensures dates have the correct comma structure.
     * Correct usage examples:
     *   Month D/DD, YYYY
     *   D/DD Month YYYY
     * Incorrect usage:
     *   Any of the correct examples but with incorrect comma placement
     *   MM/DD/YY
     *   MM/DD/YYYY
     *   DD/MM/YY
     *   DD/MM/YYYY
     */
    dateFormat: function() {
        var err = "You should write dates as 'January 1, 2000' or '1 January 2000'.";
        this.corpus.corpus.forEach(function(sen) {
            for (var i = 0; i < sen.length - 4; i++) {
                if (hasSlashDatePattern(sen.slice(i, i + 5))) {
                    sen[i].errs.push(err);
                }
            }
            for (var i = 0; i < sen.length - 2; i++) {
                if (sen[i].errs.indexOf(err) !== -1) {
                    continue;
                }
                if (hasWrongMonthDDDatePattern(sen.slice(i)) ||
                    hasWrongDDMonthDatePattern(sen.slice(i))) {
                    sen[i].errs.push(err);
                }
            }
        });
    },

    /** Checks for known phrases with needless words */
    omitNeedlessWords: function() {
        var phraseReplacements = [
            {
                bad: ["the", "question", "as", "to", "whether"],
                good: ["whether"]
            },
            {
                bad: ["there", "is", "no", "doubt", "but", "that"],
                good: ["doubtless"]
            },
            {
                bad: ["for", MATCH_ANY, "purposes"],
                good: ["for", MATCH_ANY]
            },
            {
                bad: ["in", "a", MATCH_ANY, "manner"],
                good: ["ADV(" + MATCH_ANY + ")"]
            },
            {
                bad: ["this", "is", "a", MATCH_ANY, "that"],
                good: ["this", MATCH_ANY]
            },
            {
                bad: ["a", MATCH_ANY, "one"],
                good: [MATCH_ANY]
            },
            {
                bad: ["the", "reason", "why", "is", "that"],
                good: ["because"]
            },
            {
                bad: ["enters", "in"],
                good: ["enters"]
            },
        ];
        this.corpus.corpus.forEach(function(sen) {
            for (var i = 0; i < phraseReplacements.length; i++) {
                var bad = phraseReplacements[i].bad;
                var good = phraseReplacements[i].good;
                var badIndex = indexOfPhrase(sen, bad);
                if (badIndex !== -1) {
                    addErrorToWords(sen.slice(badIndex, badIndex + bad.length),
                                    genNeedlessWordsError(bad, good));
                }
            }
        });
    },

    /**
     * Avoid a succession of loose sentences.
     * This rule refers especially to loose sentences of a particular type:
     * those consisting of two clauses, the second introduced by a conjunction
     * or relative.
     * This function finds clusters of 3 or more of these sentences and adds an
     * error to the first word of each.
     */
    looseSentences: function() {
        var threshold = 3;
        var beginLoose = -1;
        var looseStructure = ["S", "compound_piece"];
        for (var i = 0; i < this.corpus.parsed.length; i++) {
            if (this.corpus.corpus[i].length < threshold) continue;
            var primaryStructure = this.corpus.parsed[i].getPrimaryStructure();
            if (primaryStructure && arraysEqual(looseStructure, primaryStructure)) {
                if (beginLoose === -1) {
                    beginLoose = i;
                }
            } else {
                addLooseErrorIfCond(beginLoose, i, threshold, this.corpus.corpus);
                beginLoose = -1;
            }
        }
        addLooseErrorIfCond(beginLoose, i, threshold, this.corpus.corpus);
    },

};

var addErrorToWords = function(words, error) {
    for (var i = 0; i < words.length; i++) {
        words[i].errs.push(error);
    }
};

/**
 * Checks if a sentence has form X, Y CC Z
 * @param {Array<Object>} sen
 * @return {Array<int>} indices of [priorComma, commma, CC], or undefined if not found
 */
var hasXCommaYCCZPattern = function(sen) {
    if (sen.length < 6) return;
    var foundComma = false;
    var commaIdx1 = -1;
    var commaIdx2 = -1;
    for (var i = 1; i < sen.length - 1; i++) {
        if (!foundComma) {
            foundComma = sen[i].pos === ",";
            if (foundComma) {
                commaIdx2 = i;
                i++;
            }
        } else {
            if (sen[i].pos === ",") {
                commaIdx1 = commaIdx2;
                commaIdx2 = i;
            } else if (sen[i].pos === "CC") {
                return [commaIdx1, commaIdx2, i];
            }
        }
    }
};

/**
 * Given that a sentence has the X, X CC X pattern, 
 * @param {String} label: what X could hypothetically equal
 * @param {int} comma1: index of second to last comma in sentence, which sets our lower bound
 * @param {int} comma2: index of last comma in sentence
 * @param {int} cc: index of CC in sentence
 * @param {CFGParser} parsedSen
 * @param {Array<Object>} sen
 * @param {String} err: the error to add
 */
var errCheckXCommaXCCXPattern = function(label, comma1, comma2, cc, parsedSen, sen, err) {
    // Check from after CC
    var shared = false;
    for (var i = cc + 1; i < sen.length; i++) {
        shared = parsedSen.hasLabel(cc + 1, i, label);
        if (shared) break;
    }
    // Check from before comma
    if (shared) {
        for (var i = comma2 - 1; i >= comma1 + 1; i--) {
            if (parsedSen.hasLabel(i, comma2 - 1, label) &&
                sen[cc].errs.indexOf(err) == -1) {
                sen[cc].errs.push(err);
            }
        }
    }
};


/**
 * Checks if a sequence of word tokens has form MM/DD/YY or DD/MM/YY where
 *   MM is an integer in range [1..12]
 *   DD is an integer in range [1..31]
 *   YY is a 2 or 4 digit positive number
 * @param {Array<Object>} maybeDate
 * @return {boolean} whether the maybeDate is a date in the above form
 */
var hasSlashDatePattern = function(maybeDate) {
    return hasSlashDateStructure(maybeDate) && hasSlashDateValues(maybeDate);
};

/** Validate structure of slash date pattern */
var hasSlashDateStructure = function(maybeDate) {
    if (maybeDate.length != 5) {
        return false;
    }
    if (maybeDate[1].word !== "/" || maybeDate[3].word !== "/") {
        return false;
    }
    if (maybeDate[4].word.length !== 2 && maybeDate[4].word.length != 4) {
        return false;
    }
    return true;
};

/** Validate values of slash date pattern */
var hasSlashDateValues = function(maybeDate) {
    var left = parseInt(maybeDate[0].word);
    var mid = parseInt(maybeDate[2].word);
    var right = parseInt(maybeDate[4].word);
    if (isNaN(left) || isNaN(mid) || isNaN(right)) {
        return false;
    }
    if (left < 1 || mid < 1 || right < 0) {
        return false;
    }
    if (left > 31 || mid > 31) {
        return false;
    } // left and mid beyond this point are <= 31
    if (left > 12 && mid > 12) {
        return false;
    }
    return true;
};

var isMonth = function(maybeMonth) {
    return MONTHS.indexOf(maybeMonth) !== -1;
};

var isDay = function(maybeDay) {
    var asNum = parseInt(maybeDay);
    return !isNaN(asNum) && asNum > 0 && asNum <= 31;
};

var isYear = function(maybeYear) {
    var asNum = parseInt(maybeYear);
    return !isNaN(asNum) && asNum >= 1000 && asNum < 10000;
};

/**
 * Checks if a sequence of word tokens has form Month DD, YYYY with different
 * (incorrect) comma placement
 *   DD is an integer in range [1..31]
 *   YY is a 4 digit positive number
 * @param {Array<Object>} maybeDate
 * @return {boolean} whether maybeDate is incorrectly in MM DD, YYYY form
 */
var hasWrongMonthDDDatePattern = function(maybeDate) {
    var patternIsCorrect = function(dayIdx, yearIdx) {
        return dayIdx === 1 && maybeDate[2].word === "," && yearIdx === 3;
    };
    return hasAXBXCWordPattern(maybeDate, isMonth, isDay, isYear, patternIsCorrect);
};

/**
 * Checks if a sequence of word tokens has form DD Month YYYY with different
 * (incorrect) comma placement
 *   DD is an integer in range [1..31]
 *   YY is a 4 digit positive number
 * @param {Array<Object>} maybeDate
 * @return {boolean} whether maybeDate is incorrectly in MM DD, YYYY form
 */
var hasWrongDDMonthDatePattern = function(maybeDate) {
    var patternIsCorrect = function(monthIdx, yearIdx) {
        return monthIdx === 1 && yearIdx === 2;
    };
    return hasAXBXCWordPattern(maybeDate, isDay, isMonth, isYear, patternIsCorrect);
};

/**
 * Check if maybePattern is in format:
 * [validated by checkA] [0-1 chars] [validated by checkB] [0-1 chars] [validated by checkC]
 * @param {Array<Object>} maybePattern
 * @param {boolean func(String)} checkA, checkB, checkC
 * @param {boolean func(int, int)} checkCorrect
 */
var hasAXBXCWordPattern = function(maybePattern, checkA, checkB, checkC, checkCorrect) {
    if (!checkA(maybePattern[0].word)) {
        return false;
    }
    var firstBIdx = -1;
    var firstCIdx = -1;
    for (var i = 1; i < maybePattern.length; i++) {
        var asNum = parseInt(maybePattern[i].word);
        if (firstBIdx === -1 && checkB(maybePattern[i].word)) {
            firstBIdx = i;
        } else if (firstCIdx === -1 && checkC(maybePattern[i].word)) {
            firstCIdx = i;
            break;
        }
    }
    if (firstBIdx === -1 || firstCIdx === -1 || firstCIdx < firstBIdx) {
        return false;
    }
    if (firstBIdx > 2 || firstCIdx - firstBIdx > 2) {
        return false;
    }
    if (checkCorrect(firstBIdx, firstCIdx)) {
        return false;
    }
    return true;
};

/** Return the correct error message for needless words */
var genNeedlessWordsError = function(badPhrase, goodPhrase) {
    return "Vigorous writing is concise. Omit needless words by replacing \"" +
        badPhrase.join(" ") + "\" with \"" + goodPhrase.join(" ") + "\".";
};

/** Returns starting index of phrase in sen, or -1 if not found */
var indexOfPhrase = function(sen, phrase) {
    for (var i = 0; i < sen.length - phrase.length + 1; i++) {
        var senToPhrase = sen.slice(i, i + phrase.length).map(function(word) {
            return word.word;
        });
        if (arraysEqual(senToPhrase, phrase, true)) {
            return i;
        }
    }
    return -1;
};

/** 
  * @param {Array<String>} arr1
  * @param {Array<String>} arr2
  * @param {boolean} allowCapitalization
  * @return {boolean} whether arr1 == arr2
  */
var arraysEqual = function(arr1, arr2, allowCapitalization) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] === MATCH_ANY || arr2[i] === MATCH_ANY) {
            continue;
        }
        if (i === 0 && allowCapitalization) {
            if (arr1[i] !== arr2[i] &&
                capitalizeFirstLetter(arr1[i]) !== arr2[i] &&
                capitalizeFirstLetter(arr2[i]) !== arr1[i]) {
                return false;
            }
        } else if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
};

var capitalizeFirstLetter = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * @param {int} beginLoose: index of the first loose sentence
 * @param {int} endLoose: index after last loose sentence (exclusive range)
 * @param {int} threshold: minimum number of loose sentences in a row to trigger
 *   error
 * @param {Array<Object>}: array of sentences with word errors
 */
var addLooseErrorIfCond = function(beginLoose, endLoose, threshold, corpus) {
    if (beginLoose !== -1 && endLoose - beginLoose >= threshold) {
        var firstWords = corpus.slice(beginLoose, endLoose).map(function(sen) {
            return sen[0];
        });
        addErrorToWords(firstWords, "Avoid a succession of loose sentences.");
    }
};
