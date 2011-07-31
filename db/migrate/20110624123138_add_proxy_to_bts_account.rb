class AddProxyToBtsAccount < ActiveRecord::Migration
  def self.up
    add_column :bts_accounts, :proxy, :string
  end

  def self.down
    remove_column :bts_accounts, :proxy
  end
end
