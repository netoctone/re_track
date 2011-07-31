class ReportAccountsController < ApplicationController
  include UserCreations::Controller

  configure_form_data({
    :service => {
      :type => :combo,
      :options => WebAPI::ReportService.list.map do |service|
        { :display => service.name, :value => service.name }
      end
    }
  })
end
