class UsersController < ApplicationController
  before_action :signed_in_user
  before_action :correct_user,  only: [:edit, :update]
  before_action :admin_user,    only: [:destroy, :new, :create]

  def new
    @user = User.new
  end

  def show
    @user = User.find(params[:id])
    @texts = @user.texts
  end

  def create
    @user = User.new(user_params)
    if @user.save
      flash[:success] = "A new user has been successfully created!"
      redirect_to @user
    else
      render 'new'
    end
  end

  def edit
    @user = User.find(params[:id])
  end

  def update
    if @user.update_attributes(user_params)
      flash[:success] = "Profile updated"
      redirect_to @user
    else
      render 'edit'
    end
  end

  def index
    @users = User.paginate(page: params[:page], per_page: 20)
  end

  def destroy
    @user = User.find(params[:id])
    if current_user?(@user)
      redirect_to(root_url)
    else
      @user.destroy
      flash[:success] = "User deleted."
      redirect_to users_path
    end
  end

  private

    def user_params
      params.require(:user).permit(:name, :email, :password,
                                   :password_confirmation)
    end

end
