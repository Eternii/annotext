ENV['RAILS_ENV'] = "development"
require './config/environment.rb'

# *** All texts in the TEXTS array will be converted for the given LANGuage ***
TEXTS = []
LANG = "en"

# Put glossaries and texts into the db/conversion/import directory.
# Each converted text is saved to db/conversion/export/#{text}.txt
# The texts should be manually copied to app/assets/texts if satisfactory.

File.open("#{Rails.root}/db/seeds.rb",'w') do |seeds|

  TEXTS.each do |text|
    # First loop through the glossary.
    File.open("#{Rails.root}/db/conversion/import/#{text}-#{LANG}.xml",'r') do
      cnt = 0
      line = file.gets    # First line should be ignored - defines old css
      line = file.gets
      gloss = line.split('/><')
      (0..(gloss-length-1)).each do |i|
        entry = String.new(gloss[i])
        /f=\"(?<term>[^\"]+)\"/ =~ entry
        /d=\"(?<defin>[^\"]+)\"/ =~ entry
        /g=\"(?<type>[^\"]+)\"/ =~ entry
        term  = (term==nil ? "" : term)
        type  = (type==nil ? "" : type)
        defin = (defin==nil ? "" : defin)

        pos = entry.rindex(/m\d+=/)
        if (pos == nil) then
          puts "Phrase.create(text_id: #{text}, term: #{term}, definition: #{defin}, id_in_text: #{i}})"
        else
          # Find match num. Form is m#=... Assume two digits max.
          num = entry[pos+1..pos+2].to_i
          def_id = 0
          (0..num).each do |j|
            m = /m#{j}=\"(?<de>[^\"]+)\"/.match(entry)
            if (j==0)
          

        

    end
    
    # Next loop through the text itself.
    File.open("#{Rails.root}/db/conversion/import/#{text}.xml",'r') do
      




    end
  end

end
