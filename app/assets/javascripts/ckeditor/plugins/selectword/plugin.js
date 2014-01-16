/* Name:          selectword
 * Called by:     Clicking the text in the CKEditor during text editing.
 * Parameters:    N/A
 * Returns:       Nothing. (Prints match definitions to editing header.)
 * Explanation:
 *   This CKEditor plugin is called whenever the user clicks (mouseup) inside
 * the editor. Its purpose is to retrieve the match data for the clicked word
 * and display it within the editing header. Alt-phrases also have their
 * matches displayed in this manner. However, normal phrases are ignored and
 * are modified and displayed completely within other CKEditor plugins.
 *   This function mirrors, but does not replicate (due to the CKEditor using
 * specialized functions), the functionality of the mouseup on #text_display
 * function in texts.js. It first determines whether we are in the editor and
 * only clicking, not highlights (the latter functionality is reserved for
 * markups to alts and phrases). Once there, we need to determine the word
 * clicked on, which is done via finding the alt's match attribute or by
 * isolating the clicked word. In the latter case, we again use similar code to
 * texts.js, including actually using that code's isolateWord function. The
 * word is then sent to the server, and the results are displayed in the
 * editing header via the Match controller.
 */
CKEDITOR.plugins.add( 'selectword', 
{
  init : function(editor) {
    editor.on('contentDom', function() {
      editor.document.on('mouseup', function(event) {
        if (editor.focusManager.hasFocus) {
          var selRange = editor.getSelection();

          if (selRange.getNative().isCollapsed) {
            var element = selRange.getStartElement();
            var word = '';
          
            if (element)
              element = element.getAscendant('span', true);

            if (element.getAttribute('class') == "phrase")
              return true;

            if (element.getAttribute('class') == "alt")
              word = element.getAttribute('match');
            else {
              var sel = selRange && selRange.getRanges()[0];
              var startCon = sel.startContainer;
              var startOff = sel.startOffset;
              var str = startCon.getText();

              word = isolateWord(str, startOff);
            }

            if (word != '') {
              // !!! Change this jQuery form !!!
              $.get('/matches/1', { word: word, text: text }, function(data) {
                // Use Match Controller's show
              }, "script");
            }
          }
        }
        return true;
      });
    });
  }
});

