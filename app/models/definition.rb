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

  def entries
    Match.where("word = ?", '')  # !!! Finish or remove
  end
end
