class CreatePhrases < ActiveRecord::Migration
  def change
    create_table :phrases do |t|
      t.integer :text_id
      t.string  :term
      t.string  :definition

      t.timestamps
    end
  end
end
