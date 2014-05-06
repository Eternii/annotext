CKEDITOR.plugins.add('savetext',
{
  init: function(editor) {
    editor.addCommand('savetext', {
      exec: function(editor) {
        var content = editor.document.getBody().getHtml();

        $.ajax({
          type: 'PATCH',
          url: '/texts/' + text + '/save',
          data: { content: content },
          dataType: "json"
        })
        .fail(function(data) {
          $("#save-failure").css('visibility', 'visible');
          $("#save-failure").fadeOut(10000, function() {
            $(this).css({ 'display': 'block', 'visibility': 'hidden' });
          });
          alert("There has been an error in saving the text!");
        })
        .done(function(data) {
          $("#save-success").css('visibility', 'visible');
          $("#save-success").fadeOut(10000, function() {
            $(this).css({ 'display': 'block', 'visibility': 'hidden' });
          });
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
