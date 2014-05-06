CKEDITOR.plugins.add('deletemarkup',
{
  init: function(editor) {
    // Image from http://findicons.com/icon/237767/edit_delete
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('deleteMarkup', {
      exec: function(editor) {
        var selRange = editor.getSelection();
        var element = selRange.getStartElement();

        if (element) {
          element = element.getAscendantAltOrPhrase(true);

 
         if (element)
          element.remove(true);
        }

      }
    });


    editor.ui.addButton('DeleteMarkup', {
      label: 'Delete Markup',
      command: 'deleteMarkup',
      icon: iconPath
    });
  }
});
