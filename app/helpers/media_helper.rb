module MediaHelper

  def media_icon(type)
    case type
      when /^video.*$/
        "glyphicon glyphicon-film"
      when /^audio.*$/
        "glyphicon glyphicon-music"
      when /^image.*$/
        "glyphicon glyphicon-camera"
      else
        "glyphicon glyphicon-warning-sign"
    end
  end

  def linked_media?(type)
    case type
      when /^*link$/
        true
      else
        false
    end
  end

end
