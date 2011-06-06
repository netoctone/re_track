module UserCreations
  module Actions
    # GET /(user_creations)/list.json
    def list
      respond_to do |format|
        format.json do
          render json: {
            success: true,
            list: creation_model.where(:user_id => current_user_id).map do |cre|
              { id: cre.id, name: cre.name }
            end
          }
        end
      end
    end

    # GET /(user_creations)/show.json
    def show
      user_creation = creation_model.find(params[:id])

      respond_to do |format|
        format_json(format, user_creation)
      end
    end

    # GET /(user_creations)/show_current.json
    def show_current
      user_creation = creation_model.find_current(current_user_id)

      respond_to do |format|
        if user_creation
          format_json(format, user_creation)
        else
          format.json do
            render json: {
              success: false,
              errormsg: 'No current ' + creation_name.to_s
            }
          end
        end
      end
    end

    # POST /(user_creations)/create.json
    def create
      params[creation_name][:user_id] = current_user_id
      user_creation = creation_model.new(params[creation_name])

      respond_to do |format|
        if user_creation.save
          format.json do
            render json: {
              success: true,
              id: user_creation.id #maybe send complete form data
            }
          end
        else
          format.json do
            render json: ext_error_json(user_creation.errors)
          end
        end
      end
    end

    # PUT /(user_creations)/update_current.json
    def update_current
      creation_model.update_current(params[:id])

      respond_to do |format|
        format.json do
          render json: {
            success: true
          }
        end
      end
    end

    # PUT /(user_creations)/update.json
    def update
      user_creation = creation_model.find(params[:id])

      #does it make any sense?
      params[creation_name].delete_if do |key, value|
        user_creation.send(key) == value
      end

      respond_to do |format|
        if user_creation.update_attributes(params[creation_name])
          format_json(format, user_creation)
        else
          format.json do
            render json: ext_error_json(user_creation.errors)
          end
        end
      end
    end

    # DELETE /(user_creations)/destroy.json
    def destroy
      user_creation = creation_model.find(params[:id])
      user_creation.destroy #is check needed?

      respond_to do |format|
        format.json do
          render json: {
            success: true
          }
        end
      end
    end

    # GET /(user_creations)/form_data_config.json
    def form_data_config
      respond_to do |format|
        format.json do
          render json: {
            success: true,
            config: self.class.form_data_config
          }
        end
      end
    end

    private
    def user_creation_to_json user_creation
      res = {}
      self.class.form_data_config.each do |col_name, val|
        res["#{creation_name}[#{col_name}]"] = user_creation.send(col_name)
      end
      res['id'] = user_creation.id
      res
    end

    def format_json format, user_creation
      user_creation_json = user_creation_to_json(user_creation)
      format.json do
        render :json => {
          :success => true,
          creation_name => user_creation_json
        }
      end
    end

    def ext_error_json errors
      res = { :success => false }
      res[:errormsg] = errors[:base].join('<br/>') if errors[:base]
      res
    end
  end
end
