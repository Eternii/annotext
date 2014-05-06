# == Schema Information
#
# Table name: texts
#
#  id           :integer          not null, primary key
#  title        :string(255)
#  author       :string(255)
#  lang_from_id :integer
#  lang_to_id   :integer
#  created_at   :datetime
#  updated_at   :datetime
#  user_id      :integer
#  position     :integer
#  released     :boolean
#

class Text < ActiveRecord::Base
  belongs_to :user
  has_many :definitions, dependent: :destroy
  has_many :phrases, dependent: :destroy
  has_many :media, dependent: :destroy

  default_scope -> { order('position ASC') }

  validates :title, presence: true,   length: { maximum: 80 }
  validates :author,                  length: { maximum: 40 }
  validates :user_id, presence: true
  validates :position, presence: true
end
