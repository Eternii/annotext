CKEDITOR.plugins.add('note',
{
  init: function(editor) {
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('noteDialog', new CKEDITOR.dialogCommand('noteDialog'));

    editor.ui.addButton('Note', {
      label: 'Insert/Edit Note',
      title: 'Create or Edit a note.',
      command: 'noteDialog',
      icon: iconPath
    });

    if (editor.contextMenu) {
      editor.addMenuGroup('noteGroup');
      editor.addMenuItem('noteItem', {
        label: 'Edit Note',
        icon: iconPath,
        command: 'noteDialog',
        group: 'noteGroup'
      });
      editor.contextMenu.addListener(function(element) {
        if (element)
          element = element.getAscendantNote(true);

        if (element && !element.isReadOnly()
                    && !element.data('cke-realelment')
                    && (element.getAttribute('note') != ""))
          return { noteItem : CKEDITOR.TRISTATE_OFF };

        return null;
      });
    }

    CKEDITOR.dialog.add('noteDialog', function(editor) {
      return {
        title: 'Note Properties',
        minWidth: 400,
        minHeight: 200,
        contents:
        [
          {
            id: 'general',
            label: 'Information',
            elements:
            [
              {
                type: 'textarea',
                id: 'note',
                label: 'Note',
                validate: CKEDITOR.dialog.validate
                              .notEmpty("Note field cannot be empty"),
                setup: function(element) {
                  this.setValue(element.getAttribute('note'));
                },
                commit: function(data) {
                  data.note = this.getValue();
                }
              }
            ]
          }
        ],

        onShow: function() {
          var sel = editor.getSelection();
          var element = sel.getStartElement();

          if (element)
            element = element.getAscendantNote(true);

          if (!element || (element.getAttribute('class') != 
                                      'note glyphicon glyphicon-file')
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
          var note = '';

          this.commitContent(data);
          note = data.note;
          note = note.replace(/[\n\r]/g, ' ');

          if (this.insertMode) {
            span.setAttribute('class', 'note glyphicon glyphicon-file');
            span.setAttribute('note', note);
            span.setHtml("[Note]");
            editor.insertElement(span);
          }
          else {
            span.setAttribute('note', note);
          }

        }
      };
    }); 
  }
});
