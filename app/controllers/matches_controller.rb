class MatchesController < ApplicationController
  before_action :signed_in_user


  def create
  end

  def show
    # Something like this? !!!
    # @dict_entries = @text.entries    .paginate(page: params[:page])
    # @gloss_entries = @text.entries    .paginate(page: params[:page])
    get_editing_matches(params[:word], params[:text])
    respond_to do |format|
      format.js
    end
  end

  def edit
  end

  def update
  end

  def destroy
  end

  private

  def get_editing_matches(word, text)
    @found = false
    @matches = {}
    @definitions = {}

    lookup_matches(word, text)

    if @matches.length > 0
      @found = true
    else
      lookup_matches(word, nil)
    end
  end

  def lookup_matches(word, text)
    raw = Match.where("word = ? AND text_id = ?", word, text).
                                          pluck(:id, :word, :definition_id)
    #raw = Match.where(word:word, text_id:text).pluck(:id,:word,:definition_id)
    raw.each do |m|
      @matches[m[0]] = [m[1],m[2]]
    end

    (1..word.length).each do |i|
      str = word[0,i]+"*"
      raw = Match.where("word = ? AND text_id = ?", str, text).
                                            pluck(:id, :word, :definition_id)
      #raw = Match.where(word:str, text_id:text).pluck(:id,:word,:definition_id)
      raw.each do |m|
        @matches[m[0]] = [m[1],m[2]]
      end
    end

    if @matches.length > 0
      get_match_definitions(text)
    end
  end

  def get_match_definitions(text)
    @matches.each do |m|
      @definitions[m[1][1]] = []
    end

    @definitions.each do |d|
      def_id = d[0]
      definition = Definition.find_by_id(def_id)
      if definition
        all_def_matches = Match.where("definition_id = ?", def_id).
                                                pluck(:word).join(' ')
       #all_def_matches=Match.where(definition_id:def_id).pluck(:word).join(' ')
        @definitions[def_id] = [definition.term, definition.lex_class, definition.definition, all_def_matches]
      else
        @definitions.delete(def_id)
      end
    end
  end

end
