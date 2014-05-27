/* Name:          lemma/plugin.js 
 * Called by:     "Mark/Edit Lemma" CKEditor button and equivalent menu item.
 * Parameters:    N/A
 * Returns:       Nothing. (Adds lemma spans to the text.)
 * Explanation:
 *   This CKEditor dialog is used to lemmatize the text. That is, this plugin
 * is used to mark certain words (or sets of words) as being equivalent to the
 * definition of another word. Thus, when the end user clicks on one of the
 * words marked by a lemma, the end user should not see the glossary definition
 * for that word. Rather, the end user should see the lemmatized word that has
 * been specified as the correct match for the clicked word.
 *   An example:
 *           "reiben" is clicked by the user.
 *           "reiben" has been marked as a lemma for "abreiben".
 *           The definition for "abreiben" is displayed to the user.
 *   Many lemma examples are very simple, and they are often also used to 
 * specify the definition for two words that are spelled identically (by
 * pointing to another form of the word). Lemma's can, however, also be
 * multiple words long or include "phrases" to simply point to a glossary
 * definition.
 *   Lemmas are marked in the text in the form of:
 *           <span class="alt" match="______">...</span>
 *   Where the blank line is filled with the glossary match to look up and the
 * word or words included in the lemma take the place of the ellipsis.
 *   The dialog box used by this plugin is very simple, consisting of only two
 * elements: an input box for the lemma match and a "Load Match" button. The
 * "Glossary Match" input box, which should contain the lemma match, is used
 * to populate the lemma span when the dialog box is accepted. If the user is
 * marking a word as a lemma for the first time, that span will be created on
 * acceptance. If the selected text is already a lemma, the plugin will simply
 * change the match value. "Glossary Match" is a required field. To remove the
 * lemma, the user must use the seperate deletemarkup plugin.
 *   Unlike the phrase plugins, the lemma plugin does not need to go the
 * database to function, though the server is hit after accepting the dialog
 * box to load the lemmatized word into the glossary column for ease of use.
 * It is expected that the user add the word used by the lemma to the glossary
 * through the glossary column (just like all other glossary matches). At any
 * time when the dialog is open, the editor can also press the "Load Match"
 * button to load the current match's glossary definition into the glossary
 * column (which is visible, though disabled, in the background).
 */
CKEDITOR.plugins.add('lemma',
{
  init: function(editor) {
    // Icon created in http://faviconist.com/
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('lemmaDialog', new CKEDITOR.dialogCommand('lemmaDialog'));

    editor.ui.addButton('Lemma', {
      label: 'Mark/Edit Lemma',
      title: 'Create or Edit a Lemma.',
      command: 'lemmaDialog',
      icon: iconPath
    });

    if (editor.contextMenu) {
      editor.addMenuGroup('annotextGroup');
      editor.addMenuItem('lemmaItem', {
        label: 'Edit Lemma',
        command: 'lemmaDialog',
        icon: iconPath,
        group: 'annotextGroup'
      });
      editor.contextMenu.addListener(function(element) {
        if (element)
          element = element.getAscendantAltOrPhrase(true, true, false);
        if (element && !element.isReadOnly()
                    && !element.data('cke-realelement')
                    && (element.getAttribute('class') == "alt"))
          return { lemmaItem: CKEDITOR.TRISTATE_OFF };
        return null;
      });
    }

    CKEDITOR.dialog.add('lemmaDialog', function(editor) {
      return {
        title: 'Lemma Properties',
        minWidth: 400,
        minHeight: 200,
        contents:
        [
          {
            id: 'tab1',
            label: 'Information',
            elements:
            [
              {
                type: 'text',
                id: 'lemma',
                label: 'Glossary Match',
                validate: function() {
                  var lemma = trimLemma(this);

                  if (lemma.length < 1) {
                    api.openMsgDialog("The lemma must not be empty. Either " +
                          "nothing was entered or all entered characters " +
                          "were found to be invalid and were removed.");
                    return false;
                  }
                },
                setup: function(element) {
                  this.setValue(element.getAttribute('match'));
                },
                commit: function(data) {
                  data.match = this.getValue();
                }
              },
              {
                type: 'button',
                id: 'load',
                label: 'Format Lemma and Load Match',
                disabled: false,
                onClick: function() {
                  var lemma = trimLemma(this.getDialog().getContentElement
                                                            ("tab1", "lemma"));

                  $.get('/matches/1', {word: lemma, text: text}, function() {
                    // Match Controller's show will display as clicked word
                  }, "script");
                }
              }
            ]
          }
        ],
        onShow: function() {
          var sel = editor.getSelection();
          var element = sel.getStartElement();

          if (element)
            element = element.getAscendantAltOrPhrase(true, true, false);

          if (!element || (element.getAttribute('class')!="alt")
                       || element.data('cke-realelement')) {
            element = editor.document.createElement('span');
            this.insertMode = true;
          }
          else {
            this.insertMode = false;
            this.setupContent(element);
          }

          this.element = element;
        },
        onOk : function() {
          var span = this.element;
          var data = {};
          var match = '';
          var style = '';

          this.commitContent(data);
          match = data.match;

          if (this.insertMode) {
            style = new CKEDITOR.style({attributes: {class:"alt",match:match}});
            editor.applyStyle(style);
          }
          else {
            span.setAttribute('match', match);  
          }

          $.get('/matches/1', { word: match, text: text }, function() {
            // Use Match Controller's show to display match in editing header
          }, "script");
        }
      };
    });   
  }
});


// !!! Document. And move?
function trimLemma(element) {
  var lemma = element.getValue();
  lemma = lemma.replace(/[\s]/g, "");
  lemma = trimWordLowerCase(lemma);
  element.setValue(lemma);

  return lemma;
}
