class Text < ActiveRecord::Base
  belongs_to :user
  default_scope -> { order('position ASC') }

  validates :title, presence: true, length: { maximum: 80 }
  validates :author, presence: true, length: { maximum: 40 }
  validates :user_id, presence: true
  validates :position, presence: true
end
