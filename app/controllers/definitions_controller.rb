class DefinitionsController < ApplicationController
  before_action :signed_in_user

  # Likely will need @editing_def = @text.definitions.build somewhere

  def create
    @text = Text.find_by_id(params[:text])
    @definition = @text.definitions.build(definition_params)
    if @definition.save
      # flash[:success] = "Definition saved!"  # Probably not needed
      # next need to create matches = flash.now[:error] for 
      # redirect or render
    else
      # flash.now[...]
      # render something
    end
  end
    
  def update
    respond_to do |format|
      format.js {
        definition = Definition.find_by_id(params[:id])
        definition.update_attributes({term: params[:term], lex_class: params[:lex], definition: params[:defin]}) 
        # Update matches
        update_matches(definition,params[:list])
        # !!! This should redirect to matches show to update (otherwise, next and previous buttons will return bad data if no other word is clicked on first).
      }
    end
  end

  def destroy
    # !!! Obviously need to get text here somehow...
    @definition = @text.definition.find_by_id(params[:id])
    # !!! Make sure its not nil
    @definition.destroy
    # !!! Finish render...
  end



  private

    def definition_params
      params.require(:definition).permit(:term, :lex_class, :definition)
    end



    def update_matches(definition, list)
      # Protect against numeric matches in the list! Destroys data. !!!
  
      old_w = definition.matches.pluck(:word)
      new_w = list.split(' ');

      not_modified = new_w & old_w  # Matches present in both lists are fine

      not_modified.each do |w|
        new_w.delete(w)             # This is now a list of matches to add
        old_w.delete(w)             # This is now a list of matches to delete
      end

      new_w.each do |w|
        definition.matches.create(word: w, text_id: definition.text_id)
      end

      old_w.each do |w|
        Match.find_by_word_and_text_id(w, definition.text_id).destroy
      end
    end

end
