CKEDITOR.plugins.add('lemma',
{
  init: function(editor) {
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('lemmaDialog', new CKEDITOR.dialogCommand('lemmaDialog'));

    editor.ui.addButton('Lemma', {
      label: 'Mark Lemma',
      title: 'Create or Edit a Lemma',
      command: 'lemmaDialog',
      icon: iconPath
    });

    if (editor.contextMenu) {
      editor.addMenuGroup('annotextGroup');
      editor.addMenuItem('lemmaItem', {
        label: 'Edit Lemma',
        icon: iconPath,
        command: 'lemmaDialog',
        group: 'annotextGroup'
      });
      editor.contextMenu.addListener(function(element) {
        if (element)
          element = element.getAscendant('span', true);
        if (element && !element.isReadOnly() && !element.data('cke-realelement') && (element.getAttribute('class') == "alt"))
          return {lemmaItem : CKEDITOR.TRISTATE_OFF};
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
                validate: CKEDITOR.dialog.validate.functions(function(value) {
                  var regex1 = /^[^\s\n\t.,!?:;\/|\\'"()\[\]-]+$/
                  var regex2 = /^\D.+$/;
                  return (regex1.test(value) && regex2.test(value));
                }, "Display this always!"),   // !!! Change

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
                label: 'Load Match',
                disabled: false,
                onClick: function() {
                  var dialog = this.getDialog();
                  var match  = dialog.getContentElement
                                          ("tab1", "lemma").getValue();
                  $.get('/matches/1', {word: match, text: text}, function() {
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
            element = element.getAscendant('span', true);

          if (!element || (element.getAttribute('class')!="alt") || element.data('cke-realelement')) {
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
          var match = '';
          var data = {};
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

          // !!! Change after changing this in selectword.
          $.get('/matches/1', { word: match, text: text }, function(data) {
            // Use Match Controller's show to display match in editing header
          }, "script");

        }
      };
    });   
  }
});

