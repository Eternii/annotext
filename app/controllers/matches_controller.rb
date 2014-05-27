class MatchesController < ApplicationController
  before_action :signed_in_user

  def create
  end

  def show
    respond_to do |format|
      format.js {
        @match_string = params[:word]
        @text_id = params[:text]
        get_glossary_matches
        get_dictionary_matches
      }
    end
  end

  def edit
  end

  def update
  end

  def destroy
  end

  private

    def get_glossary_matches
      @gloss_entries = lookup_matches(@match_string, @text_id)
    end

    def get_dictionary_matches
      @dict_entries = lookup_matches(@match_string, nil)
    end

    def lookup_matches(word, text)
      arr = (word.length).downto(1).map { |i| word[0,i] + "*" }
      arr.unshift(word)

      raw = Match.where(word: arr, text_id: text).pluck(:definition_id)
      raw.uniq!

      Definition.where(id: raw)
    end

    def get_match_definitions(text)

      @definitions.each do |d|
        def_id = d[0]
        definition = Definition.find_by_id(def_id)
        if definition
          all_def_matches = Match.where("definition_id = ?", def_id).
                                                  pluck(:word).join(' ')
          @definitions[def_id] = [definition.term, definition.lex_class, 
                                  definition.definition, all_def_matches]
        else
          @definitions.delete(def_id)
        end
      end
    end

end
