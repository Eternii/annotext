class CreateMatches < ActiveRecord::Migration
  def change
    create_table :matches do |t|
      t.integer :text_id
      t.string  :word
      t.integer :definition_id

      t.timestamps
    end
  end
end
