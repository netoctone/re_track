class AuthenticableValidator < ActiveModel::Validator
  def validate(record)
    unless record.service.constantize.authenticable?(record.login,
                                                     record.password)
      record.errors[:base] << "Login details must be authenticable"
    end
  rescue WebAPI::Error => e
    record.errors[:base] << e.message
  end
end
