# ruby encoding: utf-8

# *** All texts in the TEXTS array will be converted for the given LANGuage ***
# *** Dictionary conversion at the bottom of the file
TEXTS = [1]
LANG = "en"

# Run with rake db:seed (or created alongside the db with db:setup)
# Put glossaries and texts into the db/conversion/import directory.
# Each converted text is saved to db/conversion/export/#{text}.txt
# The texts should be manually copied to app/assets/texts if satisfactory.

TEXTS.each do |t|
  text = Text.create(title: "Replace", author: "???", user_id: 1, position: Text.all.pluck(:position).max+1, released: false)
  text = text.id

  phrases = {}

  # First loop through the glossary.
  File.open("#{Rails.root}/db/conversion/import/#{t}-#{LANG}.xml",'r') do |file|
    cnt = 0
    line = file.gets    # First line should be ignored - defines old css
    line = file.gets
    gloss = line.split('/><')
    (0..(gloss.length-1)).each do |i|
      entry = String.new(gloss[i])
      /f=\"(?<term>[^\"]+)\"/ =~ entry
      /d=\"(?<defin>[^\"]+)\"/ =~ entry
      /g=\"(?<type>[^\"]+)\"/ =~ entry
      term  = (term==nil ? "" : term)
      type  = (type==nil ? "" : type)
      defin = (defin==nil ? "" : defin)

      pos = entry.rindex(/m\d+=/)
      if (pos == nil) then
        if (term != "") 
          new_phr = Phrase.create(text_id: text, term: term, definition: defin)
          phrases[i-1] = new_phr.id
        end
      else
        # Find match num. Form is m#=... Assume two digits max.
        num = entry[pos+1..pos+2].to_i
        def_id = 0
        (0..num).each do |j|
          m = /m#{j}=\"(?<de>[^\"]+)\"/.match(entry)
          if (j==0) # Add a definition the first time
            new_def = Definition.create(term: term, lex_class: type, definition: defin, text_id: text)
            def_id = new_def.id
          end
          if (m != nil) then
            m = m[:de]
            m.downcase!
#
# Commented out lines made irrelevant by removal of unique word-text index
#
#            match_id = Match.find_by_word_and_text_id(m, text)
#            if (match_id == nil) then
              Match.create(word: m, text_id: text, definition_id: def_id)

#            else    # Duplicate - Deal with it by appending digits to the end
#              k = 2
#              until (Match.find_by_word_and_text_id("#{m}#{k}",text) == nil) do
#                k += 1
#              end
#              Match.create(word: "#{m}#{k}", text_id: text, definition_id: def_id)
#            end
          end
        end
      end
    end
  end

  puts "Glossy for text #{t} is complete. Converting actual text..."

  # Loop through the text itself.
  File.open("#{Rails.root}/db/conversion/import/#{t}.xml",'r') do |file|
    File.open("#{Rails.root}/app/assets/texts/#{text}.txt",'w') do |output|
      file.gets; # Ignore the first line
      var phrase;
      var beg;
      var line;

      while (line = file.gets) do
        # Start with poem line replacments
        line.gsub!(/<l>/,'')
        line.gsub!(/<\/l>/,'<br>')
        line.gsub!(/<lg>/,'<p>')
        line.gsub!(/<\/lg>/,'</p>')

        # Next, take care of the phrases
        while /<term type=\"(?<type>[^\"]+)\" n=\"(?<num>[^\"]+)\">/ =~ line
          phrase = phrases[num.to_i]

          if phrase.nil?    # Shouldn't happen
            beg = "<span class=\"error\">"
          else
            beg = "<span class=\"phrase\" phrase=\"#{phrase}\">"
          end

          line.sub!(/<term[^<]+>/,beg)
          line.sub!(/<\/term>/,'</span>')
        end

        # Then, convert the lemma / alternate forms. No validation.
        while /<distinct type=\"(?<type>[^\"]+)\" n=\"(?<word>[^\"]+)\">/ =~ line
        if word.nil?
          beg = "<span class=\"error\">"
        else
          beg = "<span class=\"alt\" match=\"#{word}\">"
        end

          line.sub!(/<distinct[^<]+>/,beg)
          line.sub!(/<\/distinct>/,'</span>')
        end

        # Need, remove and/or replace other extraneous details.
        line.gsub!(/<head>/,'<span class="title">')
        line.gsub!(/<\/head>/,'</span><br>')

        line.gsub!(/<author>/,'<span class="author">')
        line.gsub!(/<\/author>/,'</span><br>')

        line.gsub!(/<body>/,'')
        line.gsub!(/<\/body>/,'')     

        line.gsub!(/<\?xml[^>]*>/,'')
        line.gsub!(/<\/?tei[^>]*>/i,'')
        line.gsub!(/<\/?text>/,'')

        # Finally, check for verse numbers (6 spaces is arbitrary)
        if /\s{6,}(?<verse>\d+)<br>/ =~ line
          beg = "<span class=\"verse\">#{verse}</span><br>"
          line.gsub!(/\s{6,}\d+<br>/,beg)
        end

        # And check for text-specific issues
        if t.to_i == 1
          line.gsub!(/__________/,"__________<br>")
        end

        # Write to file
        output.puts line
      end
    end
  end
end
