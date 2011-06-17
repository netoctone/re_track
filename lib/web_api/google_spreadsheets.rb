module WebAPI

  class GoogleSpreadsheets < ReportService
    def initialize details={}
      @service = GDocs4Ruby::Service.new
      @service.authenticate details[:login], details[:password]
    rescue SocketError => e
      ::Rails.logger.info "GDocs4Ruby::Service#authenticate raised error: " \
                          "#{e.class}: #{e.message}"
      raise NotAvailableError, 'Google Spreadsheets API is not available'
    rescue GData4Ruby::HTTPRequestFailed => e
      ::Rails.logger.info "GDocs4Ruby::Service#authenticate raised error: " \
                          "#{e.class}: #{e.message}"
      # not sure about that
      raise NotAuthenticatedError, "Invalid login or password"
    end
  end

end
