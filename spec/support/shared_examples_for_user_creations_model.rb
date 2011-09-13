shared_examples_for "UserCreations::Model" do

  it "is valid with valid attributes" do
    valid_record.should be_valid
  end

  it "is not valid without a user" do
    valid_record.user = nil
    valid_record.should_not be_valid
  end

end
