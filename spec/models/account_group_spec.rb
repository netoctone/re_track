require 'spec_helper'

describe AccountGroup do
  let :valid_record do
    AccountGroup.new({
      :name => 'name',
      :user => mock_model(User)
    })
  end

  it_behaves_like "UserCreations::Model"

  it "is not valid without a name" do
    valid_record.name = nil
    valid_record.should_not be_valid
  end
end
