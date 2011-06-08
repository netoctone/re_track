class CreateAccountGroupsBtsAccounts < ActiveRecord::Migration
  def self.up
    create_table :account_groups_bts_accounts, :id => false do |t|
      t.integer :account_group_id
      t.integer :bts_account_id
    end
  end

  def self.down
    drop_table :account_groups_bts_accounts
  end
end
