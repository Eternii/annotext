CKEDITOR.plugins.add('multistart',
{
  init: function(editor) {
    // Image from http://findicons.com/icon/117421/document_arrow?id=341268
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('mulSDialog', new CKEDITOR.dialogCommand('mulSDialog'));

    editor.ui.addButton('MultiStart', {
      label: 'Start Multi-Word',
      title: 'Begin creating a multi-word phrase. Use this button to mark ' +
             'the first section of the multi-word phrase.',
      command: 'mulSDialog',
      icon: iconPath
    });

    CKEDITOR.dialog.add('mulSDialog', function(editor) {
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
          var dialog = this;
          var data = {};

          if (element)
            element = element.getAscendantAltOrPhrase(true, true, true);

          if (element) {
            alert("The highlighted text already contains a phrase or a " +
                  "lemma. Please use the requisite 'Mark/Edit' button to " +
                  "modify it.");
            dialog.hide();
          }
          else {
            element = editor.document.createElement('span');
            data.term = sel.getSelectedText();
            dialog.setupContent(data);
            this.element = element;
          }
        },


        onOk: function() {
          var span = this.element;   // !!! Either remove or use for errors
          var data = {};
          var phrase = '';
          var style = '';

          this.commitContent(data);

          $.post('/phrases', {term: data.term, defin: data.defin, text: text},
                                                  function(jsondata) {
            phrase = jsondata.phrase;
            console.log(phrase);
            if (phrase) {
              style = new CKEDITOR.style({attributes:
                                          {class: "phrase", phrase: phrase}});
              editor.applyStyle(style);
              multiphrase = jsondata.phrase;
              lastused_phrase = phrase;
            }
          }, "json");
        }
      };
    });
  }
});
