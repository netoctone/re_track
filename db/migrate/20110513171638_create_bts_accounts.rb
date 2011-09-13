class CreateBtsAccounts < ActiveRecord::Migration
  def self.up
    create_table :bts_accounts do |t|
      t.integer :user_id
      t.string :bts
      t.string :login
      t.string :password

      t.timestamps
    end
  end

  def self.down
    drop_table :bts_accounts
  end
end
