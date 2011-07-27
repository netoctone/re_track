class AddProjectToDefectTrack < ActiveRecord::Migration
  def self.up
    add_column :defect_tracks, :project, :string
  end

  def self.down
    remove_column :defect_tracks, :project
  end
end
