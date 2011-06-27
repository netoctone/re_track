module WebAPI

  class JiraBts < WebAPI::Bts
    url_settable

    configure_flow({
      :key => {
        # one of confs must :track_to => :formatted_id
        # :track => true, # if false but :track_to or :map setted, then ignored
        :track_to => :formatted_id,
        #:header_name => 'Key',
        :type => :string,
        :editable => false
      },
      :priority => {
        :type => :string,
        :editable => false
      },
      :summary => {
        :track_to => :description,
        :type => :string,
        :editable => false
      },
      :description => {
        :type => :text
      },
      :type => {
        :type => :string,
        :editable => false
      },
      :status => {
        :type => :combo,
        :track_to => :status,
        #or hash of lambdas-converters
        :map => [
          {
            :display => 'Assigned 20%',
            # must be unique
            :track_value => DefectTrack::PercentToStatus[20].to_s,
            :bts_value => 'Assigned'
          },
          {
            :display => 'Working on it 50%',
            :track_value => DefectTrack::PercentToStatus[50].to_s,
            :bts_value => 'Working on it'
          },
          {
            :display => 'Working on it 80%',
            :track_value => DefectTrack::PercentToStatus[80].to_s,
            :bts_value => 'Working on it'
          },
          {
            :display => 'Resolved 90%',
            :track_value => DefectTrack::PercentToStatus[90].to_s,
            :bts_value => 'Resolved'
          },
          {
            :display => 'Closed 100%',
            :track_value => DefectTrack::PercentToStatus[100].to_s,
            :bts_value => 'Closed'
          }
        ]
      },
      :reporter => {
        :type => :string,
        :editable => false
      }
    })

    SSLVerifyModeProp = 'protocol.http.ssl_config.verify_mode'

    FieldNameToGetter = {
      :status => 'getStatuses',
      :type => 'getIssueTypes',
      :priority => 'getPriorities'
    }

    def initialize details_or_dump={}
      @username = details_or_dump[:login]
      @password = details_or_dump[:password]
      @url = details_or_dump[:url]
      @proxy = details_or_dump[:proxy]

      begin
        @api = Jira4R::JiraTool.new(2, @url)
        @api.driver.options[SSLVerifyModeProp] = OpenSSL::SSL::VERIFY_NONE
        begin
          @api.driver.httpproxy = @proxy if @proxy
        rescue ArgumentError => e
          ::Rails.logger.info "SOAP::RPC::Driver#httpproxy= raised error: " \
                              "#{e.class}: #{e.message}"
          raise NotAvailableError, "Proxy '#@proxy' is unavailable"
        end
        @api.login(@username, @password)
      rescue SOAP::FaultError => e
        ::Rails.logger.info "Jira4R::JiraTool#login raised error: " \
                            "#{e.class}: #{e.message}"
        raise NotAuthenticatedError, 'Invalid username or password'
      rescue ::SocketError, ::OpenSSL::SSL::SSLError,
             Errno::ECONNREFUSED, SOAP::HTTPStreamError => e
        ::Rails.logger.info "Jira4R::JiraTool::new raised error: " \
                            "#{e.class}: #{e.message}"
        raise NotAvailableError, "Jira service '#@url' is unavailable"
      end

      if field_convert = details_or_dump[:field_convert]
        @field_convert = field_convert
      else
        @field_convert = {}
        FieldNameToGetter.each do |key, val|
          convert = {
            :to_name => {},
            :to_id => {}
          }
          @api.send(val).each do |field|
            convert[:to_name][field.id] = field.name
            convert[:to_id][field.name] = field.id
          end
          @field_convert[key] = convert
        end
      end
    end

    def dump
      {
        :login => @username,
        :password => @password,
        :url => @url,
        :proxy => @proxy,
        :field_convert => @field_convert
      }
    end

    Limit = 1000

    def find_defects
      @api.send('getIssuesFromJqlSearch', "assignee = '#{@username}'", Limit)
      .map do |issue|
        row = {}
        JiraBts.each_field_name do |name|
          value = convert_field_to_name(name, issue.send(name))
          row[name] = JiraBts.convert_value_to_track(name, value)
        end
        row
      end
    end

    Fields = [:description] # only those, which don't require convert_field_to_
    StateDyadToAction = {
      'Assigned' => {
        'Working on it' => 'Start work',
        'Resolved' => 'Resolve'
      },
      'Working on it' => {
        'Assigned' => 'Pause work',
        'Resolved' => 'Resolve'
      }
      #'Resolved' => ... => ['Verify', 'Reopen', 'Unresolve']
    }

    def update_defect params
      issue = @api.send('getIssue', params[:key])

      Fields.each do |name|
        val = JiraBts.convert_value_to_bts(name, params[name])
        if val != issue.send(name)
          field = Jira4R::V2::RemoteFieldValue.new(name, val)
          @api.send('updateIssue', issue.key, field)
        end
      end

      new_stat = JiraBts.convert_value_to_bts(:status, params[:status])
      old_stat = convert_field_to_name(:status, issue.status)
      if new_stat != old_stat
        #::Rails.logger.info @api.send('getAvailableActions', issue.key)
        if state_to_act = StateDyadToAction[old_stat]
          if act_name = state_to_act[new_stat]
            act = @api.send('getAvailableActions', issue.key).find do |act|
              act.name == act_name
            end
            if act
              @api.send('progressWorkflowAction', issue.key, act.id.to_s, [])
            else
              raise Error, "there's no action to change status " \
                           "from #{old_stat} to #{new_stat}"
            end
          else
            raise Error, "can't change status to #{new_stat}"
          end
        else
          raise Error, "can't change status from #{old_stat}"
        end
      end
    end

    private
    def convert_field_to_name name, value
      if FieldNameToGetter.has_key? name
        @field_convert[name][:to_name][value]
      else
        value
      end
    end

    def convert_field_to_id name, value
      if FieldNameToGetter.has_key? name
        @field_convert[name][:to_id][value]
      else
        value
      end
    end

  end

end
