module ScriptsHelper
  private
    def definition_script
      @missing = []   # Includes all words that do not find a glossary match

      @document = Nokogiri::HTML.parse(@content)
      @document = @document.at('body')
      @document.css("span").each do |node|
        node.remove if node["class"] == "phrase"
        node.remove if node["class"] == "alt"
        node.remove if node["class"] == "verse"
      end
      @document.css("p").each do |node|
        node.add_next_sibling("<br>")
      end
      @document.css("br").each { |node| node.replace("\n") }

      @document = @document.inner_text

      @words = @document.split(/[[:space:]]/)
      @words.uniq!

      check_for_definitions
    end

    def lemma_script
      @missing = []
      @words = []
      @lemmas = {}
      @lemma = true

      @document = Nokogiri::HTML.parse(@content)
      @document = @document.at('body')
      @document.css("span").each do |node|
        if node["class"] == "alt"
          @words.push(node["match"])
          @lemmas[node["match"]] = node.text
        end
      end

      @words.uniq!
      check_for_definitions
    end

    def phrase_script
      @missing = []
      @ids = []
      @phrases = {}

      @document = Nokogiri::HTML.parse(@content)
      @document = @document.at('body')
      @document.css("span").each do |node|
        if node["class"] == "phrase"
          @ids.push(node["phrase"])
          @phrases[node["phrase"]] = node.text
        end
      end

      @ids.each do |id|
        if !Phrase.find_by_id(id)
          @missing.push("#{id} - #{@phrases[id]}")
        end
      end
    end


    # Called from definition_script and lemma_script
    # Assumes that @missing = []
    # Assumes a @words array as well
    def check_for_definitions
      @words.each do |word|
        @lemma ? lemma = " - #{@lemmas[word]}" : lemma = ""

        # Strip characters - mimics trimWordLowerCase in texts.js
        regex = /[\u200B-\u200D\uFEFF\u00A0]/
        word.gsub!(regex, "")
        regex = /^[.,!¡?¿:;\/|\\'"“”‘’‚„«»‹›()\[\]\-_]+|[.,!¡?¿:;\/|\\'"“”‘’‚„«»‹›()\[\]\-_]+$/
        word.gsub!(regex, "")
  
        next if word.length == 0
    
        # Convert to lowercase
        word = word.mb_chars.downcase.to_s
        current_word = word
        
        while word.length > 0 do
          if Match.find_by_word_and_text_id(word, @text)
            break
          else
            if word.length == 1
              @missing.push("#{current_word}#{lemma}")
              break
            else
              if word.last == "*"
                word.chomp!("*")      # Remove wildcard character, if present
                word = word[0..-2]    # Remove last character
              end
              word << "*"           # Add wildcard character
            end
          end
        end
      end
    end
end
