class CreateDefinitions < ActiveRecord::Migration
  def change
    create_table :definitions do |t|
      t.string  :term
      t.string  :lex_class
      t.string  :definition
      t.integer :text_id

      t.timestamps
    end
    add_index :definitions, :text_id
  end
end
