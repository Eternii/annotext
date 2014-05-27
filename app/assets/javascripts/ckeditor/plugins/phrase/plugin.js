/* Name:          phrase/plugin.js
 * Called by:     "Mark/Edit Phrase" CKEditor button and equivalent menu item.
 * Parameters:    N/A
 * Returns:       Nothing. (Adds phrase spans to the text. Also saves phrases.)
 * Explanation:
 *   This CKEditor dialog is used to add single-selection phrases to the text
 * and also to modify ALL phrases marked in the text. Phrases that are marked
 * in sections (e.g. <phrase>Part 1</phrase> asdfkj <phrase>Part 2</phrase>)
 * can be created by using the multistart and multicont buttons, which allows
 * the multi-part phrase to be easily grouped under one phrase number. However,
 * even these phrases can only be later edited using this plugin.
 *   Phrases are marked in the text in the form of:
 *            <span class="phrase" phrase="_____">...</span>
 *   Where the blank line is filled with the phrase's id in the database and
 * the word or words included in the phrase take the place of the ellipsis.
 *   

 */
CKEDITOR.plugins.add('phrase',
{
  init: function(editor) {
    // Icon created in http://faviconist.com/
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('phrDialog', new CKEDITOR.dialogCommand('phrDialog'));

    editor.ui.addButton('Phrase', {
      label: 'Mark/Edit Phrase',
      title: 'Create or Edit a Phrase. Use this button to modify the ' +
             'definition for any multiword phrase.',
      command: 'phrDialog',
      icon: iconPath
    });

    if (editor.contextMenu) {
      editor.addMenuGroup('annotextGroup');
      editor.addMenuItem('phrItem', {
        label: 'Edit Phrase',
        command: 'phrDialog',
        icon: iconPath,
        group: 'annotextGroup'
      });
      editor.contextMenu.addListener(function(element) {
        if (element)
          element = element.getAscendantAltOrPhrase(true, false, true);
        if (element && !element.isReadOnly()
                    && !element.data('cke-realelement')
                    && (element.getAttribute('class') == "phrase"))
          return { phrItem: CKEDITOR.TRISTATE_OFF };
        return null;
      });
    }

    CKEDITOR.dialog.add('phrDialog', function(editor) {
      return {
        title: 'Phrase Properties',
        minWidth: 500,
        minHeight: 400,
        contents:
        [
          {
            id: 'tab1',
            label: 'Information',
            elements:
            [
              {
                type: 'text',
                id: 'term',
                label: 'Term',
                validate: CKEDITOR.dialog.validate
                              .notEmpty("Term field cannot be empty"),
                setup: function(data) {
                  this.setValue(data.term);
                },
                commit: function(data) {
                  data.term = this.getValue();
                }
              },
              {
                type: 'textarea',
                id: 'definition',
                label: 'Definition',
                rows: 10,
                validate: CKEDITOR.dialog.validate
                              .notEmpty("Definition field cannot be empty"),
                setup: function(data) {
                  this.setValue(data.defin);
                },
                commit: function(data) {
                  data.defin = this.getValue();
                }
              },
              {
                type: 'html',
                html: '<br><br><br><br><br>'
              },
              {
                type: 'hbox',
                widths: [ '30%', '70%' ],
                children: [
                  {
                    type: 'text',
                    id: 'number',
                    label: 'Phrase Number'
                  },
                  {
                    type: 'vbox',
                    children: [
                      {
                        type: 'html',
                        html: ''
                      },
                      {
                        type: 'button',
                        id: 'load_number',
                        label: 'Load Phrase Number',
                        disabled: false,
                        padding: '1',
                        onClick: function() {
                          var phrase = this.getDialog().getContentElement
                                                 ("tab1", "number").getValue();

                          loadOtherPhrase(this.getDialog(), phrase,
                            "There is no phrase ID entered in the lookup box.");
                        }
                      }
                    ]
                  }
                ]
              },
              {
                type: 'button',
                id: 'load_recent',
                label: 'Load Most Recently Used Phrase',
                disabled: false,
                onClick: function() {
                  loadOtherPhrase(this.getDialog(), lastused_phrase,
                        "No phrases have been used since starting a new " +
                        "editing session.");
                }
              }
            ]
          }
        ],
        onShow: function() {
          var sel = editor.getSelection();
          var element = sel.getStartElement();
          var phrase = '';
          var dialog = this;
          var data = {};

          if (element)
            element = element.getAscendantAltOrPhrase(true, false, true);

          if (!element || (element.getAttribute('class')!="phrase") 
                       || element.data('cke-realelement')) {
            element = editor.document.createElement('span');
            this.insertMode = true;
            this.phrase = '';
            data.term = sel.getSelectedText();
            dialog.setupContent(data);
          }
          else {
            this.insertmode = false;

            phrase = element.getAttribute('phrase');
            this.phrase = phrase;

            if (phrase) {
              $.get('/phrases/'+ phrase +'/edit', {text: text}, function(data) {
                dialog.setupContent(data);
                // !!! Handle null returns for bad text_id or phrase # ?
              }, "json");
            }
            else
              alert("This phrase is missing its identification number. " +
                    "No definition information can be loaded. A new phrase " +
                    "will be generated in the database for the term and " +
                    "definition upon acceptance of this dialog box.")
          }

          this.element = element;
        },
        onOk: function() {
          var span = this.element;
          var data = {};
          var phrase = this.phrase;
          var style = '';

          this.commitContent(data);


          // !!! Should probably make a new function + loading definition
          // !!! Change to PATCH
          if (phrase) {
            $.post('/phrases/' + phrase, { _method: 'PUT', term: data.term,
                                          defin: data.defin }, function() {
            }, "script");
            if (this.insertMode) {
              style = new CKEDITOR.style({attributes:
                                            {class: "phrase", phrase: phrase}});
              editor.applyStyle(style);
            }
            else {   // In case the user has loaded another phrase.
              span.setAttribute('phrase', phrase);
            }
            lastused_phrase = phrase;
          }
          else {
            $.post('/phrases', {term: data.term, defin: data.defin, text: text},
                                                    function(jsondata) {
              phrase = jsondata.phrase;
              // Always insertMode here
              style = new CKEDITOR.style({attributes:
                                          {class: "phrase", phrase: phrase}});
              editor.applyStyle(style);
              lastused_phrase = phrase;
            }, "json");
          }

          // !!! Should probably load phrase...
        }
      };
    });
  }
});


// !!! Protect against non-numeric phrase numbers or handle error from server.
function loadOtherPhrase(dialog, phrase, error_str) {
  var cont = true;

  if (!dialog.insertMode) {
    cont = confirm("Are you sure you want to load another phrase? \n\nIf " +
                   "you do so, that other phrase (including id) will be " +
                   "used instead of the phrase that if currently loaded for " +
                   "editing.");
    if (!cont) return;  // Early return if abandoning operation
  }

  if (phrase) {
    $.get('/phrases/' + phrase + '/edit', {text: text}, function(data) {
      if (data.term == '')
        alert("The selected phrase does not exist or belongs to another text.");
      else {
        dialog.setupContent(data);
        dialog.phrase = phrase;
      }
    }, "json");
  }
  else
    alert(error_str);
}

