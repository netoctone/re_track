class CreateDefectTracks < ActiveRecord::Migration
  def self.up
    create_table :defect_tracks do |t|
      t.integer :bts_account_id
      t.string :formatted_id
      t.text :description
      t.integer :status
      t.datetime :start_date
      t.datetime :end_date

      t.timestamps
    end
  end

  def self.down
    drop_table :defect_tracks
  end
end
