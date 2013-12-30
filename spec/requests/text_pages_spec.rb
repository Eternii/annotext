require 'spec_helper'

describe "Text pages" do

  subject { page }

  describe "index" do

    let!(:user) { FactoryGirl.create(:user) }
    let!(:text1) { FactoryGirl.create(:text, user: user) }
    let!(:text2) { FactoryGirl.create(:text, user: user) }

    before do
      text2.update(released: false)
      visit texts_path
    end

    it { should have_title('German Texts') }
    it { should have_content('German Texts') }

    describe "when not logged in" do
      it "should not have an edit link" do
        expect(page).not_to have_link('Edit')
      end

      it "should not have released information" do
        expect(page).not_to have_content(text1.released)
      end

      it "should display released texts" do
        expect(page).to have_content(text1.title)
        expect(page).to have_content(text1.author)
      end

      it "should not display unreleased texts" do
        expect(page).not_to have_content(text2.title)
      end

      it "should go to a viewing page when clicked" do
        expect(page).to have_link('View', href: text_path(text1))
      end
    end

    describe "when logged in" do
      before do
        sign_in user
        visit texts_path
      end

      it "should have an edit link" do
        expect(page).to have_link('Edit')
      end

      it "should have released information" do
        expect(page).to have_content(text1.released)
      end

      it "should display unreleased texts" do
        expect(page).to have_content(text2.title)
      end
    end
  end

  describe "viewing a text" do
    let(:user) { FactoryGirl.create(:user) }
    let(:text) { FactoryGirl.create(:text, user: user) }

    before { visit text_path(text) }

    it { should have_title(text.title) }

    describe "clicking on a text" do
    end

  end

  describe "editing a text" do
    let(:user)       { FactoryGirl.create(:user) }
    let(:wrong_user) { FactoryGirl.create(:user) }
    let(:text)       { FactoryGirl.create(:text, user: user) }

    describe "when logged in as the owning user" do
      before do
        sign_in user
        visit edit_text_path(text)
      end

      it "should display the text" do
      end
    end

    describe "when logged in as another user" do
      before do
        sign_in wrong_user, no_capybara: true
        get edit_text_path(text)
      end

      specify { expect(response).to redirect_to(texts_path) }
    end

    describe "when not logged in" do
      before { get edit_text_path(text) }
      specify { expect(response).to redirect_to(signin_url) }
    end
  end
    
end
