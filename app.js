var $ = require("jquery");

var CorpusViewer = require("./js/CorpusViewer.js");
var InputCorpus = require("./js/InputCorpus.js");
var Validator = require("./js/Validator.js");

var DICT_URL = "http://localhost:8000/top100kWords.txt";
var IN_SELECTOR = "#input";
var SUBMIT_SELECTOR = "#checkInput";

/** Click handler for submit */
var submit = function() {
    CorpusViewer.renderLoadingDivs();
    $.get(DICT_URL, function(text) {
        var words = text.split("\n");
        var dictionary = {};
        words.forEach(function(maybeWord) {
            if (maybeWord[0] !== "#") {
                dictionary[maybeWord] = true;
            }
        });
        var inputCorpus = new InputCorpus(getInputValue());
        var validator = new Validator(inputCorpus, dictionary);
        validator.runAll();
        CorpusViewer.render(inputCorpus);
    });
};

/** @return {String} value of input textarea */
var getInputValue = function() {
    return $(IN_SELECTOR)[0].value;
};

/** main */
$(SUBMIT_SELECTOR).click(submit);
