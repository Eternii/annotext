CKEDITOR.plugins.add('multistart',
{
  init: function(editor) {
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('mulSDialog', new CKEDITOR.dialogCommand('mulSDialog'));

    editor.ui.addButton('MultiStart', {
      label: 'Start MWE',
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
          var dialog = this;
          var data = {};

          if (element)
            element = element.getAscendant('span', true);

          if (!element || (element.getAttribute('class')!="phrase") || 
                                          element.data('cke-realelement')) {
            element = editor.document.createElement('span');
            data.term = sel.getSelectedText();
            dialog.setupContent(data);
            this.element = element;
          }
          else {
            alert("The highlighted text already contains a phrase. Please " +
                  "use the 'Mark Phrase' button to modify it.");
            dialog.hide();
          }
        },


        onOk: function() {
          var span = this.element;   // !!! Either remove or use for errors
          var dialog = this;
          var data = {};
          var style = '';

          this.commitContent(data);

          $.post('/phrases', {term: data.term, defin: data.defin, text: text},
          function(jsondata) {
            if (jsondata.phrase) {
              style = new CKEDITOR.style(
                  {attributes: { class: "phrase", phrase: jsondata.phrase}});
              editor.applyStyle(style);
              multiphrase = jsondata.phrase; // Save phrase # for continuation.
            }
            //else
              // !!! Need to get ride of span created above.
          }, "json");
        }
      };
    });
  }
});
