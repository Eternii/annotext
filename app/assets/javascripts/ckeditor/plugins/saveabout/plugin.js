CKEDITOR.plugins.add('saveabout',
{
  init: function(editor) {
    editor.addCommand('saveabout', {
      exec: function(editor) {
        var content = editor.document.getBody().getHtml();

        $.ajax({
          type: 'PATCH',
          url: '/texts/' + text + '/save_about',
          data: { content: content },
          dataType: "json"
        }).done(function(data) {
          alert("Success");   // !!! Change this to give good feedback.
        });
      }
    });

    editor.ui.addButton('SaveAbout', {
      label: 'Save',
      command: 'saveabout',
      // Image from http://findicons.com/icon/85483/3_disc?width=16
      icon: this.path + 'images/icon.png'
    });
  }
});
