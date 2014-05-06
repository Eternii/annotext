# == Schema Information
#
# Table name: media
#
#  id          :integer          not null, primary key
#  location    :string(255)
#  type        :string(255)
#  title       :string(255)
#  description :string(255)
#  text_id     :integer
#  created_at  :datetime
#  updated_at  :datetime
#

class Medium < ActiveRecord::Base
  belongs_to :text

  validates :location, presence: true
  validates :media_type, presence: true
  validates :text_id, presence: true
end
