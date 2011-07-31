class DefectTrack < ActiveRecord::Base
  belongs_to :bts_account

  validates :bts_account, :formatted_id, :presence => true

  NameOfStatus = [
    'Review',
    'Review',
    'Review',
    'In-Progress',
    'In-Progress',
    'In-Progress',
    'Sent-RFR',
    'Committed'
  ].freeze
  PercentOfStatus = [
    0,
    10,
    20,
    50,
    60,
    80,
    90,
    100
  ].freeze
  PercentToStatus = {
    0 => 0,
    10 => 1,
    20 => 2,
    50 => 3,
    60 => 4,
    80 => 5,
    90 => 6,
    100 => 7
  }.freeze

  class << self
    def track data
      record = self.find_or_initialize_by_bts_account_id_and_formatted_id(data[:bts_account_id], data[:formatted_id])

      data[:end_date] = Time.now if data[:status].to_i == PercentToStatus[90]
      data[:start_date] = Time.now if record.start_date.nil? and
                                      data[:status].to_i == PercentToStatus[50]
      record.update_attributes(data)
    end
  end
end
