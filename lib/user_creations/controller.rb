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
                    :form_data_config, :optional_form_data

        def configure_form_data config
          (user_creation_model.column_names -
           UserCreations::ExcludeColumns).each do |col_name|
            col_name_sym = col_name.to_sym
            cur_config = config[col_name_sym]
            if cur_config.nil?
              config[col_name] = {
                :type => user_creation_model.columns_hash[col_name].type
              }
            elsif cur_config.equal?(false)
              config.delete(col_name_sym)
            end
          end

          @optional_form_data = []
          config.each do |key, value|
            key_str = key.to_s
            if value.equal?(true)
              config[key] = {
                :type => user_creation_model.columns_hash[key_str].type
              }
            elsif value.equal?(false)
              config.delete(key)
            elsif value[:type].nil?
              value[:type] = user_creation_model.columns_hash[key_str].type
            end

            if value[:type].equal?(:combo)
              add = []
              value[:options].each do |opt|
                add |= opt[:add] if opt[:add]
              end
              value[:add] = add unless add.empty?
            end

            @optional_form_data << key if value[:required].equal?(false)
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
