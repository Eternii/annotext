/* ******************************************************************** *
 *                                Set-up                                *
 * ******************************************************************** */

var matches = {};
var definitions = {};
var phrases = {};
var text;                       // Editing only. Used by CKEditor plugins.
var multiphrase;                // Editing only. Used by CKEditor plugins.

/* Name:         setGlossary
 * Called by:    show.js.erb (Texts controller)
 * Parameters:   match  - Hash: match["word"]   = [Array of definition IDs]
 *               defin  - Hash: defin[Def. ID]  = [Term, Lex Class, Definition]
 *               phrase - Hash: phrase[Phr. ID] = [Term, Definition]
 * Returns:      Nothing. (Sets globals.)
 * Explanation:
 *   Used to setup global match, definition, and phrase hashes. The match hash
 * contains definition ID(s). (Old data may contain more than one definition ID
 * per match, so match definitions are given in an array.) The phrase hash is
 * self-contained. Once loaded, the user will not need to hit the server again
 * when viewing a particular text.
 */
function setGlossary(match, defin, phrase) {
  matches = match;
  definitions = defin;
  phrases = phrase;
}


/* Name:         setGlossary
 * Called by:    edit.js.erb (Texts controller)
 * Parameters:   num    - Text number.
 * Returns:      Nothing. (Sets globals.)
 * Explanation:
 *   Used to set the text id for the text that is being edited. This is used
 * by several of the CKEditor plugins when sending AJAX requests to the server.
 * Also, ensures the value of the multiphrase id is null. This is used by the
 * multiword expression plugins (multistart and multicont) to create phrases
 * across multiple words.
 */
function setTextId(num) {
  text = num;
  multiphrase = '';
}



/* ******************************************************************** *
 *                               Viewing                                *
 * ******************************************************************** */

/* Name:          N/A ("mouseup" function on "#text-display")
 * Called by:     Clicking the text displayed by the Text's controller's show.
 * Parameters:    N/A
 * Returns:       Nothing. (Delegates printing to the screen.)
 * Explanation:
 *   Called when the user clicks the text_display div, which holds the text
 * that the user is reading. This is function isolates the location clicked
 * before passing the work off to a function to decide the correct way to
 * look up the translation for the text that was clicked.
 */
$(document).on("mouseup", "#text-display", function() {
  if (window.getSelection) {
    var selRange = window.getSelection();
    var node = selRange.focusNode;

    delegateMethod(selRange, node);
  }
});


/* Name:          delegateMethod
 * Called by:     "mouseup" function on "#text-display"
 * Parameters:    selRange -  The clicked location in the DOM.
 *                node     -  DOM node that was clicked.
 * Returns:       Nothing. (Delegates printing to the screen.)
 * Explanation:
 *   When the user clicks in the text_display div, this function checks whether
 * a phrase, lemma, or word was clicked. The correct translation is then
 * retrieved from either the phrases hash or the matches/definitions hashes 
 * based upon what was clicked. Both phrases and lemmas are stored within span
 * elements within the text. A phrase (class="phrase") stores a numeric id 
 * within its span's "phrase" attribute. This numeric id is used to find the
 * translation for that phrase within the phrases hash. A lemma (class="alt") 
 * stores a word within its span's "match" attribute. This word is used to look
 * up the definition to display the user from the matches hash. Likewise, a
 * plain word (that is, a word not not within a phrase or lemma span) is to be
 * isolated and used to lookup a translation via the text's match hash.
*/
function delegateMethod(selRange, node) {
  var phrase = $(node).closest(".phrase").attr('phrase');
  if (phrase) { displayPhrase(phrase); return; } 

  var match = $(node).closest(".alt").attr('match');
  if (match) { displayMatch(match.toLowerCase()); return } // !!! On conversion

  if (node) { displayMatch(getClickedWord(selRange, node)); }  // Plain word
}


/* Name:          displayPhrase
 * Called by:     delegateMethod
 * Parameters:    id - Phrase ID, from phrase of class "phrase"
 * Returns:       Nothing. (Prints to screen.)
 * Explanation:
 *   Given a phrase id (which only come from phrases of class "phrase"), this
 * function looks up the id in the phrases hash. Presuming that the phrase is
 * present in the hash, it is printed into the viewing header with formatting
 * of the form:
 *     <b>Term</b>Definition
 */
function displayPhrase(id) {
  if (id != null) {
    var phrase = phrases[id];

    if (phrase != null)
      document.getElementById("translation-box").innerHTML =
                                    "<b>" + phrase[0] + "</b> " + phrase[1];
  }
}


/* Name:          displayMatch
 * Called by:     delegateMethod
 * Parameters:    word - Word (or word from alt phrase) clicked on by the user.
 * Returns:       Nothing. (Prints to screen.)
 * Explanation:
 *   Called to display definitions. It first retrieves the definitions to
 * display for the clicked word or alt-phrase. Once these are acquired, it
 * prints them into the viewing header with formatting of the form:
 *     <b>Term</b><i>Lexigraphical Class</i>Definition<br>
 * Multiple definitions are printed on seperate lines, if required.
 */
function displayMatch(word) {
  if (word != null) {
    var m = getMatch(word);

    if (m != null) {
      var str = '';
      Object.keys(m).forEach(function (key) {
        str = str.concat("<b>" + m[key][0] + "</b> " 
                         + (m[key][1] ? "<i>" + m[key][1] + "</i> " : "") 
                         +  m[key][2] + "<br>");
      });

      if (str != '')
        document.getElementById("translation-box").innerHTML = str;
    }
  }
}


/* Name:          getMatch
 * Called by:     displayMatch
 * Parameters:    word - Word (or word from alt phrase) clicked on by the user.
 * Returns:       hash[definition id] = [def_term, def_lex, def_definition]
 * Explanation:
 *   Given a word, this function retrieves the glossary matches that it can
 * find for it. The search looks for both exact matches and wildcard matches.
 * Wildcard matches are searched for by appending "*" to the end of the word
 * and looking for a hit, repeating the process by dropping letters one by
 * one (e.g. word* -> wor* -> wo*, etc). Because some of the old data contains
 * duplications and multiple hits for certain words, more than one glossay
 * match may be retrieved (the function does not quit when one hit occurs).
 * Furthermore, we may have multiple matches for the exact same string, so
 * we use a seperate function to sort through the hits.
 */
function getMatch(word) {
  var m = {}

  if (word != null) {
    getAllDefinitions(m, matches[word]);

    for (var i=word.length; i>0;i--)
      getAllDefinitions(m, matches[word.slice(0,i)+"*"]);
  }
  return m;
}


/* Name:          getAllDefinitions
 * Called by:     getMatch
 * Parameters:    m      - Hash of definition matches.
 *                def_id - Array of Definition Id(s) from the matches hash.
 * Returns:       Nothing. Duplicate matches are added to m.
 * Explanation:
 *   Some of the old Annotext data contains multiple nodes for the same string,
 * so this function tries to find the multiple definitions that would have
 * been displayed in past versions of the application. In converting the old
 * data into Rails data, duplicate strings were added to the database. Thus,
 * data on the server may have multiple definitions for a given match. For
 * example, "ihr" might match two definitions, 123 and 124. Because of this
 * bad data (which is very time consuming to fix), the matches array sends
 * matches in the form of matches["word"] = [Array of definition ids]. This
 * function loops through those ids and add them to the m array.
 */
function getAllDefinitions(m, def_id) {
  if (def_id != null) {
    for (var j=0; j<def_id.length; j++)
      m[def_id[j]] = definitions[def_id[j]]
  }
}


/* Name:          getClickedWord
 * Called by:     delegateMethod
 * Parameters:    selRange -  The clicked location in the DOM.
 *                node     -  DOM node that was clicked.
 * Returns:       word (word that was clicked on, without punctuation, etc.)
 * Explanation:
 *   Retrieves DOM node information for a mouse click. Given the node that was
 * clicked, it gets the string contained therein, and finds the location in
 * string that was clicked. This information is used by isolateWord to find
 * the word that Annotext will look up.
 */
function getClickedWord(selRange, node) {
  var nodeText = document.createRange();
  nodeText.selectNode(node);

  var str = nodeText.toString();
  var loc = selRange.focusOffset;

  return isolateWord(str,loc);
}


/* Name:         isolateWord
 * Called by:    getClickedWord, selectword (CKEditor plugin)
 * Parameters:   str - Text from the DOM node that was clicked.
 *               loc - Location in the DOM node where the click occured.
 * Returns:      word (word clicked on, without punctuation, lowercase, etc.)
 * Citation:     Derived mostly from getClickedWord in Annotext 3.0 global.js
 * Explanation:
 *   Takes the text contained in a DOM node and the point in the node where it
 * was clicked. With this information, the function finds the carriage return
 * and/or spaces surrounding the word to isolate the word. Following this,
 * a number of characters (see "pattern" below) are stripped from the string,
 * resulting in the word that Annotext should look up. Finally, the word is
 * converted to lowercase, as all glossary matches are stored lowercase.
 */
function isolateWord(str, loc) {
  var word = '';
  var sec1 = str.slice(0, loc);
  var sec2 = str.slice(loc);

  var j1 = sec1.lastIndexOf(' ');
  var j2 = sec1.lastIndexOf('\n');
  var j = (j1<0 ? j2 : (j2<0 ? j1 : (j1>j2 ? j1 : j2)));

  var i1 = sec2.indexOf(' ');
  var i2 = sec2.indexOf('\n');
  var i = (i1<0 ? i2 : (i2<0 ? i1 : (i1<i2 ? i1 : i2)));

  if (j >= 0)
    word = sec1.slice(j+1);
  else
    word = sec1;

  if (i >= 0)
    word += sec2.slice(0,i);
  else
    word += sec2;

  // Clear out any remaining whitespace surrounding the word
  var pattern = /^[\s\xa0]+|[\s\xa0]+$/g;  // \xa0 = unicode non-breaking space
  word = word.replace(pattern,"");

  // Remove any punctionation surrounding the word
  // List derived from NON_WORD_CHARS array in Annotext 3.0
  pattern = /^[.,!?:;\/|\\'"()\[\]-]+|[.,!?:;\/|\\'"()\[\]-]+$/g;
  word = word.replace(pattern,"");
  
  word = word.toLowerCase();

  return word;
}


/* ******************************************************************** *
 *                               Editing                                *
 * ******************************************************************** */

