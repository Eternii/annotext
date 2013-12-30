class TextsController < ApplicationController
  before_action :signed_in_user, only: [:edit, :order]
  before_action :has_permission, only: [:edit]

  def edit
  end

  def index
    if signed_in?
      @texts = Text.all
      #@texts2 = Text.pluck(:author, :title)
      #@texts2 = Text.select(:title, :author)
      @look = Text.pluck(:author, :title)
      @texts2 = {}
      # Rewrite this to pluck first
      @look.each do |u|
        @texts2[u[0]] = u[1]
      end
      @testing = {}
      @testing[100000] = 456
      @testing[6000000] = 34

      @users = User.all
    else
      @texts = Text.where(released: true).load
    end
  end

  def show
    @text = Text.find(params[:id])
    @content ||= File.open("#{Rails.root}/app/assets/texts/#{params[:id]}.txt").read.html_safe

    
    # @defs = @text.definitions
    # @phrases = @text.phrases
  end

  def order
    if params[:text]
      params[:text].each_with_index { |text, index| Text.update(text.to_i, :position => (index)) }
      flash[:notice] = "Text order has been updated."
      redirect_to(texts_path)
    else
    end
    
  end

  private

    def signed_in_user
      unless signed_in?
        store_location
        redirect_to signin_url, notice: "Please sign in."
      end
    end

    def has_permission
      @text = Text.find(params[:id])
      @user = User.find(@text.user_id)
      unless current_user?(@user)
        redirect_to texts_path, notice: "You do not have permission to modify #{@text.title}."
      end
    end

end
