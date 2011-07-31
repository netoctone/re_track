require 'spec_helper'

describe ReportAccount do
  before :each do
    WebAPI::GoogleSpreadsheets.stub(:new)
  end

  let :valid_record do
    ReportAccount.new({
      :service => 'WebAPI::GoogleSpreadsheets',
      :login => 'login',
      :password => 'password',
      :user => mock_model(User)
    })
  end

  it_behaves_like "UserCreations::Model"

  it "is not valid without a service" do
    valid_record.service = nil
    valid_record.should_not be_valid
  end

  it_should_act_like "validates_with AuthenticableValidator",
                     :service => WebAPI::GoogleSpreadsheets
end
