require "spec_helper"

describe UserSessionsController do
  describe "routing" do

    it "recognizes and generates #login" do
      { :get => "/login" }.should route_to(:controller => "user_sessions", :action => "new")
    end

    it "recognizes and generates #create" do
      { :post => "/user_sessions" }.should route_to(:controller => "user_sessions", :action => "create")
    end

    it "recognizes and generates #logout" do
      { :delete => "/logout" }.should route_to(:controller => "user_sessions", :action => "destroy")
    end

  end
end
