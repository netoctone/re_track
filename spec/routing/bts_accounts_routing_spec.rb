require "spec_helper"

describe BtsAccountsController do
  describe "routing" do

    it "recognizes and generates #list" do
      { :get => "/bts_accounts/list" }.should route_to(:controller => "bts_accounts", :action => "list")
    end

    it "recognizes and generates #show" do
      { :get => "/bts_accounts/show" }.should route_to(:controller => "bts_accounts", :action => "show")
    end

    it "recognizes and generates #show_current" do
      { :get => "/bts_accounts/show_current" }.should route_to(:controller => "bts_accounts", :action => "show_current")
    end

    it "recognizes and generates #create" do
      { :post => "/bts_accounts/create" }.should route_to(:controller => "bts_accounts", :action => "create")
    end

    it "recognizes and generates #update" do
      { :put => "/bts_accounts/update" }.should route_to(:controller => "bts_accounts", :action => "update")
    end

    it "recognizes and generates #update_current" do
      { :put => "/bts_accounts/update_current" }.should route_to(:controller => "bts_accounts", :action => "update_current")
    end

    it "recognizes and generates #destroy" do
      { :delete => "/bts_accounts/destroy" }.should route_to(:controller => "bts_accounts", :action => "destroy")
    end

  end
end
