class DefectTrack < ActiveRecord::Base
  belongs_to :bts_account

  validates :bts_account, :formatted_id, :presence => true

  NameOfStatus = [
    'In-Progress',
    'In-Progress',
    'Sent-RFR',
    'Committed'
  ].freeze
  PercentOfStatus = [
    50,
    80,
    90,
    100
  ].freeze
  PercentToStatus = {
    50 => 0,
    80 => 1,
    90 => 2,
    100 => 3
  }.freeze

  class << self
    def track data
      record = self.find_or_initialize_by_bts_account_id_and_formatted_id(data[:bts_account_id], data[:formatted_id])

      data[:end_date] = Time.now if data[:status] == PercentToStatus[90]
      data[:start_date] = Time.now if record.start_date.nil? and
                                      data[:status] == PercentToStatus[50]
      record.update_attributes(data)
    end
  end
end
