class DefinitionsController < ApplicationController
  before_action :signed_in_user

  def new
    respond_to do |format|
      format.js {
        @text = Text.find_by_id(params[:text])
        @match_string = params[:str]
        @definition = @text.definitions.new(term: @match_string)
      }
    end
  end

  def create
    respond_to do |format|
      format.js {
        @text_id = params[:definition][:text_id]
        @text = Text.find_by_id(@text_id)
        @match_list = params[:definition][:hits]
        @definition = @text.definitions.build(definition_params)
        if (valid_match? && @definition.save)
          update_matches(params[:definition][:hits])
          flash.now[:success] = "Definition created!"
        else
          render 'new'
        end
      }
    end
  end

  def edit
    respond_to do |format|
      format.js {
        @definition = Definition.find_by_id(params[:id])
        @text_id = params[:text]
      }
    end
  end

  def update
    respond_to do |format|
      format.js {
        @text_id = params[:definition][:editing_text_id] # Need for add_to_gloss
        @match_list = params[:definition][:hits]
        @definition = Definition.find(params[:id])
        @definition.assign_attributes(definition_params)
        if (valid_match? && @definition.save)
          update_matches(params[:definition][:hits])  
          flash.now[:success] = "Definition updated!"
          render 'edit'
        else
          @match_string = params[:definition][:hits]  # Maintain edited list
          render 'edit'
        end
      }
    end
  end

  def close
    respond_to do |format|
      format.js {
        @definition = Definition.find_by_id(params[:id])
        @text_id = params[:text]   # Necessary for add_to_gloss to function
        # Will close edit form and discard any unsaved changes.
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
        @text_id = @definition.text_id       # Needed for add_to_gloss form.
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

      old_matches = @definition.matches.pluck(:word)
      new_matches = @match_list    # Converted to array in valid_match

      not_modified = new_matches & old_matches

      not_modified.each do |w|
        new_matches.delete(w)
        old_matches.delete(w)
      end

      new_matches.each do |w|
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

    # Checks for valid matches.
    # Converts @match_list to an array of strings
    def valid_match?
      @match_list = @match_list.gsub(/[\n\t]/,'').split(' ').uniq
      if (@match_list.length > 0)
        true
      else
        @definition.valid?
        @definition.errors.add(:hits, 
                                  "list must contain at least one valid match.")
        false
      end
    end
end
