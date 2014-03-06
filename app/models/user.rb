# == Schema Information
#
# Table name: users
#
#  id              :integer          not null, primary key
#  name            :string(255)
#  email           :string(255)
#  created_at      :datetime
#  updated_at      :datetime
#  password_digest :string(255)
#  remember_token  :string(255)
#  admin           :boolean          default(FALSE)
#

class User < ActiveRecord::Base
  has_many :texts

  before_save { self.email = email.downcase }
  before_save { self.name = name.downcase }
  before_create :create_remember_token

  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i

  validates :name,     presence:   true,
                       length:     { maximum: 30 },
                       uniqueness: { case_sensitive: false }

  validates :email,    presence:   true, 
                       format:     { with: VALID_EMAIL_REGEX },
                       uniqueness: { case_sensitive: false }

  has_secure_password
  validates :password, length:     { minimum: 6 }

  def User.new_remember_token
    SecureRandom.urlsafe_base64
  end

  def User.encrypt(token)
    Digest::SHA1.hexdigest(token.to_s)
  end

  private

    def create_remember_token
      self.remember_token = User.encrypt(User.new_remember_token)
    end
end
