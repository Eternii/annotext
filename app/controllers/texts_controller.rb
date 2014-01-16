class TextsController < ApplicationController
  before_action :signed_in_user, only: [:edit, :order, :new, :create]
  before_action :has_permission, only: [:edit]

  def new
    @text = Text.new
  end

  def create
    @position = Text.all.pluck(:position).max+1
    @text = current_user.texts.build(text_params, position: @position, released: false)
    if @text.save
      flash[:success] = "A new text has been successfully created!"
      redirect_to edit_text_path(@text)
    else
      render 'new'
    end
  end

  def edit
    @content = File.open("#{Rails.root}/app/assets/texts/#{params[:id]}.txt").read.html_safe
    @text = Text.find(params[:id])
    @definitions = []   # !!! Fix this
    # @definitions = @text.definitions.paginate(page: params[:page])
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
      params[:text].each_with_index { |text, index| Text.update(text.to_i, :position => (index)) }
      flash[:info] = "Text order has been updated."
      redirect_to(texts_path)
    else
    end
    
  end

  def show
    @text = Text.find(params[:id])
    @content ||= File.open("#{Rails.root}/app/assets/texts/#{params[:id]}.txt").read.html_safe
    get_glossary(params[:id]) # Retrieves text matches, definitions, and phrases
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
