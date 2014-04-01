class PhrasesController < ApplicationController
  before_action :signed_in_user

  def create
    respond_to do |format|
      format.json {
        term = params[:term]
        defin = params[:defin]
        text = params[:text]

        phrase = Phrase.new(term: term, definition: defin, text_id: text)

        if phrase.save
          render :json => { :phrase => phrase.id } 
        else
          render :json => { :phrase => nil }
        end
      }
    end
  end

  def edit
    respond_to do |format|
      format.json {
        phrase = Phrase.find_by_id(params[:id])
        if phrase
          render :json => { :term => phrase.term, :defin => phrase.definition }
        else
          render :json => { :str => '', :defin => '' }
        end
      }
    end
  end

  def update
    respond_to do |format|
      format.js {
        term = params[:term]
        defin = params[:defin]

        phrase = Phrase.find_by_id(params[:id])

        phrase.term = term
        phrase.definition = defin

        phrase.save

        render :nothing => true
      }
    end
  end

  def show
    respond_to do |format|
      format.js {
        @phrase = Phrase.find_by_id(params[:id])
      }
    end
  end

end
