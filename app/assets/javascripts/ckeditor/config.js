/* Name:          config.js
 * Called by:     Initializing CKEditor.
 * Parameters:    config
 * Returns:       Nothing. (Modifies config for each editor instance.)
 * Explanation:
 *   This config file contains the configuration information for both CKEditor
 * instances in the Editor. Both of these instances are located in the Text
 * Edit page (aka the Editor). The "editor" instance is located in the "Markup"
 * tab and is where the text is modified, phrases and lemmas are added, and
 * definitions are created or loaded into the text's glossary. The "about-editor"
 * instance is located in the "About the Text" tab and contains information about
 * the specific text that is displayed to the user when he or she clicks the 
 * "About This Text" link when viewing the text.
 *   There are several config options that are consistent across both CKEditors,
 * but the "editor" is much more complicated than the "about-editor" and thus
 * contains many more buttons and configuration details.
 *   The only plugin shared by both editors is the "sourcedialog" plugin, which
 * is the only declared external plugin contained herein. In order for the main
 * "editor" to resize with the page, config.height must be hacked to have a value
 * of 100%. This shouldn't work, according to the CKEditor docs, but it does and
 * is the only way to ensure that the editor matches its container size. However,
 * this causes the "Source" button to render the editor incorrectly. This is
 * solved by using the "Sourcedialog" plugin instead, which loads the HTML source
 * of the document in a dialog popup instead of the editor itself.
 *   Finally, the style list in the "editor" should contain most of the styles
 * listed in stylesheets/ckeditor/contents2.css.scss, displayed in the editor,
 * and those in stylesheets/ckeditor/custom.css.scss, which are used when
 * displaying to the user. The .phrase and .alt styles should not be displayed
 * by the list, however, as these are added specifically by certain plugins.
 */
CKEDITOR.editorConfig = function( config ) {
  config.language = 'en';
  config.uiColor = '#AADC6E';
  config.enterMode = CKEDITOR.ENTER_BR;
  config.contentsCss = [CKEDITOR.basePath + 'contents.css',
                        CKEDITOR.basePath + 'contents2.css' ];

  // This isn't supposed to work for percents. But it does. And it's necessary.
  config.height = '100%';

  /* ******************************************************************** *
   *                   'editor' config - Markup tab                       *
   * ******************************************************************** */
  if (this.name == 'editor') {
    // element (class){style}[attribute - !=Required]
    config.extraAllowedContent = 'span(*){*}[*]; a(*)[!href,media,target]';
    config.extraPlugins =
      'selectword,lemma,phrase,linkmedia,savetext,deletemarkup,multistart,multicont,note,sourcedialog';
    config.toolbar = [
      [ 'Sourcedialog', '-', 'SaveText' ],
      [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ],
      [ 'Find','Replace'],
      [ 'Bold', 'Italic', 'Underline','Strike' ],
      [ 'Blockquote','Styles'],
      '/',
      [ 'Lemma', '-', 'Phrase'],
      [ 'MultiStart', '-', 'MultiCont' ],
      [ 'DeleteMarkup' ],
      [ 'LinkMedia' ],
      [ 'Note' ]
    ];
    // Styles for the style dropdown menu.
    // WARNING: These should correspond with ckeditor/contents2.css and custom.css
    config.stylesSet = [
      { name: 'Header 1', element: 'h1' },
      { name: 'Header 2', element: 'h2' },
      { name: 'Header 3', element: 'h3' }
    ];
  }
  

  /* ******************************************************************** *
   *             'about-editor' config - About the Text tab               *
   * ******************************************************************** */
  if (this.name == 'about-editor') {
    config.extraPlugins = 'saveabout,sourcedialog';
    config.toolbar = [
      [ 'Sourcedialog', '-', 'SaveAbout' ],
      [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ],
      [ 'Find','Replace'],
      [ 'Bold', 'Italic', 'Underline','Strike' ]
    ];
  }
};

