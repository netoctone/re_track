class Bts
  @@bts_list = []

  class << self
    def inherited descendant
      @@bts_list << descendant
    end

    def bts_list
      @@bts_list
    end

    def grid_config
      @grid_config
    end

    def configure_flow config
      @grid_config = {}
      @track_config = {}
      config.each do |name, config|
        @grid_config[name] = grid_config_elem(config)
        if elem = track_config_elem(name, config)
          @track_config[name] = elem
        end
      end
    end

    def each_field_name
      @grid_config.each { |key, val| yield key }
    end

    def convert_value_to_track name, val
      if @track_config[name] && convert = @track_config[name][:bts_to_track]
        convert[val]
      else
        val
      end
    end

    def convert_value_to_bts name, val
      if @track_config[name] && convert = @track_config[name][:bts_of_track]
        convert[val]
      else
        val
      end
    end

    def params_to_track_data params
      result = {}
      @track_config.each do |name, config|
        if value = params[name]
          result[config[:to]] = value
        end
      end
      result
    end

    GridConfigKeys = [:header_name, :type, :editable]

    private
    def grid_config_elem config
      res = config.select { |key, val| GridConfigKeys.member? key }
      if config[:type] == :combo # && config[:map]
        res[:options] = config[:map].collect do |elem|
          map_config = { :display => elem[:display] }
          map_config[:value] = elem[:track_value] || elem[:display]
          map_config
        end
      end
      res
    end

    def track_config_elem name, config
      result = nil
      if config[:track]
        result = { :to => name }
      end
      if track_to = config[:track_to]
        result = { :to => track_to }
      end
      if map = config[:map]
        result ||= { :to => name }
        if map.kind_of? Array
          bts_to_track = {}
          bts_of_track = {}
          map.each do |elem|
            track_value = elem[:track_value] || elem[:display]
            bts_to_track[elem[:bts_value]] = track_value
            bts_of_track[track_value] = elem[:bts_value]
          end
          # bts_to_track - conversion of defect's value from bts to track
          result[:bts_to_track] = ->(val){ bts_to_track[val] }
          result[:bts_of_track] = ->(val){ bts_of_track[val] }
        elsif map.kind_of? Hash
          if bts_to_track = map[:bts_to_track]
            result[:bts_to_track] = bts_to_track
          end
          if bts_of_track = map[:bts_of_track]
            result[:bts_of_track] = bts_to_track
          end
        end
      end
      result
    end
  end
end
