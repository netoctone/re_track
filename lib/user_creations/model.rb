module UserCreations
  module Model
    def self.included includer
      includer.belongs_to :user
      includer.validates :user, :presence => true

      includer.instance_eval do
        def update_current id
          record = find(id)
          record.updated_at = Time.now
          record.save(:validate => false)
        end

        def find_current user_id
          where(:user_id => user_id).order(:updated_at).last
        end
      end
    end
  end
end
