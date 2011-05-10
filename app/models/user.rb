class User < ActiveRecord::Base
  acts_as_authentic

  validates_presence_of :first_name, :last_name

  def fullname
    "#{first_name} #{last_name}"
  end
end
