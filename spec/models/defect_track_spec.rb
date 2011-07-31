require 'spec_helper'

describe DefectTrack do
  let :valid_record do
    DefectTrack.new({
      :bts_account => mock_model(BtsAccount),
      :formatted_id => 'formatted id'
    })
  end

  it "should be valid with valid attributes" do
    valid_record.should be_valid
  end

  it "should not be valid without bts_account" do
    valid_record.bts_account = nil
    valid_record.should_not be_valid
  end

  it "should not be valid without formatted_id" do
    valid_record.formatted_id = nil
    valid_record.should_not be_valid
  end

  describe "::track" do
    it "tries to use already existing record" do
      DefectTrack.should_receive(
        :find_or_initialize_by_bts_account_id_and_formatted_id
      ).with('id_of_bts_acc', 'id_of_defect').and_return(valid_record)
      DefectTrack.track({
        :bts_account_id => 'id_of_bts_acc',
        :formatted_id => 'id_of_defect'
      })
    end

    it "updates found or initialized record" do
      DefectTrack.stub(
        :find_or_initialize_by_bts_account_id_and_formatted_id
      ).and_return(valid_record)
      valid_record.should_receive(:update_attributes).with(hash_including(
        'these' => 'params'
      ))
      DefectTrack.track('these' => 'params')
    end
  end
end
