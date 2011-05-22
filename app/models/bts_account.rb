class BtsAccount < ActiveRecord::Base
  belongs_to :user

  include ActiveModel::Validations
  validates_with AuthenticableValidator

  validates :user, :bts, :login, :password, :presence => true
  validates :name, :uniqueness => true
end
