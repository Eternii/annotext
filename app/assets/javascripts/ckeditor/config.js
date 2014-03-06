CKEDITOR.editorConfig = function( config ) {
    config.uiColor = '#AADC6E';
    config.height = 400;
    config.enterMode = CKEDITOR.ENTER_BR;
    // a (class){style}[attribute - !=Required]
    config.extraAllowedContent = 'span(*){*}[*]; a(*)[!href,media,target]';
    config.extraPlugins =
      'selectword,lemma,phrase,linkmedia,savetext,deletemarkup';
    config.toolbar = [
      [ 'Source', '-', 'SaveText' ],
      [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ],
      [ 'Find','Replace'],
      [ 'Bold', 'Italic', 'Underline','Strike' ],
      '/',
      [ 'Lemma', 'Phrase', 'DeleteMarkup' ],
      [ 'LinkMedia' ]
    ];
};
