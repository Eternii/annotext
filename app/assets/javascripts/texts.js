/* ******************************************************************** *
 *                                Set-up                                *
 * ******************************************************************** */

var text                        // !!! Can be moved to editing. Remove below.
var matches = {};
var definitions = {};
var phrases = {};

/* Name:         setGlossary
 * Called by:    show.js.erb (Texts controller)
 * Parameters:   num    - Text number.
 *               match  - Hash: match["word"]   = [Array of definition IDs]
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
function setGlossary(num, match, defin, phrase) {
  text = num;
  matches = match;
  definitions = defin;
  phrases = phrase;
}



/* ******************************************************************** *
 *                               Viewing                                *
 * ******************************************************************** */


/* Name:          getClickedWord
 * Called by:     "mouseup" function on "#text_display"
 * Parameters:    node     -  DOM node that was clicked.
 *                selRange -  The clicked location in the DOM.
 * Returns:       word (word that was clicked on, without punctuation, etc.)
 * Explanation:
 *   Retrieves DOM node information for a mouse click. Given the node that was
 * clicked, it gets the string contained therein, and finds the location in
 * string that was clicked. This information is used by isolateWord to find
 * the word that Annotext will look up.
 */
function getClickedWord(node, selRange) {
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

  // Replace unwanted characters (from Annotext 3.0)
  var pattern = /[\s\n\t.,!?:;\/|\\'"()\[\]-]/g;
  word = word.replace(pattern,"");
  word = word.toLowerCase();

  return word;
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

/* Name:          displayMatch
 * Called by:     "mouseup" function on "#text_display"
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
        str = str.concat("<b>" + m[key][0] + "</b> " + (m[key][1] ? "<i>" + m[key][1] + "</i> " : "") + m[key][2] + "<br>");
      });

      if (str != '')
        document.getElementById("translation_box").innerHTML = str;
    }
  }
}

/* Name:          displayPhrase
 * Called by:     "mouseup" function on "#text_display"
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
      document.getElementById("translation_box").innerHTML = "<b>" + phrase[0] + "</b> " + phrase[1];

  }
}

/* Name:          N/A ("mouseup" function on "#text_display")
 * Called by:     Clicking the text displayed by the Text's controller's show.
 * Parameters:    N/A
 * Returns:       Nothing. (Delegates printing to the screen.)
 * Explanation:
 *   When the user clicks the text_display div, this function first checks
 * that a phrase or word was clicked. Phrases come in two forms. The first,
 * those of the class "alt" simply store words to look up. So, both "alt"
 * phrases and non-phrase words are displayed in a similar manner, though
 * the manner of retrieving the word to look up in each case is slightly 
 * different. These words and alt-phrase words use the stored match and
 * definition hashes to retrieve glossary information for the user. The other
 * class of phrases is the "phrase" class. These store numerical IDs, which
 * are retrieved directly from the phrases hash. The translations are displayed
 * to the user in the viewing header by either the function displayMatch (used
 * for words and alt-phrases) or displayPhrase (phrase-phrases).
 */
$(document).on("mouseup", "#text_display", function() {
  if (window.getSelection && text) {
    var selRange = window.getSelection();
    var node = selRange.focusNode;
    var parent_id = node.parentNode.getAttribute('id');

    // !!! Update with:
    //  console.log($( event.target ).closest( ".phrase" ));
    //  console.log($( event.target ).closest( ".alt" ));
    if (parent_id != null) {
      if (isNaN(parent_id))                      // Letter ID  = alt phrase
        displayMatch(parent_id.toLowerCase());   // !!! Do on conversion.
      else                                       // Numeric ID = phrase phrase
        displayPhrase(parent_id);
    }
    else if (node) {
      displayMatch(getClickedWord(node, selRange));
    }
  }
});



/* ******************************************************************** *
 *                               Editing                                *
 * ******************************************************************** */

var root
//var text !!! Remember to set this (and change name) if moved to another file
var editing_matches = {};
var editing_definitions = {};
var editing_phrases = {};
var editing_hits = [];
var current_def = 0;
var editor_state = 0;  // 0 - Not anywhere, 1 - In dictionary, 2 - In glossary


$('#ckeditor').ckeditor({

});

// !!! Do comments
function setTextPath(num, path) {
  text = num;
  root = path;
}


/* Name:         setMatches
 * Called by:    selectword (CKEditor plugin) -> show.js.erb (Match controller)
 * Parameters:   found - True if in glossary. False if displaying dictionary.
 *               match - Hash of matches (key="string").
 *               defin - Hash of definitions (key=id).
 * Returns:      Nothing. (Sets globals.)
 * Explanation:
 *   Used to setup variables needed for editing a match. If the word is already
 * in the glossary, then all glossary matches will be displayed. If there are
 * multiple, a warning will be displayed (along with the prev, next, delete,
 * and save buttons.) If the word does not match anything in the glossary,
 * then all dictionary matches will be displayed. The previous and next buttons
 * will be enabled if there are multiple matches. If no matches, a warning
 * will be displayed.
 */
function setMatches(found,  match, defin) {
  var multiple = false;
  console.log(found);

  editing_matches = match;
  editing_definitions = defin;
  editing_hits = [];
  current_def = 0;

  console.log(editing_matches);
  console.log(editing_definitions);
  
  // Three relevant cases: 1. In glossary 2. In dictionary 3. In neither

  if (found) {
    editor_state = 2;
    Object.keys(editing_definitions).forEach(function (key) {
      editing_hits.push(key);
    });
    console.log(editing_hits);
    displayDefinition(0);
  }
  else if (match != null) {


  }
  else {

  }

}

/* Name:          N/A ("click" function on "#next_button")
 * Called by:     Clicking the Next button in the editing header.
 * Parameters:    N/A
 * Returns:       Nothing. (Displays next definition in header if possible.)
 * Explanation:
 *   If there is more than one possible glossary or dictionary definition to
 * display for a clicked word, this function will display the next one in the
 * list, unless the currently displayed definition is the last one.
 */
$(document).on('click','#next_button',function() {
  if (current_def < editing_hits.length-1) {
    current_def = current_def + 1;
    displayDefinition(current_def);
/* !!! Finish
    if (current_def >= editing_hits.length-1)
      // Disable next button
*/
  }
});

/* Name:          N/A ("click" function on "#prev_button")
 * Called by:     Clicking the Previous button in the editing header.
 * Parameters:    N/A
 * Returns:       Nothing. (Displays previous definition in header if possible.)
 * Explanation:
 *   If there is more than one possible glossary or dictionary definition to
 * display for a clicked word, this function will display the previous one in 
 * the list, unless the currently displayed definition is the first one.
 */
$(document).on('click','#prev_button',function() {
  if (current_def > 0) {
    current_def = current_def - 1;
    displayDefinition(current_def);
/* !!! Finish
    if (current_def <= 0)
      // Disable prev button
*/
  }
});

// !!! Comments
function displayDefinition(num) {
  var definition = editing_definitions[editing_hits[num]];
  //document.getElementById("term_box").innerHTML = definition[0]; 
  $("#term_box").val(definition[0]);
  $("#lexical_box").val(definition[1]);
  $("#definition_box").val(definition[2]);
  $("#matches_box").val(definition[3]);
}

/* Name:          N/A ("click" function on "#saveG_button")
 * Called by:     Clicking the Save to Glossary button in the editing header.
 * Parameters:    N/A
 * Returns:       Nothing. (Saves changes to the glossary.)
 * Explanation:
 *   If the currently displayed definition is not in the glossary currently,
 * this function will add it. If it is already in the glossary, this function
 * will make any modifications necessary to the term, lexical class, and
 * definition. In the creation case, the matches listed in the match list box
 * will be created in the database and linked to the new definition. In the
 * editing case, the listed matches will be checked against the current list
 * of matches. The database will be hit to both add new matches and remove
 * matches that no longer exist.
 */
$(document).on('click','#saveG_button',function() {
  // Part 1: Figure out whether we are adding or modifying  
  if (editor_state == 2) {
    var definition = editing_hits[current_def];

    var term = $("#term_box").val();
    var lex = $("#lexical_box").val();
    var defin = $("#definition_box").val();
    var list = $("#matches_box").val();

    console.log("Id=" + definition + " Term=" + term + " Lex=" + lex + " Defin=" + defin + " List=" + list);

    $.post('/definitions/' + definition, { _method: 'PUT', term: term, lex: lex, defin: defin, list: list }, function() {
    }, "script");  // !!! Make sure script, not "json". If so, remove jsondata.

  }
});


/* Name:          N/A ("click" function on "#saveD_button")
 * Called by:     Clicking the Save to Dictionary button in the editing header.
 * Parameters:    N/A
 * Returns:       Nothing. (Saves changes to the dictionary.)
 * Explanation:
 *   If the currently displayed definition is not in the dictionary currently,
 * this funciton will add it. If it is already in the dictionary, this function
 * will make any modifications necssary to the term, lexical class, and
 * definition. In the creation case, the matches listed in the match list box
 * will be created in the database and linked to the new definition. Since the
 * dictionary is not a text, both the definition and matches created in the
 * database will have a text_id of nil. In the editing case, the listed matches
 * will be checked against the current list of matches. Matches that no longer
 * exist will be removed from the database, while new listed matches will be
 * added.
 */
$(document).on('click','#saveD_button',function() {
  // Part 1: Figure out whether we are adding or modifying  
  if (editor_state == 2) {
    var definition = editing_hits[current_def];

    var term = $("#term_box").val();
    var lex = $("#lexical_box").val();
    var defin = $("#definition_box").val();
    var list = $("#matches_box").val();

    console.log("Id=" + definition + " Term=" + term + " Lex=" + lex + " Defin=" + defin + " List=" + list);

    $.post('/definitions/' + definition, { _method: 'PUT', term: term, lex: lex, defin: defin, list: list }, function() {
    }, "script");  // !!! Make sure script, not "json". If so, remove jsondata.

  }
});



/* Name:          N/A ("click" function on "#del_button")
 * Called by:     Clicking the Delete button in the editing header.
 * Parameters:    N/A
 * Returns:       Nothing. (Calls the definition controller to delete.)
 * Explanation:
 *   This button will delete the displayed definition from the glossary or
 * dictionary (whichever the displayed definition is from). The user will
 * first be asked whether they really want to delete it before proceeding.
 */
$(document).on('click','#del_button',function() {
  if (editing_state == 2) {
    //var defin = 
  }

/*
var root
//var text !!! Remember to set this (and change name) if moved to another file
var editing_matches = {};
var editing_definitions = {};
var editing_phrases = {};
var editing_hits = [];
var current_def = 0;
var editor_state = 0;  // 0 - Not anywhere, 1 - In dictionary, 2 - In glossary
*/






  if (current_def > 0) {
    current_def = current_def - 1;
    displayDefinition(current_def);
/* !!! Finish
    if (current_def <= 0)
      // Disable prev button
*/
  }
});







