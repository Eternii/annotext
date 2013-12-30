class CreateTexts < ActiveRecord::Migration
  def change
    create_table :texts do |t|
      t.string :title
      t.string :author
      t.integer :lang_from_id
      t.integer :lang_to_id

      t.timestamps
    end
  end
end
