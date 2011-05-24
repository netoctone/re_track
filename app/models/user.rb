class User < ActiveRecord::Base
  acts_as_authentic

  has_many :bts_accounts
  validates :first_name, :last_name, :presence => true

  def fullname
    "#{first_name} #{last_name}"
  end
end
