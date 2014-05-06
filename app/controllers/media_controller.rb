class MediaController < ApplicationController
  def new
    respond_to do |format|
      format.js {
        @text = Text.find_by_id(params[:text])
        @media = @text.media.new
        @media_type = params[:type]
      }
    end
  end

  def create
    respond_to do |format|
      format.js {
        @text = Text.find_by_id(params[:medium][:text_id])
        @media = @text.media.build(medium_params)
        if @media.save
          flash.now[:success] = "New media created!"
        else
          @media_type = params[:medium][:medium_type]
          render 'new'
        end
      }
    end
  end

  def edit
    respond_to do |format|
      format.js {
        @media = Medium.find_by_id(params[:id])
      }
    end
  end

  def update
    respond_to do |format|
      format.js {
        @media = Medium.find_by_id(params[:id])
        if @media.update_attributes(medium_params)
          flash[:success] = "Media updated"
        else
          render 'edit'
        end
      }
    end
  end

  def close
    respond_to do |format|
      format.js {
        @media = Medium.find_by_id(params[:id])
        # Render will close edit form and discard changes.
        # Will also render flash to clear any update/create flash banners.
      }
    end
  end

  # Non-javascript index handled via Texts controller and Text Media Edit view.
  # The json here is used to create a drop-down list in the linkmedia CKEDITOR
  # plugin dialog window.
  def index
    respond_to do |format|
      format.json {
        media = Medium.where("text_id = ?", params[:text]).
                              pluck(:id, :title, :description, :media_type)

        if media
          render :json => { :list => media }
        else
          render :json => { :list => '' }
        end
      }
    end
  end

  def show
    @media = Medium.find(params[:id])

    case @media.media_type
      when /^*link$/      # Use ^.*link$ if need things before link...
        @link = @media.location
        render 'link'
      when "video"
        @video = asset_path
        render 'video'
      when "audio"
        @audio = asset_path
        render 'audio'
      else
        @image = asset_path
        render 'image'
    end
  end

  def destroy
    # !!! Finish
  end

  private

    def medium_params
      params.require(:medium).permit(:location, :media_type, :title,
                                                                 :description)
    end

    # To make a subdirectory work, it seems the path needs to start right
    # below the assets subdirectly listed in the pipeline. In this case, that's
    # the /texts directory, so the path must start with media to use the
    # pipeline. Note that the full absolute path won't work.
    def asset_path
      "media/#{@media.text_id.to_s}/#{@media.location}"
    end
end
