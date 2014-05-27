CKEDITOR.plugins.add('multicont',
{
  init: function(editor) {
    // Modified from http://findicons.com/icon/118092/arrow_continue?id=122344
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('mulCDialog', new CKEDITOR.dialogCommand('mulCDialog'));

    editor.ui.addButton('MultiCont', {
      label: 'Continue Multi-Word',
      title: 'Continue creating a multi-word phrase. Use this button to ' +
             'mark all subsequent parts of a multi-word phrase.',
      command: 'mulCDialog',
      icon: iconPath
    });

    CKEDITOR.dialog.add('mulCDialog', function(editor) {
      return {
        title: 'Multiword Properties',
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
                setup: function(data) {
                  this.setValue(data.defin);
                },
                commit: function(data) {
                  data.defin = this.getValue();
                }
              }
            ]
          }
        ],


        onShow: function() {
          var sel = editor.getSelection();
          var element = sel.getStartElement();
          var phrase = multiphrase;
          var dialog = this;
          var data = {};

          if (!phrase) {
            alert("The is currently no phrase to continue marking. Please " +
                  "use the 'Start Multi-Word' button to begin creating " +
                  "a phrase.");
            dialog.hide();
            return;
          }

          if (element)
            element = element.getAscendantAltOrPhrase(true, true, true);

          if (element) {
            alert("The highlighted text already contains a phrase or a " +
                  "lemma. Please use the requisite 'Mark/Edit' button to " +
                  "modify it.");
            dialog.hide();
          }
          else {
            $.get('/phrases/'+ phrase +'/edit', {text: text}, function(data) {
              element = editor.document.createElement('span');
              data.term = data.term + " " + sel.getSelectedText();
              dialog.setupContent(data);
              dialog.phrase = phrase;
              dialog.element = element;
            }, "json")
              .fail(function() {
                alert("The selected phrase either will not load or is not " +
                      "found on the server. Please check your connection or " +
                      "use the 'Start Multi-Word' button to begin creating " +
                      "a new phrase.")
                dialog.hide();
              });
          }
        },


        onOk: function() {
          var span = this.element;   // !!! Either remove or use for errors
          var data = {};
          var phrase = this.phrase;
          var style = '';

          this.commitContent(data);

          $.post('/phrases/' + phrase, { _method: 'PATCH', term: data.term,
                                           defin: data.defin }, function() {
            style = new CKEDITOR.style({attributes:
                                          {class: "phrase", phrase: phrase }});
            editor.applyStyle(style);
          }, "script");
        }
      };
    });
  }
});
