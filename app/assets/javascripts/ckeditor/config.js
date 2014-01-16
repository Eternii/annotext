CKEDITOR.editorConfig = function( config ) {
    config.uiColor = '#AADC6E';
    config.height = 400;
    config.extraAllowedContent = 'span(*){*}[*]';
    //config.language => 'de';  // Not working... but that's probably ok.
    config.extraPlugins = 'selectword,lemma,phrase';
    config.toolbar = [
      [ 'Source', '-', 'Bold', 'Italic', 'Lemma', 'Phrase' ]
    ];
    
    //config.extraPlugins = 'selectword,lemma';
    
};
