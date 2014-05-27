CKEDITOR.plugins.add('verse',
{
  init: function(editor) {
    var iconPath = this.path + 'images/icon.png';

    editor.addCommand('markVerse', {
      exec: function(editor) {
        var style = new CKEDITOR.style({ attributes: {class: "verse"} });
        editor.applyStyle(style);
      }
    });

    editor.ui.addButton( 'Verse', {
      label: 'Mark Verse',
      title: 'Right justify the selected verse number.',
      command: 'markVerse',
      icon: iconPath
    });
  }
});
