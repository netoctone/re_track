class AuthenticableValidator < ActiveModel::Validator
  def validate(record)
    unless record.bts.constantize.authenticable? record.login, record.password
      record.errors[:base] << "Login details must be authenticable"
    end
  rescue WebAPINotAvailableError => e
    record.errors[:base] << e.message
  end
end
