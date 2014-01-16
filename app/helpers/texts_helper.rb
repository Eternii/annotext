module TextsHelper
  def get_glossary(text)
    get_matches(text)
    get_definitions(text)
    get_phrases(text)
  end

  def get_matches(text)
    @matches = {}
    raw = Match.where("text_id = ?", text).pluck(:word, :definition_id)
    raw.each do |m|
      if @matches[m[0]]
        @matches[m[0]].push(m[1])
      else
        @matches[m[0]] = [m[1]]
      end
    end
  end

  def get_definitions(text)
    @definitions = {}
    raw = Definition.where("text_id = ?", text).
                                pluck(:id, :term, :lex_class, :definition)
    raw.each do |d|
      @definitions[d[0]] = [d[1],d[2],d[3]]
    end
  end

  def get_phrases(text)
    @phrases = {}
    raw = Phrase.where("text_id = ?", text).pluck(:id, :term, :definition)
    raw.each do |p|
      @phrases[p[0]] = [p[1],p[2]]
    end
  end
end
