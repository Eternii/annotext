CKEDITOR.plugins.add('multicont',
{
  init: function(editor) {
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('mulCDialog', new CKEDITOR.dialogCommand('mulCDialog'));

    editor.ui.addButton('MultiCont', {
      label: 'Continue MWE',
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
                validate: CKEDITOR.dialog.validate
                              .notEmpty("Definition field cannot be empty"),
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
                  "use the 'Start MWE' button to begin creating a phrase.");
            dialog.hide();
          }

          if (element)
            element = element.getAscendant('span', true);

          if (!element || (element.getAttribute('class')!="phrase") ||
                                          element.data('cke-realelement')) {
            $.get('/phrases/' + phrase + '/edit', {}, function(data) {
              element = editor.document.createElement('span');
              data.term = data.term + " " + sel.getSelectedText();
              dialog.setupContent(data);
              dialog.phrase = phrase;
              dialog.element = element;
            }, "json")
              .fail(function() {
                alert("The selected phrase either will not load or is not " +
                      "found on the server. Please check your connection or " +
                      "use the 'Start MWE' button to create a new phrase.")
                dialog.hide();
              });
          }
          else {
            alert("The highlighted text already contains a phrase. Please " +
                  "use the 'Mark Phrase' button to modify it.");
            dialog.hide();
          }
        },


        onOk: function() {
          var span = this.element;   // !!! Either remove or use for errors
          var phrase = this.phrase;
          var dialog = this;
          var data = {};
          var style = '';

          this.commitContent(data);

          $.post('/phrases/' + phrase, { _method: 'PATCH', term: data.term,
                 defin: data.defin }, function() {
            style = new CKEDITOR.style(
                  { attributes: { class: "phrase", phrase: phrase }});
            editor.applyStyle(style);
          }, "script")
            .fail(function() {
              alert("There is a problem saving the data to the server." +
                    "Please check your connection and try again.")
            });
        }
      };
    });
  }
});
