class CreateMedia < ActiveRecord::Migration
  def change
    create_table :media do |t|
      t.string  :location
      t.string  :media_type
      t.string  :title
      t.string  :description
      t.integer :text_id

      t.timestamps
    end
  end
end
