require 'spec_helper'

describe FuncController do

  context "when auth check successful" do

    before :each do
      controller.stub(:require_user)
    end

    describe "GET index" do
      it "should be successful" do
        get 'index'
        response.should be_success
      end
    end

  end

end
