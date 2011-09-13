class AddUrlToBtsAccount < ActiveRecord::Migration
  def self.up
    add_column :bts_accounts, :url, :string
  end

  def self.down
    remove_column :bts_accounts, :url
  end
end
