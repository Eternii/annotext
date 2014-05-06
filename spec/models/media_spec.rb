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

require 'spec_helper'

describe Media do
  pending "add some examples to (or delete) #{__FILE__}"
end
