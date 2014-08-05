class TextsController < ApplicationController
  before_action :signed_in_user, except: [:index, :show, :about]
  before_action :has_permission, only: [:edit]

  def new
    @text = Text.new
  end

  def create
    @position = ( (@position=Text.all.pluck(:position).max) ? @position+1 : 1)
    @text = current_user.texts.build(text_params)
    @text.position = @position
    @text.released = false
    if @text.save
      File.new(       text_loc(@text.id), "w+")
      File.new( about_text_loc(@text.id), "w+")
      redirect_to edit_text_path(@text)
    else
      render 'new'
    end
  end

  def edit
    @text = Text.find(params[:id])
    @content = File.read( text_loc(params[:id]) ).html_safe
    @about_content = File.read( about_text_loc(params[:id]) ).html_safe
    @media = Medium.where("text_id = ?", params[:id])
  end

  def update
    respond_to do |format|
      format.js {
        @text = Text.find(params[:id])
        if @text.update_attributes(text_params)
          # Errors displayed automatically
          flash.now[:success] = "Title and author updated!"
        end
      }
    end
  end

  def save
    respond_to do |format|
      format.json {
        @text = params[:id]
        @content = params[:content]
        File.open( text_loc(params[:id]), "w+") do |f|
          f.write(@content)
        end
        render :json => { :success => true } # Needed this to get ajax response.
      }
    end
  end

  def release
    respond_to do |format|
      format.js {
        @text = Text.find(params[:id])
        @text.toggle!(:released)
      }
    end
  end

  def index
    if signed_in?
      @texts = Text.all
    else
      @texts = Text.where("released = ?", true).load
    end
  end

  def order
    if params[:text]
      params[:text].each_with_index { 
        |text, index| Text.update(text.to_i, :position => (index))
      }
      flash[:info] = "Text order has been updated."
      redirect_to(texts_path)
    else
    end
  end

  def show
    @text = Text.find(params[:id])
    @content = File.read( text_loc(params[:id]) ).html_safe
    get_glossary(params[:id]) # Retrieves text matches, definitions, and phrases
  end

  def about
    @text = Text.find(params[:id])
    @content = File.read( about_text_loc(params[:id]) ).html_safe
  end

  def save_about
    respond_to do |format|
      format.json {
        @text = params[:id]
        @content = params[:content]
        File.open( about_text_loc(params[:id]), "w+") do |f|
          f.write(@content)
        end
        render :json => { :success => true } # Needed this to get ajax response.
      }
    end
  end


  private

    def text_params
      params.require(:text).permit(:title, :author)
    end

    # Before filters

    def has_permission
      @text = Text.find(params[:id])
      @user = User.find(@text.user_id)
      unless current_user?(@user)
        flash[:warning] = "You do not have permission to modify #{@text.title}."
        redirect_to texts_path
      end
    end
end
