require 'web_api/service'
require 'web_api/bts'
require 'web_api/rally_bts'
require 'web_api/report_service'
require 'web_api/google_spreadsheets'

module WebAPI
  class Error < ::StandardError; end
  class NotAvailableError < Error; end
  class NotAuthenticatedError < Error; end
end
