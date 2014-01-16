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

require 'spec_helper'

describe Phrase do
  pending "add some examples to (or delete) #{__FILE__}"
end
