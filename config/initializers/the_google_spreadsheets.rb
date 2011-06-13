module WebAPI

  class GoogleSpreadsheets < ReportService
    class << self
      def authenticable? login, password
        service = GDocs4Ruby::Service.new
        service.authenticate login, password
      rescue GData4Ruby::HTTPRequestFailed => e
        ::Rails.logger.info e.message
        nil
      end
    end
  end

end
