CKEDITOR.plugins.add('savetext',
{
  init: function(editor) {
    editor.addCommand('savetext', {
      exec: function(editor) {
        // !!! Pause until complete? setReadOnly
        var content = editor.document.getBody().getHtml();

        $.ajax({
          type: 'PATCH',
          url: '/texts/' + text + '/save',
          data: { content: content },
          dataType: "json"
        }).done(function(data) {
          alert('Success');    // !!! Doesn't do anything...
        });
      }
    });

    editor.ui.addButton('SaveText', {
      label: 'Save Text',
      command: 'savetext',
      // Image from http://findicons.com/icon/85483/3_disc?width=16
      icon: this.path + 'images/icon.png'
    });
  }
});
