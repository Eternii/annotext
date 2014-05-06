class StaticPagesController < ApplicationController
  before_action :signed_in_user, only: [:editor_help]

  def home
  end

  def help
  end

  def editor_help
  end

	def about
	end

	def contact
	end

  def history
  end
end
