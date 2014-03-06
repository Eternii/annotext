# == Schema Information
#
# Table name: definitions
#
#  id         :integer          not null, primary key
#  term       :string(255)
#  lex_class  :string(255)
#  definition :string(255)
#  text_id    :integer
#  created_at :datetime
#  updated_at :datetime
#

class Definition < ActiveRecord::Base
  belongs_to :text
  has_many :matches, dependent: :destroy

  validates :definition, presence: true, length: { maximum: 500 }
  validates :term, presence: true, length: {maximum: 300 }

  def transplant(text_id)
    new_def = self.dup
    new_def.text_id = text_id
    new_def.save
    # !!! Now need to get matches created.

    matches.each do |m|
      new_def.matches.create(word: m.word, text_id: text_id)
    end

    # Delete if no matches were saved
    #if new_def.matches.none?

      # !!! Return errors?
    #end
    new_def
  end

  def hits
    matches.pluck(:word).join(' ')
    #Match.where("definition_id = ?", id).map(&:word).join(' ')
  end

  def create_matches(matches)
    matches.each do |m|
    end
  end
end
