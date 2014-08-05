class ScriptsController < ApplicationController
  before_action :signed_in_user

  def index
    @texts = Text.all
  end

  def complete
    @script = params[:commit]
    @text = params[:texts_dropdown]

    if @text
      @content = File.read( text_loc(@text) ).html_safe
    else
      render 'error'
      return
    end

    if @script == "Check for missing definitions"
      definition_script
    elsif @script == "Check for missing lemma definitions"
      lemma_script
    elsif @script == "Check for missing phrases"
      phrase_script
    else
      render 'error'
    end
  end
end
