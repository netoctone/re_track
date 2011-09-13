require 'spec_helper'

describe "users/index.html.erb" do
  before(:each) do
    assign(:users, [
      stub_model(User,
        :first_name => "First Name",
        :last_name => "Last Name",
        :email => "Email",
      ),
      stub_model(User,
        :first_name => "First Name",
        :last_name => "Last Name",
        :email => "Email",
      )
    ])
  end

  it "renders a list of users" do
    render

    assert_select "tr>td", :text => "First Name Last Name".to_s, :count => 2
    assert_select "tr>td", :text => "Email".to_s, :count => 2
  end
end
