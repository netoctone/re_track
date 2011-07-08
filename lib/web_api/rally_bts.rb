module WebAPI

  class RallyBts < Bts
    configure_flow({
      :formatted_i_d => {
        # one of confs must :track_to => :formatted_id
        # :track => true, # if false but :track_to or :map setted, then ignored
        :track_to => :formatted_id,
        :label => 'ID',
        :type => :string,
        :read_only => true
      },
      :name => {
        :track_to => :description,
        :type => :string,
        :disabled => true
      },
      :description => {
        :type => :text
      },
      :state => {
        :type => :string,
        :disabled => true
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
        :disabled => true
      }
    })

    def initialize details={}
      @rally_api = RallyRestAPI.new :username => details[:login],
                                    :password => details[:password],
                                    :logger => ::Rails.logger
      @username = details[:login]
      @start_index = 0
    rescue NoMethodError, SocketError => e
      ::Rails.logger.info "RallyRestAPI::new raised error: " \
                          "#{e.class}: #{e.message}"
      raise NotAvailableError, 'Rally server is not available'
    rescue Rally::NotAuthenticatedError => e
      raise NotAuthenticatedError, e.message
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

end
