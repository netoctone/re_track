# TODO: move to separate file
class WebAPINotAvailableError < StandardError; end

class RallyBts < Bts
  configure_flow({
    :formatted_i_d => {
      #:track => true, # if false but :track_to or :map specified, then ignored
      :track_to => :formatted_id, # one of confs must :track_to => :formatted_id
      #:track_to => '',
      :header_name => 'ID',
      :type => :string,
      :editable => false
    },
    :name => {
      :track_to => :description,
      :type => :string,
      :editable => false
    },
    :description => {
      :type => :text
    },
    :state => {
      :type => :string,
      :editable => false
    },
    :schedule_state => {
      :type => :combo,
      :track_to => :status,
      #or hash of lambdas-converters
      :map => [
        {
          :display => 'Defined 20%',
          # must be unique
          :track_value => DefectTrack::PercentToStatus[20].to_s,
          :bts_value => 'Defined'
        },
        {
          :display => 'In-Progress 50%',
          :track_value => DefectTrack::PercentToStatus[50].to_s,
          :bts_value => 'In-Progress'
        },
        {
          :display => 'In-Progress 80%',
          :track_value => DefectTrack::PercentToStatus[80].to_s,
          :bts_value => 'In-Progress'
        },
        {
          :display => 'Completed 90%',
          :track_value => DefectTrack::PercentToStatus[90].to_s,
          :bts_value => 'Completed'
        },
        {
          :display => 'Accepted 100%',
          :track_value => DefectTrack::PercentToStatus[100].to_s,
          :bts_value => 'Accepted'
        }
      ]
    },
    :submitted_by => {
      :type => :string,
      :editable => false
    }
  })

  class << self
    #
    # returns nil if cannot authenticate with given username and password
    # thus returns nil if account is blocked
    #
    def authenticable? username, password
      self.new username, password
    rescue Rally::NotAuthenticatedError => e
      ::Rails.logger.info e.message
      nil
    end
  end

  def initialize username, password
    @rally_api = RallyRestAPI.new :username => username,
                                  :password => password,
                                  :logger => ::Rails.logger
    @username = username
    @start_index = 0
  rescue NoMethodError, SocketError => e
    ::Rails.logger.info "RallyRestAPI#new raised error: #{e.class}: #{e}"
    raise WebAPINotAvailableError, 'Rally server is not available'
  end

  def find_defects quant=2
    quant = 100 if quant > 100
    @start_index += quant
    username = @username # silly unnecessary metaprogramming is THE EVIL
    @rally_api.find(:defect,
                    :pagesize => quant,
                    :start => @start_index-quant) { equal :owner, username }
    .collect do |query_result|
      row = {}
      RallyBts.each_field_name do |name|
        row[name] = RallyBts.convert_value_to_track(name,
                                                    query_result.send(name))
      end
      row
    end
  end

  # TODO: ensure exception raise when update fails or return nil (and change FuncController#defect_update)
  def update_defect params
    defect = @rally_api.find(:defect) { equal :formatted_i_d,
                                              params[:formatted_i_d] }.first
    update_params = {}
    RallyBts.each_field_name do |name|
      val = RallyBts.convert_value_to_bts(name, params[name])
      if val != defect.send(name)
        update_params[name] = val
      end
    end

    defect.update(update_params)
  end

end
