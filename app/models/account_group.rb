class AccountGroup < ActiveRecord::Base
  include UserCreations::Model

  has_and_belongs_to_many :bts_accounts

  validates :name, :presence => true
  # (name, user) pair must be unique
end
