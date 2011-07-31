require 'spec_helper'

describe BtsAccount do
  before :each do
    WebAPI::JiraBts.stub(:new)
  end

  let :valid_record do
    BtsAccount.new({
      :bts => 'WebAPI::JiraBts',
      :login => 'login',
      :password => 'password',
      :user => mock_model(User)
    })
  end

  it_behaves_like "UserCreations::Model"

  it "is not valid without a bts" do
    valid_record.bts = nil
    valid_record.should_not be_valid
  end

  it_should_act_like "validates_with AuthenticableValidator",
                     :service => WebAPI::JiraBts

end
