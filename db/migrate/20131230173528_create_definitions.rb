class CreateDefinitions < ActiveRecord::Migration
  def change
    create_table :definitions do |t|
      t.integer :text_id
      t.string  :term
      t.string  :grammar_type
      t.string  :definition

      t.timestamps
    end
  end
end
