/* Name:          linkmedia
 * Called by:     Clicking the "Link Media" button in the CKEditor.
 * Parameters:    N/A
 * Returns:       Nothing. (Adds a new media link, or modifies the link.)
 * Explanation:
 *   This CKEDitor plugin is called whenever the user clicks the "Link Media"
 * button on the CKEditor. It creates a dialog popup, which is loaded with a
 * list of the media that the user has uploaded (via the "Media" tab on the
 * Editor page). If the user is modifying a modifying a previously created
 * link, then that linked is pre-selected in the list. Otherwise, the first
 * media object in the list is selected. This list is created by going to the
 * server and loading a list of media associated with the text being edited.
 * This is done everytime the button is clicked to ensure the data is always
 * updated and correct.
 *   When the user selects a piece of media and accepts the dialog window,
 * that piece of media is added as a link to the text. This media appears
 * as a link with the text [media type], where "media type" is the type of
 * media represented by media. Note that on display for the end user, this
 * text is replaced by the applicable icon (e.g. camera, film, music note).
 * Furthermore, the link is given a title of the form "<media title> : <media
 * description>," which displays as a tooltip for the user in the viewer.
 */
CKEDITOR.plugins.add('linkmedia',
{
  init: function(editor) {
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('linkmediaDialog',
                                new CKEDITOR.dialogCommand('linkmediaDialog'));

    editor.ui.addButton('LinkMedia', {
      label: 'Link Media',
      command: 'linkmediaDialog',
      icon: iconPath
    });

    CKEDITOR.dialog.add('linkmediaDialog', function(editor) {
      return {
        title: 'Media Properties',
        minWidth: 400,
        minHeight: 200,
        contents:
        [
          {
            id: 'general',
            label: 'Settings',
            elements:
            [
              {
                type: 'html',
                html: 'Please select the media you wish to insert.'
              },
              {
                type: 'select',
                id: 'media',
                label: 'Media',
                items:
                [
                ],
                required: true,
                setup: function(data) {
                  var element = $('#' + this.getInputElement().$.id);
                  element.empty();

                  $.each(data.list, function(index, value) {
                    element[0].options[element[0].options.length] = 
                                            new Option(value[1], index);
                  });
                },
                commit: function(data) {
                  data.index = this.getValue();
                }
              }
            ]
          }
        ],

        onShow: function() {
          var sel = editor.getSelection();
          var element = sel.getStartElement();
          var dialog = this;

          if (element)
            element = element.getAscendant('a', true);

          if (!element || element.getName() != 'a' 
                       || element.getAttribute('media') == "" 
                       || element.data('cke-realelement')) {
            element = editor.document.createElement('a');
            this.insertMode = true;
          }
          else {
            this.insertMode = false;
            // !!! Finish this: this.setupContent( ??? );
          }

          this.element = element;

          $.get('/media', { text: text }, function(data) {
            dialog.setupContent(data);
            dialog.media = data.list;
          }, "json");
        },

        onOk: function() {
          var dialog = this;
          var data = {};
          var link = this.element;
          var media = [];

          this.commitContent(data);
          media = this.media[data.index];
          // media format = [id, title, description, type]

          link.setAttribute('href', '/media/' + media[0].toString());

          link.setAttribute('target', '_blank');

          link.setAttribute('title', media[1] + ": " + media[2]);

          switch(media[3]) {
            case 'audio':
            case 'audio-link':
              link.setAttribute('class', 'media glyphicon glyphicon-music');
              link.setAttribute('media', 'audio');
              link.setHtml("[Audio - " + media[1] + "]");
            break;
            case 'image':
            case 'image-link':
              link.setAttribute('class', 'media glyphicon glyphicon-camera');
              link.setAttribute('media', 'image');
              link.setHtml("[Image - " + media[1] + "]");
            break;
            case 'video':
            case 'video-link':
              link.setAttribute('class', 'media glyphicon glyphicon-film');
              link.setAttribute('media', 'video');
              link.setHtml("[Video - " + media[1] + "]");
            break;
          }

          if ( this.insertMode )
            editor.insertElement(link);
        }
      };
    });
  }
});
