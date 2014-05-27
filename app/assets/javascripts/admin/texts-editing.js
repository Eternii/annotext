/* ******************************************************************** *
 *                                Set-up                                *
 * ******************************************************************** */

var text;                   // Used by CKEditor plugins.
var multiphrase;            // Used by CKEditor plugins.
var lastused_phrase;        // Used by CKEditor plugins.
var newdef_button;          // See below - #cancel-new-def click

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
  lastused_phrase = '';
}



/* ******************************************************************** *
 *                    Editor Text Index - Sorting                       *
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



/* ******************************************************************** *
 *                              Editing                                 *
 * ******************************************************************** */


/* Name:          prepareHits
 * Called by:     Clicking the 'Submit' button on the definition_form.
 * Parameters:    id - Either definition ID being edited or nil (i.e new def).
 * Returns:       true - Always submit the definition form.
 * Explanation:
 *   Converts the "Hit" list from the editing or new definition form into a
 * properly formatted form. This involves removing carriage returns in this
 * function, as well as removing some unicode zero-width characters and non-
 * breaking spaces, a number of  punctuation marks not included in the interior
 * of the word, and converting the words to lowercase. These latter steps are
 * accomplished using trimWordLowerCase in sitewide/texts.js
 *   Due to some slight differences between the way that javascript and ruby
 * convert uppercase characters to lowercase, this conversion should be done
 * on the client side.
 *   The id of the definition is passed in. If this is a number, then the
 * id of the hits box is "hits_${id}". This case occurs if the definition
 * already exists and this is an update. If the user is creating a definition,
 * the id will be 'nil', and the id of the hits box will be "hits_".
 *   When the hits list is converted to an array for processing, any extra
 * spaces will be removed from the array as well.
 *   For consistent error handling, we always go to server, which will return
 * an error if the list is unusable (i.e. empty).
 *   Note that, currently in Safari at least, the unicode zero-width space
 * (&#8203 or U+200B) can appear due to jquery insertion. This can make the
 * string appear empty but still be "valid" if not removed. For an example
 * of the zero-width space problem, note that opening a definition for
 * modification, deleting the contents of the "Hits" box, and clicking create
 * or update sends a non-empty string (containing only U+200B) to this function. */
function prepareHits(id) {
  // This is required: String concatenating null yields "hits_null" in js
  if (id)
    var element = document.getElementById("hits_" + id);
  else
    var element = document.getElementById("hits_");

  var list = element.value;
  list = list.replace(/[\n\t]+/g," ");              // Remove returns and tabs

  var arr = list.split(" ");
  arr = arr.filter(function(v) { return v!='' } );  // Remove extra spaces

  for (var i=0; i<arr.length; i++)
    arr[i] = trimWordLowerCase(arr[i]);   // New empty spaces handled in Rails

  list = arr.join(" ");
  element.value = list;

  return true;
}


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
 * Called by:     N/A (Used on the Markup tab when opening the Text edit page.)
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


// !!! Make this and previous functions page specific?

/* Name:          adjustMarkupTab
 * Called by:     opening a webpage, resizing the window
 * Parameters:    N/A
 * Returns:       Nothing. (Changes Definition Column and CKEditor height.)
 * Explanation:
 *   Assumes that the current webpage is the Text Edit page with a Markup tab.
 *   Resizes the Definition column and the CKEditor heights in the Editor's
 * Markup tab to fill the remainder of the screen. Both the column and CKEditor
 * instance should scroll independently of the window.
 *   Resizes the CKEditor height in the Editor's "About the Text" tab to fill
 * the remainder of the screen. It will scroll indendently of the window.
 *   As of the writing of this function, CSS3 viewport units (esp. vh) are very
 * new and not well supported across all browsers, so resizing based on the
 * height of the viewport is being done with jQuery instead.
 */
function adjustMarkupTab() {
  var viewportHeight = $(window).height()-130;
  $("#definition-column").height(viewportHeight);
  $("#ckeditor-text").height(viewportHeight-120);
  $("#ckeditor-about").height(viewportHeight-150);
}




/* ******************************************************************** *
 *                           Error Messages                             *
 * ******************************************************************** */


/* Name:          problemSaving
 * Called by:     CKEditor plugins
 * Parameters:    N/A
 * Returns:       Nothing. (Triggers an alert box.)
 * Explanation:
 *   If a jQuery save request fails to access the server (e.g. the server is
 * down, the server is locked, etc.), the jQuery requests' fail instructions
 * are to call this function to alert the user.
 */
function problemSaving() {
  alert("The server cannot be accessed. No data can be saved. " +
        "Please check your connection and try again.")
}
