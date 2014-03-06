class DefinitionsController < ApplicationController
  before_action :signed_in_user

  # Likely will need @editing_def = @text.definitions.build somewhere

  def new
    respond_to do |format|
      format.js {
        @text = Text.find_by_id(params[:text])
        @definition = @text.definitions.new
      }
    end
  end

  def create
    logger.debug "   --->   Text id: #{params[:definition][:text_id]}"
    @text = Text.find_by_id(params[:definition][:text_id])
    @definition = @text.definitions.build(definition_params)
    if @definition.save
      update_matches(params[:definition][:hits])
      flash.now[:success] = "Definition created!"
      render 'edit'
    else
      render 'edit'
    end
  end

  def edit
    respond_to do |format|
      format.js {
        @definition = Definition.find_by_id(params[:id])
      }
    end
  end
    
  def update
    respond_to do |format|
      format.js {
        @definition = Definition.find(params[:id])
        if @definition.update_attributes(definition_params)
          flash.now[:success] = "Definition updated!"
          update_matches(params[:definition][:hits])  
          # update_matches will send flash errors on failed creation
          render 'edit'
        else
          render 'edit'   # Errors via 'shared/error_messages'
        end
      }
    end
  end

  def destroy
    respond_to do |format|
      format.js {   # !!! Deal with exceptation at all? Or just let it go?
        @definition = Definition.find(params[:id])
        @definition.destroy
      }
    end
  end

  def copy_to_gloss
    respond_to do |format|
      format.js {
        text_id = params[:text_id]
        @definition = Definition.find(params[:id])
        @new_def = @definition.transplant(text_id)
        if !@new_def
          render :nothing => true   # !!! Change this to render errors
        end
      }
    end
  end

  def copy_to_dict
    respond_to do |format|
      format.js {
        @definition = Definition.find(params[:id])
        @new_def = @definition.transplant(nil)
        if !@new_def
          render :nothing => true   # !!! Change this to render errors
        end
      }
    end
  end


  private

    def definition_params
      params.require(:definition).permit(:term, :lex_class, :definition)
    end


    # For the given definition, update its matches in the glossary/dictionary.
    # To do so, first get the list of matches from the database and the list
    # from the definition editor. Compare the two lists, removing the common
    # matches from the lists. Then, for each new match present in the editor,
    # add them to the database. Likewise, for each match present in the
    # database (but not in the editor), remove them from the database.
    def update_matches(list)
      error_str = ''

      # old_matches = @definition.hits.split(' ');  !!! fix hits?
      old_matches = @definition.matches.pluck(:word)
      new_matches = list.gsub(/[\n\t.,!?:;\/|\\'"()\[\]-]/,'').split(' ');

      # Protect against numeric matches in the list! Destroys data. !!!
  
      not_modified = new_matches & old_matches

      not_modified.each do |w|
        new_matches.delete(w)
        old_matches.delete(w)
      end

      new_matches.each do |w|
        # !!! Need to validate and not add new matches if duplicates !!!
        match = @definition.matches.build(word: w, text_id: @definition.text_id)
        if !(match.save)
          error_str <<  "Error: #{w} match could not be created. "
        end
      end

      if (error_str != '')
        flash.now[:danger] = error_str
      end

      old_matches.each do |w|
        Match.find_by_word_and_text_id(w, @definition.text_id).destroy
      end
    end

end
