module TextsHelper
  def get_gloss(text)
    self.matches = Matches.find_by_text_id(text)
    self.phrases = Phrases.find_by_text_id(text)
    self.definitions = Definitions.find_by_text_id(text)
  end

  def matches=(matches)
    @matches = matches
  end

  #def matches  # Unnessary, right?
  #  @matches
  #end

  def phrases=(phrases)
    @phrases = phrases
  end

  def get_phrase(phrase)
    
  end

  def get_match(match)
    
  end
end
