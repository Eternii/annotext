class AddReleasedToText < ActiveRecord::Migration
  def change
    add_column :texts, :released, :boolean
  end
end
