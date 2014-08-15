# encoding: UTF-8

# * ************************************************************************* *
# *  See Tech Notes for more information about this script and its defaults.  *
# * ************************************************************************* *

# *** All texts in the TEXTS array will be converted for the given LANGuage ***
# LANGuage is for old file names, e.g. 1-en.xml is the text 1 english glossary.
TEXTS = []
#TEXTS = [1,2,3,24,25,27,28,29,30,31]
LANG = "en"

# *** Dictionary conversion at the bottom of the file will run if true ***
# The dictionary file that will be converted is de-en.xml
CONVERT_DICTIONARY = true


# Run with rake db:seed (or create alongside the db with db:setup)
# Put glossaries and texts into the db/conversion/import directory.
# Each converted text is saved to  app/assets/text/#{new_id}/#{new_id}.html
# Each converted text also creates app/assets/text/#{new_id}/about.html

TEXTS.each do |t|
  title = get_title_by_text(t)
  author = get_author_by_text(t)
  text = Text.create(title: title, author: author, user_id: 1,
                     position: Text.all.pluck(:position).max+1, released: false)
  text = text.id

  phrases = {}

  puts "Beginning glossary conversion for text #{t}..."

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
            new_def = Definition.create(term: term, lex_class: type,
                                              definition: defin, text_id: text)
            def_id = new_def.id
          end
          if (m != nil) then
            m = m[:de]
            m = m.mb_chars.downcase.to_s
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

  # Create a new text directory, media directory, and about file
  location = "#{Rails.root}/app/assets/texts/#{text}"
  Dir.mkdir("#{location}")
  Dir.mkdir("#{location}/media")
  File.new("#{location}/about.html", "w+")

  # Loop through the text itself.
  File.open("#{Rails.root}/db/conversion/import/#{t}.xml",'r') do |file|
    File.open("#{location}/#{text}.html",'w+') do |output|
      file.gets; # Ignore the first line
      phrase = nil;
      beg = nil;
      line = nil;
      str = "";

      while (line = file.gets) do
        str = str + line
      end
      
      line = str

      # Start with line replacments
      line.gsub!(/<l>/,'')
      line.gsub!(/<\/l>/,'<br>')
      line.gsub!(/<lg>/,'')
      line.gsub!(/<\/lg>/,'<br>')
      line.gsub!(/<p>/,'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')
      line.gsub!(/<\/p>/,'<br><br>')

      # Remove <div type="section"> and <div type="chapter">.
      # These should be the only divs present in the old texts.
      # This must be done before adding <div> for styling below.
      line.gsub!(/<div[^>]*>/,'')
      line.gsub!(/<\/div>/,'<br>')

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

      # Next, remove and/or replace other extraneous details.
      line.gsub!(/<head>/,'<div style="text-align: center;"><strong><span class="xlarge_text">')
      line.gsub!(/<\/head>/,'</span></strong></div>')

      line.gsub!(/<author>/,'<div style="text-align: center;"><em><span class="medium_text">')
      line.gsub!(/<\/author>/,'</span></em></div>')

      # Convert bold and italics. $1 is the text between the tags.
      line.gsub!(/<hi rend="bold">(.*?)<\/hi>/m) { |s|
        s = '<strong>' + $1 + '</strong>'
      }

      line.gsub!(/<hi rend="italic">(.*?)<\/hi>/m) { |s|
        s = '<em>' + $1 + '</em>'
      }

      line.gsub!(/<stage>/, '<em>')
      line.gsub!(/<\/stage>/, '</em>');

      line.gsub!(/<body>/,'')
      line.gsub!(/<\/body>/,'')     

      line.gsub!(/<\?xml[^>]*>/,'')
      line.gsub!(/<\/?tei[^>]*>/i,'')
      line.gsub!(/<\/?text>/,'')
      line.gsub!(/<profileDesc>.*?<\/profileDesc>/,"")

      # Finally, check for verse numbers (4 spaces is somewhat arbitrary)
      line.gsub!(/\s{4,}(\d+)<br>/) { |s|
        s = '<span class="verse">' + $1 + '</span><br>'
      }

      # And check for text-specific issues
      if t.to_i == 1
        line.gsub!(/__________/,"__________<br>")
      end

      # Write to file
      output.puts line
    end
  end
end


if CONVERT_DICTIONARY then
  puts "Beginning glossary conversion for dictionary..."

  # First loop through the glossary.
  File.open("#{Rails.root}/db/conversion/import/de-en.xml",'r') do |file|
    cnt = 0
    line = file.gets    # First line should be ignored - defines old css
    line = file.gets    # Second line contains the entire dictionary
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
        # Ignore in dictionary. This is unretrievable.
      else
        # Find match num. Form is m#=... Assume two digits max.
        num = entry[pos+1..pos+2].to_i
        def_id = 0

        # Add each match to the Matches table
        (0..num).each do |j|
          m = /m#{j}=\"(?<de>[^\"]+)\"/.match(entry)
          if (j==0)                     # Create Definition if the first time
            new_def = Definition.create(term: term, lex_class: type,
                                              definition: defin, text_id: nil)
            def_id = new_def.id
          end
          if (m != nil) then            # Create Match
            m = m[:de]
            m = m.mb_chars.downcase.to_s
            Match.create(word: m, text_id: nil, definition_id: def_id)
          end
        end
      end
    end
  end
end


BEGIN {
  def get_title_by_text(t)
    case t
      when 1
        "Faust I"
      when 2
        "Der zerbrochene Krug"
      when 3
        "Die Leiden des jungen Werther"
      when 24
        "Die Soldaten"
      when 25
        "Über das Marionettentheater"
      when 27
        "Der goldne Topf"
      when 28
        "Minna von Barnhelm"
      when 29
        "Drei Märchen: Rotkäppchen, Rumpelstilzchen, Froschkönig"
      when 30
        "Der blonde Eckbert"
      when 31
        "Das Urteil"
      when 34
        "Rat Krespel"
      when 36
        "Bahnwärter Thiel"
      when 37
        "Reitergeschichte"
      when 39
        "Ein Bericht für eine Akademie"
      when 40
        "Ein Hungerkünstler"
      when 41
        "Ein Landarzt"
      when 42
        "Emilia Galotti"
      when 43
        "Novelle"
      when 44
        "Woyzeck"
      when 45
        "Das Erdbeben in Chili"
      when 50
        "Maria Stuart"
      when 54
        "Nathan der Weise"
      when 56
        "Tonio Kröger"
      when 57
        "Der Tod in Venedig"
      when 58
        "Die Verwandlung"
      when 59
        "Frühlingserwachen"
      when 62
        "Hyperion (2. Bd., 2. Buch)"
      when 65
        "Rede des toten Christus vom Weltgebäude herab, dass kein Gott sei"
      when 67
        "Dantons Tod"
      when 69
        "Der hessische Landbote"
      else
        "Title Unknown"
    end
  end

  def get_author_by_text(t)
    case t
      when 1
        "J. W. v. Goethe"
      when 2
        "Heinrich von Kleist"
      when 3
        "J. W. v. Goethe"
      when 24
        "J. M. R. Lenz"
      when 25
        "Heinrich von Kleist"
      when 27
        "E. T. A. Hoffmann"
      when 28
        "G. E. Lessing"
      when 29
        "Brüder Grimm"
      when 30
        "Ludwig Tieck"
      when 31
        "Franz Kafka"
      when 34
        "E. T. A. Hoffmann"
      when 36
        "Gerhart Hauptmann"
      when 37
        "Hugo von Hofmannsthal"
      when 39
        "Franz Kafka"
      when 40
        "Franz Kafka"
      when 41
        "Franz Kafka"
      when 42
        "G. E. Lessing"
      when 43
        "J. W. v. Goethe"
      when 44
        "Georg Büchner"
      when 45
        "Heinrich von Kleist"
      when 50
        "Friedrich Schiller"
      when 54
        "G. E. Lessing"
      when 56
        "Thomas Mann"
      when 57
        "Thomas Mann"
      when 58
        "Franz Kafka"
      when 59
        "Frank Wedekind"
      when 62
        "Friedrich Hölderlin"
      when 65
        "Jean Paul"
      when 67
        "Georg Büchner"
      when 69
        "Georg Büchner"
      else
        "Author Unknown"
    end
  end
}
