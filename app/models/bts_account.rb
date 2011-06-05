class BtsAccount < ActiveRecord::Base
  include UserCreations::Model

  has_many :defect_tracks

  include ActiveModel::Validations
  validates_with AuthenticableValidator

  validates :bts, :login, :password, :presence => true
  validates :name, :uniqueness => true
  # name is unnecessary at all
  # (bts, login) pair must be unique
end
