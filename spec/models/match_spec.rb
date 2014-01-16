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

require 'spec_helper'

describe Match do
  pending "add some examples to (or delete) #{__FILE__}"
end
