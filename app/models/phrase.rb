# == Schema Information
#
# Table name: phrases
#
#  id         :integer          not null, primary key
#  term       :string(255)
#  definition :string(255)
#  text_id    :integer
#  created_at :datetime
#  updated_at :datetime
#

class Phrase < ActiveRecord::Base
  belongs_to :text

  validates :term, presence: true
  validates :text_id, presence: true
  validates :definition, presence: true
end
