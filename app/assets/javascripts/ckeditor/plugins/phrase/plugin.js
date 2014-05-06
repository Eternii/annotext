CKEDITOR.plugins.add('phrase',
{
  init: function(editor) {
    // Created in http://faviconist.com/
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('phrDialog', new CKEDITOR.dialogCommand('phrDialog'));

    editor.ui.addButton('Phrase', {
      label: 'Mark Phrase',
      command: 'phrDialog',
      icon: iconPath
    });

    if (editor.contextMenu) {
      editor.addMenuGroup('annotextGroup');
      editor.addMenuItem('phrItem', {
        label: 'Edit Phrase Markup',
        command: 'phrDialog',
        icon: iconPath,
        group: 'annotextGroup'
      });
      editor.contextMenu.addListener(function(element) {
        if (element)
          element = element.getAscendant('span', true);
        if (element && !element.isReadOnly() && !element.data('cke-realelement') && (element.getAttribute('class') == "phrase"))
          return { phrItem: CKEDITOR.TRISTATE_OFF };
        return null;
      });
    }

    CKEDITOR.dialog.add('phrDialog', function(editor) {
      return {
        title: 'Phrase Properties',
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
              },
              {
                type: 'button',
                id: 'load_recent',
                label: 'Load Most Recently Created Phrase',
                disabled: false,
                onClick: function() {
                  alert("Load last phrase!");
                }
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
                          var dialog = this.getDialog();
                          var phrase = dialog.getContentElement
                                                  ("tab1", "number").getValue();

                          $.get('/phrases/'+ phrase +'/edit',{},function(data){
                            dialog.setupContent(data);
                          }, "json");
                        }
                      }
                    ]
                  }
                ]
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
            element = element.getAscendant('span', true);

          if (!element || (element.getAttribute('class')!="phrase") || element.data('cke-realelement')) {
            element = editor.document.createElement('span');
            this.insertMode = true;
            this.phrase = '';
          }
          else {
            this.insertmode = false;

            phrase = element.getAttribute('phrase');
            this.phrase = phrase;

            if (phrase) {
              $.get('/phrases/'+ phrase +'/edit', {}, function(data) {
                dialog.setupContent(data);
              }, "json");
            }
            else
              alert("This phrase is missing its identification number. No definition information can be loaded. A new phrase will be generated in the database for the term and definition upon acceptance of this dialog box.")
          }

          this.element = element;
        },
        onOk: function() {
          var span = this.element;   // !!! this.element = remove everywhere?
          var phrase = this.phrase;
          var dialog = this;
          var data = {};
          var style = '';

          this.commitContent(data);

          if (this.insertMode) {
            $.post('/phrases', {term: data.term, defin: data.defin, text: text}, function(jsondata) {
              if (jsondata.phrase) {
                style = new CKEDITOR.style({attributes: { class: "phrase", phrase: jsondata.phrase}});
                editor.applyStyle(style);
              }
              //else
                // !!! Need to get ride of span created above.
            }, "json");
          }
          else {
            if (phrase) {
              $.post('/phrases/' + phrase, { _method: 'PUT', term: data.term, defin: data.defin }, function() {
              }, "script");
            }
            //else
              // !!! Do something. Error happened and ID is gone.
          }
        }
      };
    });
  }
});

