# ruby encoding: utf-8

# *** All texts in the TEXTS array will be converted for the given LANGuage ***
# *** Dictionary conversion at the bottom of the file
TEXTS = [1]
LANG = "en"

TEXTS.each do |t|
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
        # new_phr = Phrase.create(text_id: text, term: term, definition: defin)
          phrases[i-1] = "#{i-1} - #{term}: #{defin}"
        end
      end
    end
  end
  puts phrases[1309]


  File.open("#{Rails.root}/db/conversion/import/#{t}.xml",'r') do |file|
    file.gets # Ignore the first line
    cnt = 0
    while (line = file.gets) && (cnt < 30) do
      cnt = cnt + 1
      # Start with poem line replacments
      line.gsub!(/<l>/,'')
      line.gsub!(/<\/l>/,'<br>')
      line.gsub!(/<lg>/,'<p>')
      line.gsub!(/<\/lg>/,'</p>')

      # Next, take care of the phrases
      while /<term type=\"(?<type>[^\"]+)\" n=\"(?<num>[^\"]+)\">/ =~ line
        phrase = phrases[num]
        puts "#{num} - #{phrases[num.to_i]}"

        if phrase.nil?    # Shouldn't happen
          beg = "<span class=\"error\">"
        else
          beg = "<span id=\"#{phrase}\" class=\"phrase\">"
        end

        line.sub!(/<term[^<]+>/,beg)
        line.sub!(/<\/term>/,'</span>')
      end
    end
  end
  puts phrases[1309]

end
#puts phrases[1309]
#puts phrases[979]
