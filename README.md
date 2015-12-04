# Strunk and White Linter

## Purpose and Disclaimer
This is a style linter for **formal, English, writing style**, which applies Strunk and White's rules to input text.
Note that is is **only** built for checking **style**, not grammatical correctness. In fact, it expects input to already be grammatically correct, spelled correctly, etc.


## Dependency Issues
We use the "pos" npm module for part of speech tagging, which is not as accurate as it could be. As a result, we get a fair number of errors piggy-backing off of that.


## Try it out!
The following text triggers the inline warnings currently supported:

`
My dog' name is Doug! He's a feisty one. We brought him home on 1, January 1999. Our older dog died on 08/09/98. Doug's foot-prints are as big or bigger than your dog's.
I can't speak as to whether he's house trained as yet, but he has pooped in my yard, your yard and the park (where we walk). Some cats are big, and some dogs are small. Railroads are long, and some roads are short. Cats are felines, but boats are big.
`

Then, try validating "Hello!" to see the overall metric range errors. You should be able to see "Your Text" in the scatter plot in both cases.
