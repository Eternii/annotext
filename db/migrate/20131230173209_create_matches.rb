class CreateMatches < ActiveRecord::Migration
  def change
    create_table :matches do |t|
      t.string  :word
      t.integer :definition_id
      t.integer :text_id

      t.timestamps
    end
    add_index :matches, [:word, :text_id], unique: true
    add_index :matches, :text_id
    add_index :matches, :definition_id
  end
end
