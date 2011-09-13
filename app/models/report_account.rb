class ReportAccount < ActiveRecord::Base
  include UserCreations::Model

  include ActiveModel::Validations
  validates_with AuthenticableValidator

  validates :service, :login, :password, :presence => true
  # (service, login) pair must be unique (plus user_id ?)

  def name
    "#{service} // #{login}"
  end
end
