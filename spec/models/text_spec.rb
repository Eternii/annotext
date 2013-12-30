require 'spec_helper'

describe Text do

  let(:admin) { FactoryGirl.create(:admin) }
  let(:user)  { FactoryGirl.create(:user)  }
  before do
     @text = admin.texts.build(title: "Faust", author: "Goethe", position: 0,
                              lang_to_id: 1, lang_from_id: 3)
  end


  subject { @text }

  it { should respond_to(:title) }
  it { should respond_to(:author) }
  it { should respond_to(:position) }
  it { should respond_to(:lang_to_id) }
  it { should respond_to(:lang_from_id) }
  it { should respond_to(:released) }
  it { should respond_to(:user_id) }
  it { should respond_to(:user) }
  its(:user) { should eq admin }

  it { should be_valid }

  describe "when user_id is not present" do
    before { @text.user_id = nil }
    it { should_not be_valid }
  end

  describe "when title is blank" do
    before { @text.title = " " }
    it { should_not be_valid }
  end

  describe "when title is too long" do
    before { @text.title = "a" * 81 }
    it { should_not be_valid }
  end

  describe "when author is blank" do
    before { @text.author = " " }
    it { should_not be_valid }
  end

  describe "when author is too long" do
    before { @text.author = "a" * 41 }
    it { should_not be_valid }
  end

  describe "when position is not present" do
    before { @text.position = nil }
    it { should_not be_valid }
  end

  describe "index listing" do
    let!(:text1) { FactoryGirl.create(:text, user: user) }
    let!(:text2) { FactoryGirl.create(:text, user: user) }

    it "should display texts in position order" do
      expect(user.texts.to_a).to eq [text1, text2]
    end

    it "should change display order after position is modified" do
      text1.update(position: 7)
      text2.update(position: 3)
      expect(user.texts.to_a).to eq [text2, text1]
    end
  end

  describe "when associated user is destroyed" do
    before do
      @text_to_destroy = FactoryGirl.create(:text, user: user)
      user.destroy
    end

    it "should not destroy the text" do
      expect(Text.where(id: @text_to_destroy.id)).not_to be_empty
    end

    it "should transfer ownership of the text to the admin" do
      expect(Text.find(@text_to_destroy.id).user_id).to eq admin
    end
  end

end
