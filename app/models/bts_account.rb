class BtsAccount < ActiveRecord::Base
  belongs_to :user

  include ActiveModel::Validations
  validates_with AuthenticableValidator

  validates :user, :bts, :login, :password, :presence => true
  validates :name, :uniqueness => true

  class << self
    def update_current id
      record = self.find(id)
      record.updated_at = Time.now
      record.save(:validate => false)
    end

    def find_current user_id
      self.where(:user_id => user_id).order(:updated_at).last
    end
  end
end
