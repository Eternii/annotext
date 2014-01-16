# == Schema Information
#
# Table name: matches
#
#  id            :integer          not null, primary key
#  word          :string(255)
#  definition_id :integer
#  text_id       :integer
#  created_at    :datetime
#  updated_at    :datetime
#

class Match < ActiveRecord::Base
  belongs_to :definition

  validates :word, presence: true
  validates :definition_id, presence: true
end
