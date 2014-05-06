/* ******************************************************************** *
 *                                Set-up                                *
 * ******************************************************************** */

var matches = {};
var definitions = {};
var phrases = {};
var text;                   // Editing only. Used by CKEditor plugins.
var multiphrase;            // Editing only. Used by CKEditor plugins.
var newdef_button;          // Editing only. See below - #cancel-new-def click

// These must match equivalent variable names in custom.css.scss
var $purple = "#9900CC";          // For display of alt class.
var $blue_light = "#3399FF";      // For display of phrase class. 


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


/* Name:         setTextId
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
 * Parameters:    event - Event information.
 * Returns:       Nothing. (Delegates printing to the screen.)
 * Explanation:
 *   Called when the user clicks the text_display div, which holds the text
 * that the user is reading. This is function isolates the location clicked
 * before passing the work off to a function to decide the correct way to
 * look up the translation for the text that was clicked.
 *   The "skipGlossary" function is called at the start to check for either
 * note or media html elements. Should either of these be the clicked element,
 * no glossary lookup is required. Note that Firefox (at least) will not
 * register the "glyphicon-file" icon as being clicked, so it is impossible to
 * delegate the note functionality like phrase and lemma functionality are in
 * delegateMethod().
 */
$(document).on("mouseup", "#text-display", function(event) {
  if (skipGlossary(event))
    return;

  if (window.getSelection) {
    var selRange = window.getSelection();
    var node = selRange.focusNode;

    if (node)
      delegateMethod(selRange, node);
  }
});


/* Name:          skipGlossary
 * Called by:     "mouseup" function on "#text-display"
 * Parameters:    event - Event information.
 * Returns:       True if no glossary lookup necessary. False otherwise.
 * Explanation:
 *   Checks to see if the clicked element is either a note or media element.
 * If it is either, then no glossary lookup is necessary. Media elements will
 * automatically load their media in a new window (as they are links). Notes,
 * however, will be displayed via another function call.
 */
function skipGlossary(event) {
  var target_class = $(event.target).attr("class");

  if (target_class) {
    if (target_class.indexOf("note") > -1) {
      var note = $(event.target).attr("note");
      if (note) { displayNote(note); return true; }
    }

    if (target_class.indexOf("media") > -1)
      return true;
  }

  return false;
}


/* Name:          N/A ("click" function on "#search-button")
 * Called by:     Clicking the Search button in the viewer.
 * Parameters:    N/A
 * Returns:       Nothing. (Delegates printing to the screen.)
 * Explanation:
 *   Called when the user uses the search field in the viewer and either clicks
 * the Search button or presses enter while typing in the search input field.
 * This function takes the word typed in the search input field and attempts
 * to find it in the glossay and display it for the user in the translation box.
 */
$(document).on("click", "#search-button", function() {
  var word = document.getElementById("search-input").value;
  displayMatch( trimWordLowerCase(word) );
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


/* Name:          displayNote
 * Called by:     delegateMethod
 * Parameters:    note - Translator note to display to the user.
 * Returns:       Nothing. (Prints to screen.)
 * Explanation:
 *   The span that has a class of note will also contain a "note" attribute,
 * which is an extra explanation to display to the end user (that is not
 * stored in the database, like a phrase or glossary definition). Given such
 * a note, this function will display it in the translation box for the user.
 * There is no formatting of the note. It will be displayed in plain text.
 */
function displayNote(note) {
  if (note != null)
    document.getElementById("translation-box").innerHTML = note;
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
 * and/or spaces surrounding the word to isolate the word. Following this, the
 * word is passed to another function to finish cleanup before being returned
 * as the word that Annotext should look up.
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

  return trimWordLowerCase(word);
}


/* Name:         trimWordLowerCase
 * Called by:    isolateWord, "mouseup" function on "#search-button"
 * Parameters:   word (word clicked on / word typed in search box)
 * Returns:      word (without punctuation, lowercase, etc.)
 * Citation:     Derived mostly from getClickedWord in Annotext 3.0 global.js
 * Explanation:
 *   Takes the word and strips a number of characters (see "pattern" below)
 * from the string, resulting in the word that Annotext should look up. The
 * word is also converted to lowercase, as all glossary matches are stored
 * lowercase.
 */
function trimWordLowerCase(word) {
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
 *                           Viewing Options                            *
 * ******************************************************************** */

/* Name:          N/A ("click" function on "#media-checkbox")
 * Called by:     Clicking the 'Display Media' checkbox.
 * Parameters:    N/A
 * Returns:       Nothing. (Adds/Removes media links.)
 * Explanation:
 *   Called when the user clicks the checkbox to display or hide media links.
 * If the checkbox is checked, display the media links. If not, hide them.
 */
$(document).on("click", "#media-checkbox", function() {
  if ($('#media-checkbox').is(':checked'))
    $(".media").show();
  else
    $(".media").hide();
});


/* Name:          N/A ("click" function on "#colorize-checkbox")
 * Called by:     Clicking the 'Display Marked Phrases with Colors' checkbox.
 * Parameters:    N/A
 * Returns:       Nothing. (Displays lemmas and phrases with color.)
 * Explanation:
 *   Called when the user clicks the checkbox to display lemmas and phrases in
 * color (instead of as normal black text). If the box is now checked, add the
 * color. If not, remove the color.
 */
$(document).on("click", "#colorize-checkbox", function() {
  if ($('#colorize-checkbox').is(':checked')) {
    $(".alt").css('color', $purple);
    $(".phrase").css('color', $blue_light);
  }
  else {
    $('.alt').css('color', '');
    $('.phrase').css('color', '');
  }
});


/* Name:          N/A ("mousedown" function on "#translation-box")
 * Called by:     Resizing the translation-box in the viewing header.
 * Parameters:    N/A
 * Returns:       Nothing. (Increases text-display's margin-top.)
 * Explanation:
 *   The translation-box (which is only displayed with the Text controller's
 * show view) can be resized in Chrome, Safari, and Firefox browsers. However,
 * this increases the height of the header and can therefore cutoff the top of
 * the text body. This function dynamically increases the size of the div
 * text-display's margin-top css value in order to account for the increased
 * header sizes.
 *   Note that this function is triggered by mousedown on the translation-box,
 * but nothing is done until the mouse is released. This is necessary, however,
 * because the mouse can leave the translation-box during resizing (ex: moving
 * the mouse above the translation-box while its still pressed) and a function
 * that is merely triggered by mouseup would not be activated in that case
 * (even though the box had been resized).
 */
$(document).on("mousedown", "#translation-box", function(event) {
  // Nothing.
}).mouseup(function(event) {
  $('#text-display').css('margin-top',($('#translation-box').height()-58)+'px');
});



// !!! Do I want to move these to a different file that isn't loaded normally?

/* ******************************************************************** *
 *                               Editing                                *
 * ******************************************************************** */

/* Name:          N/A
 * Called by:     N/A (Used on the Text index when the editor is logged in.)
 * Parameters:    N/A
 * Returns:       Nothing.
 * Explanation:
 *   Activates the sorting arrows on the editor's text index page. That is,
 * this function makes it possible for the editor to rearrange the order of the
 * texts in the displayed text list.
 *   Currently requires that turbolinks be turned off for the link, so the
 * header "Texts" link is within a li with "data-no-turbolink". If this were
 * not so, then the editor's text index page would need to be refreshed before
 * the sortable handles functioned.
 */
$(function() {
  $(".sortable").sortable({ handle: '.sorting-handle' });
});


/* Name:          N/A ("click" function on "#save_position" button)
 * Called by:     Clicking the 'Save Position' button in the editor Text index.
 * Parameters:    N/A
 * Returns:       Nothing. (Sends data to server.)
 * Explanation:
 *   The "Save Position" button is on the texts index page when the editor is
 * logged in. The editor can move the texts around the list and save that text
 * order. The order that is saved will be the order that the texts appear to
 * the end users on the main index/home page (though only "released" texts will
 * be displayed to the end user).
 */
// !!! Clean this up! Needs not to be a get as well! Change button id too.
$(document).on('click', '#save_position', function() {
  var orderData = $(".texts").sortable('serialize');
  window.location.href = "/texts/order?"+orderData;
});


/* Name:          N/A ("click" function on "#cancel-new-media" button)
 * Called by:     Clicking the 'Cancel' button when adding new media.
 * Parameters:    N/A
 * Returns:       Nothing. (Changes Editor's Media display.)
 * Explanation:
 *   Empties the <li id="new-media"> item in the media list in the editor.
 * Also, clears the media manager's flash information.
 *   The "Manage Media" tab in the editor holds a "Cancel" button when the
 * editor is either creating or updating media. In the updating case, this
 * cancel button goes to the server (as multiple pieces of media could be in
 * editing mode at once, making client side upkeep difficult) to get the most
 * recently saved information about that media for display. In the case of
 * adding new media, however, this is unnessary as nothing is created and
 * therefore nothing needs to be displayed. Thus, this function simply resets
 * the affected html.
 */
$(document).on('click', '#cancel-new-media', function() {
  $("#media-flash").html("");
  $("#new-media").html("");
});



/* Name:          N/A ("click" function on "#cancel-new-def" button)
 * Called by:     Clicking the 'Cancel' button when adding a new definition.
 * Parameters:    N/A
 * Globals:       newdef_button - Required. HTML for new definition link.
 *                                Contains button HTML, including href,
 *                                caption, classes, data-remote=true, and
 *                                parameters (text id & match string).
 *                                    
 * Returns:       Nothing. (Changes Editor's Definition Glossary display.)
 * Explanation:
 *   When the user clicks the "Create New Definition" button in the glossary
 * definition list in the Markup tab of the Editor, the button is replaced by
 * the "shared/definition_form" which is used to create a new glossary
 * definition (amongst other things). This function is called when the user
 * presses the "Cancel" button on this form. This function then replaces that
 * form with the "Create New Definition" button that had been there previously.
 * The form of that button (e.g. address, parameters, etc.) is stored in the
 * "newdef_button" global, which is set in definitions/new.js.erb. Basically, 
 * this function reverses the process from new.js.erb.
 *   The "Markup" tab in the editor contains a list of definitions for a word
 * once it is clicked. When creating or editing a definition, there is a
 * "Cancel" or similar button present. In the updating case, this cancel button
 * goes to the server (as multiple definitions could be in editing mode at
 * once, making client side upkeep difficult) to get the most recently saved
 * definition information for normal entry display. In the case of creating a
 * new definition this is unnessary, as nothing is created and therefore only
 * the "Create New Definition" button needs to be re-rendered. Thus, this
 * function simply resets the affected html. Note that currently creating
 * new definitions is limited to the glossary (and not the dictionary).
 */
$(document).on('click', '#cancel-new-def', function() {
  $("#new-gloss-def").html(newdef_button);
});


/* Name:          N/A
 * Called by:     N/A (Used on the Markup tab of the Text edit page.)
 * Parameters:    N/A
 * Returns:       Nothing. (Changes Definition Column and CKEditor height.)
 * Explanation:
 *   Calls adjustMarkupTab to adjust the height of the Definition column and
 * CKEditor instance on the Markup tab of the Text Editor page.
 */
$(function() {
  if (document.getElementById("markup"))
    adjustMarkupTab();
});


/* Name:          N/A ("resize" function on the window)
 * Called by:     Resizing the window when on the Text edit page.
 * Parameters:    N/A
 * Returns:       Nothing. (Changes Definition Column and CKEditor height.)
 * Explanation:
 *   Calls adjustMarkupTab to adjust the height of the Definition column and
 * CKEditor instance on the Markup tab of the Text Editor page.
 */
$(window).resize(function() {
  if (document.getElementById("markup"))
    adjustMarkupTab();
});

/* Name:          adjustMarkupTab
 * Called by:     opening a webpage, resizing the window
 * Parameters:    N/A
 * Returns:       Nothing. (Changes Definition Column and CKEditor height.)
 * Explanation:
 *   Assumes that the current webpage is the Text Edit page with a Markup tab.
 *   Resizes the Definition column and the CKEditor heights in the Editor's
 * Markup tab to fill the remainder of the screen. Both the column and CKEditor
 * instance should scroll independently of the window.
 *   As of the writing of this function, CSS3 viewport units (esp. vh) are very
 * new and not well supported across all browsers, so resizing based on the
 * height of the viewport is being done with jQuery instead.
 */
function adjustMarkupTab() {
  var viewportHeight = $(window).height()-130;
  $("#definition-column").height(viewportHeight);
  $("#ckeditor-text").height(viewportHeight-100);
}















