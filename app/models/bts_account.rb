class BtsAccount < ActiveRecord::Base
  include UserCreations::Model

  has_many :defect_tracks
  has_and_belongs_to_many :account_groups

  include ActiveModel::Validations
  validates_with AuthenticableValidator

  validates :bts, :login, :password, :presence => true
  # (bts, login) pair must be unique (plus user_id ?)

  def name
    "#{bts} // #{login}"
  end

  def service
    bts
  end
end
