class CreateReportAccounts < ActiveRecord::Migration
  def self.up
    create_table :report_accounts do |t|
      t.integer :user_id
      t.string :service
      t.string :login
      t.string :password

      t.timestamps
    end
  end

  def self.down
    drop_table :report_accounts
  end
end
