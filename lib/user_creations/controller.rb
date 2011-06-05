module UserCreations
  module Controller
    def self.included(incl)
      model_name = incl.name[/^(.*)sController$/, 1]
      incl.instance_variable_set :@user_creation_model, model_name.constantize

      creation_name = model_name
      creation_name[0] = creation_name[0].downcase
      creation_name.gsub!(/[A-Z]/) { |cap| '_' + cap.downcase }
      creation_name = creation_name.to_sym
      incl.instance_variable_set(:@user_creation_name, creation_name)

      incl.before_filter :require_user

      incl.class_eval do
        def creation_model
          self.class.instance_variable_get(:@user_creation_model)
        end

        def creation_name
          self.class.instance_variable_get(:@user_creation_name)
        end

        include UserCreations::Actions
      end
    end
  end
end
