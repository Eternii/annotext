require 'spec_helper'

describe Language do

  before do
    @language = Language.new(name: "German", abbreviation: "de")
  end

  subject { @language }

  it { should respond_to(:name) }
  it { should respond_to(:abbreviation) }
end
