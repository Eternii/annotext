CKEDITOR.plugins.add('deletemarkup',
{
  init: function(editor) {
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
