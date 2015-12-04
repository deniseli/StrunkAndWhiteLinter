import os

def get_pathname(name, use_orig):
    """Returns the absolute path to the file"""
    dir = "/../orig_books/" if use_orig else "/../books/"
    return os.getcwd() + dir + name + ".txt";

def should_remove(line):
    """Returns whether the line should be removed"""
    text = line.strip()
    lines_to_remove = ["*  *  *  *  *", "*****", "CHARLOTTE'S WEB", "THE END", "Wuthering Heights"]
    if text in lines_to_remove:
        return True
    if is_chapter_title(text):
        return True
    if is_page_number(text):
        return True
    if has_chinese(text):
        return True
    return False

def is_chapter_title(text):
    """Returns whether the line is a chapter title"""
    if text.startswith("Chapter"):
        return True
    if text.startswith("CHAPTER"):
        return True
    if is_numeric_chapter_title(text):
        return True
    return False

def is_numeric_chapter_title(text):
    """Returns whether the line is a roman numeral chapter title"""
    split = text.split(".")
    if len(split) != 2:
        return False
    for c in split[0]:
        if c not in ["I", "V", "X"]:
            return False
    return True

def is_page_number(text):
    """Returns whether the text is a page number"""
    if is_number(text):
        return True
    if is_of_style_page_number(text):
        return True
    return False

def is_number(text):
    """Returns whether the text is a number"""
    try:
        int(text)
        return True
    except ValueError:
        return False

def is_of_style_page_number(text):
    """Returns whether the text is in format INT of INT"""
    split = text.split(" ")
    if len(split) != 3:
        return False
    return is_number(split[0]) and split[1] == "of" and is_number(split[2])

def has_chinese(text):
    """Returns whether the text contains one of two chinese characters that
    occur in some original texts"""
    split = text.split(" ")
    if len(split) > 1 and len(split[1]) > 0:
        if ord(split[1][0]) == 229 or ord(split[1][0]) == 230:
            return True
    return False

def write_to_file(name, corpus):
    """Writes the corpus to a file with name"""
    file = open(get_pathname(name, False), "w")
    file.write(corpus)
    file.close()

def ends_in_sentence_end(line):
    """Checks if the input string ends in a logical sentence ending"""
    return len(line) > 0 and line[-1] in ["\"", ".", "!", "?"]

if __name__ == "__main__":
    name = "Wuthering_Heights"
    with open(get_pathname(name, True)) as f:
        content = f.readlines()

    corpus = ""
    length_limit = 50000
    for line in content:
        if len(corpus) > length_limit:
            break
        if should_remove(line):
            continue
        elif line != "\n":
            corpus += line.strip() + " "
        if ends_in_sentence_end(line.strip()):
            if corpus[-1] == " ":
                corpus = corpus[:-1]
            corpus += "\n\n"

    write_to_file(name, corpus)
