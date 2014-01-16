class CreatePhrases < ActiveRecord::Migration
  def change
    create_table :phrases do |t|
      t.string  :term
      t.string  :definition
      t.integer :text_id

      t.timestamps
    end
    add_index :phrases, :text_id
  end
end
