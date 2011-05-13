# TODO: move to separate file
class WebAPINotAvailableError < StandardError; end

class RallyBts < Bts
  class << self
    def find_defects username, password
      rally = rally_rest_api(username, password)

      # TODO: abort temp fetching of only one spoil safe defect
      rally.find(:defect) { equal :formatted_i_d, 'DE7635' }
      .collect do |query_result|
        RallyDefect.new query_result
      end
    end

    #
    # returns false if cannot authenticate with given username and password
    # thus returns false if account is blocked
    #
    def account_available? username, password
      rally_rest_api username, password
      true
    rescue Rally::NotAuthenticatedError
      false
    end

    private
    def rally_rest_api username, password
      RallyRestAPI.new :username => username,
                       :password => password,
                       :logger => ::Rails.logger
    rescue NoMethodError => e
      ::Rails.logger.info "RallyRestAPI#new raised error: #{e.class}: #{e}"
      raise WebAPINotAvailableError, 'Rally server is not available'
    end
  end
end
