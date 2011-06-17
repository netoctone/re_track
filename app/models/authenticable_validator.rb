class AuthenticableValidator < ActiveModel::Validator
  def validate(record)
    details = {
      :login => record.login,
      :password => record.password
    }
    details[:url] = record.url if record.respond_to? :url
    record.service.constantize.new details
  rescue WebAPI::Error => e
    record.errors[:base] << e.message
  end
end
