class AddCurrentToBtsAccount < ActiveRecord::Migration
  def self.up
    add_column :bts_accounts, :current, :boolean, :default => false
  end

  def self.down
    remove_column :bts_accounts, :current
  end
end
