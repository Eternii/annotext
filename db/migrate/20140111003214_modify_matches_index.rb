class ModifyMatchesIndex < ActiveRecord::Migration
  def up
    remove_index :matches, [:word, :text_id]
    add_index    :matches, [:word, :text_id]
  end

  def down
    remove_index :matches, [:word, :text_id]
    add_index    :matches, [:word, :text_id], unique: true
  end
end
