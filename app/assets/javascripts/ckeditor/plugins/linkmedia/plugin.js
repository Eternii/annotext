CKEDITOR.plugins.add('linkmedia',
{
  init: function(editor) {
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('linkmediaDialog', new CKEDITOR.dialogCommand('linkmediaDialog'));

    editor.ui.addButton('LinkMedia', {
      label: 'Link Media',
      command: 'linkmediaDialog',
      icon: iconPath
    });
/*   !!!
    if (editor.contextMenu) {
      editor.addMenuGroup('annotextGroup');
      editor.addMenuItem('linkmediaItem', {
        label: 'Edit Media Link',
        icon: iconPath,
        command: 'linkmediaDialog',
        group: 'annotextGroup',
      });
      editor.contextMenu.addListener(function(element) {
        if (element)
          element = element.getAscendant('span', true);
        if (element && !element.isReadOnly() && !element.data('cke-realelement') && (element.getAttribute('class') == "media"))
          return { linkmediaItem : CKEDITOR.TRISTATE_OFF };
        return null;
      });
    }
*/
    CKEDITOR.dialog.add('linkmediaDialog', function(editor) {
      return {
        title: 'Media Properties',
        minWidth: 400,
        minHeight: 200,
        contents:
        [
          {
            id: 'tab1',
            label: 'Settings',
            elements:
            [
              {
                type: 'html',
                html: 'Please enter the URL of the media.'
              },
              {
                type: 'text',
                id: 'url',
                label: 'URL',
                validate: CKEDITOR.dialog.validate.notEmpty('You must enter a URL.'),
                required: true,
                setup: function(element) {
                  this.setValue(element.getAttribute("href"));
                },
                commit: function(data) {
                  data.url = this.getValue();
                }
              },
              {
                type: 'select',
                id: 'mediaType',
                label: 'Media Type',
                items:
                [
                  [ 'Audio', 'audio' ],
                  [ 'Image', 'image' ],
                  [ 'Video', 'video' ]
                ],
                'default': 'audio',
                setup: function(element) {
                  if (element.getAttribute('media') == "image")
                    this.setValue('image');
                  else if (element.getAttribute('media') == "video")
                    this.setValue('video');
                  else
                    this.setValue('audio');
                },
                commit: function(data) {
                  data.mediaType = this.getValue();
                }
              }
            ]
          }
        ],
        onShow: function() {
          var sel = editor.getSelection();
          var element = sel.getStartElement();

          if (element)
            element = element.getAscendant('a', true);

          if (!element || element.getName() != 'a' || element.getAttribute('media') == "" || element.data('cke-realelement')) {
            element = editor.document.createElement('a');
            this.insertMode = true;
          }
          else
            this.insertMode = false;

          this.element = element;

          this.setupContent(this.element);
        },
        onOk: function() {
          var dialog = this;
          var data = {};
          var link = this.element;
          //var link = editor.document.createElement('a');

          this.commitContent(data);

          link.setAttribute('href', data.url);

          link.setAttribute('target', '_blank');

          switch(data.mediaType) {
            case 'audio':
              link.setAttribute('class', 'media glyphicon glyphicon-music');
              link.setAttribute('media', 'audio');
              link.setHtml("[Audio]");
            break;
            case 'image':
              link.setAttribute('class', 'media glyphicon glyphicon-camera');
              link.setAttribute('media', 'image');
              link.setHtml("[Image]");
            break;
            case 'video':
              link.setAttribute('class', 'media glyphicon glyphicon-film');
              link.setAttribute('media', 'video');
              link.setHtml("[Video]");
            break;
          }

          if ( this.insertMode)
            editor.insertElement(link);
        }
      };
    });
  }
});
