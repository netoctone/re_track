class AddNameToBtsAccount < ActiveRecord::Migration
  def self.up
    add_column :bts_accounts, :name, :string
  end

  def self.down
    remove_column :bts_accounts, :name
  end
end
