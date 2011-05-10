require 'spec_helper'

describe "users/show.html.erb" do
  before(:each) do
    @user = assign(:user, stub_model(User,
      :first_name => "First Name",
      :last_name => "Last Name",
      :email => "Email",
      :crypted_password => "Crypted Password",
      :password_salt => "Password Salt",
      :persistence_token => "Persistence Token"
    ))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/First Name/)
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Last Name/)
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Email/)
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Crypted Password/)
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Password Salt/)
    # Run the generator again with the --webrat flag if you want to use webrat matchers
    rendered.should match(/Persistence Token/)
  end
end
