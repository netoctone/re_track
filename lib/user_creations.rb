module UserCreations
  autoload :Controller, 'user_creations/controller'
  autoload :Actions,    'user_creations/actions'

  # must be called in routes definition block
  #
  # @param [String|Symbol] controller - name of controller (downcase)
  # @param [Binding] bind - binding of routes definition block
  def self.routes controller, bind
    bind.eval <<-ROUTES
      get '#{controller}/list', '#{controller}/show',
          '#{controller}/show_current', '#{controller}/form_data_config'
      post '#{controller}/create'
      put '#{controller}/update', '#{controller}/update_current'
      delete '#{controller}/destroy'
    ROUTES
  end
end
