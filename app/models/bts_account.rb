class BtsAccount < ActiveRecord::Base
  belongs_to :user

  include ActiveModel::Validations
  validates_with AuthenticableValidator

  validates :user, :bts, :login, :password, :presence => true
  validates :name, :uniqueness => true

  class << self
    def update_current id, user_id
      self.where(:user_id => user_id, :current => true).update_all(:current => false)
      self.update(id, :current => true)
    end
  end
  def make_current
    BtsAccount.update_all('current = 0', 'current <> 0') #mysql-specific
    self.current = true
    self.save false
  end
end
