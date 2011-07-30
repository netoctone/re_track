require 'spec_helper'

describe BtsAccountsController do
  it_should_act_like "UserCreations::Controller",
                     :user_creations_model => BtsAccount

  context "auth successful" do

    before :each do
      controller.stub(:require_user)
    end

    let(:user_creations_model) { BtsAccount }
    let(:stub_record) { stub_model(BtsAccount).as_null_object }

    describe "POST create.json" do
      before :each do
        controller.stub(:current_user_id)
      end

      it "tries to create new user_creation for current user" do
        controller.should_receive(:current_user_id).and_return(10)
        user_creations_model.should_receive(:new).with({
          'user_id' => 10,
          'proxy' => 'data'
        }).and_return(mock_model(user_creations_model).as_null_object)
        post :create, :format => 'json', :bts_account => { :proxy => 'data' }
      end

      context "when user_creation saves successfully" do
        before :each do
          stub_record.stub(:save).and_return(true)
        end

        it "renders json with 'success' => true" do
          user_creations_model.stub(:new).and_return(stub_record)
          post :create, :format => 'json', :bts_account => { :proxy => 'data' }
          JSON.parse(response.body)['success'].should eq true
        end
      end

      context "when user_creation fails to save" do
        before :each do
          stub_record.stub(:save).and_return(false)
        end

        it "renders json with 'success' => false" do
          user_creations_model.stub(:new).and_return(stub_record)
          post :create, :format => 'json', :bts_account => { :proxy => 'data' }
          JSON.parse(response.body)['success'].should eq false
        end
      end
    end

    describe "PUT update.json" do
      let :mock_record do
        mock = mock_model(user_creations_model)
        mock.stub(:update_attributes)
        mock.stub(:proxy)
        mock
      end

      it "searches for specified user_creation" do
        user_creations_model.should_receive(:find).with(10).and_return(mock_record)
        put :update, {
          :format => 'json',
          :id => 10,
          :bts_account => { :proxy => 'data' }
        }
      end

      it "updates specified user_creation" do
        user_creations_model.stub(:find).and_return(mock_record)
        mock_record.should_receive(:update_attributes).with(
          'proxy' => 'data'
        )
        put :update, {
          :format => 'json',
          :id => 10,
          :bts_account => { :proxy => 'data' }
        }
      end

      context "when user_creation updates successfully" do
        it "renders json with 'success' => true" do
          mock_record.stub(:bts => true, :url => true,
                            :login => true, :password => true)
          user_creations_model.stub(:find).and_return(mock_record)
          mock_record.stub(:update_attributes).and_return(true)
          put :update, {
            :format => 'json',
            :id => 10,
            :bts_account => { :proxy => 'data' }
          }
          JSON.parse(response.body)['success'].should eq true
        end
      end

      context "when user_creation fails to update" do
        it "renders json with 'success' => false" do
          user_creations_model.stub(:find).and_return(mock_record)
          mock_record.stub(:update_attributes).and_return(false)
          put :update, {
            :format => 'json',
            :id => 10,
            :bts_account => { :proxy => 'data' }
          }
          JSON.parse(response.body)['success'].should eq false
        end
      end
    end

  end

end
