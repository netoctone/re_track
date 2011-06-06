module UserCreations
  ExcludeColumns = ['user_id', 'id', 'created_at', 'updated_at']

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

      class << incl
        attr_reader :user_creation_model, :user_creation_name,
                    :form_data_config

        def configure_form_data config
          (user_creation_model.column_names -
           UserCreations::ExcludeColumns).each do |col_name|
            cur_config = config[col_name.to_sym]
            if cur_config.nil?
              config[col_name] = {
                :type => user_creation_model.columns_hash[col_name].type
              }
            elsif cur_config.equal?(false)
              config.delete(col_name)
            end
          end

          config.each do |key, value|
            if value.equal?(true)
              config[key] = {
                :type => user_creation_model.columns_hash[key].type
              }
            elsif value[:type].nil?
              value[:type] = user_creation_model.columns_hash[key].type
            end
          end

          @form_data_config = config
        end
      end

      incl.configure_form_data({})

      incl.class_eval do
        def creation_model
          self.class.user_creation_model
        end

        def creation_name
          self.class.user_creation_name
        end

        include UserCreations::Actions
      end
    end
  end
end
