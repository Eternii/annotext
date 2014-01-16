# == Schema Information
#
# Table name: languages
#
#  id           :integer          not null, primary key
#  name         :string(255)
#  abbreviation :string(255)
#  created_at   :datetime
#  updated_at   :datetime
#

require 'spec_helper'

describe Language do

  before do
    @language = Language.new(name: "German", abbreviation: "de")
  end

  subject { @language }

  it { should respond_to(:name) }
  it { should respond_to(:abbreviation) }
end
