shared_examples_for "UserCreations::Controller" do

  context "when auth check successful" do

    let(:stub_record) { stub_model(user_creations_model) }

    before :each do
      controller.stub(:require_user)
    end

    describe "GET list.json" do
      it "searches for user_creation of current user" do
        controller.should_receive(:current_user_id).and_return(10)
        user_creations_model.should_receive(:where).with(
          { :user_id => 10 }
        ).and_return([])
        get :list, :format => 'json'
      end

      it "renders json with 'success' => true" do
        user_creations_model.stub(:where).and_return([])
        get :list, :format => 'json'
        JSON.parse(response.body)['success'].should eq true
      end
    end

    describe 'GET show.json' do
      it "searches for requested user_creation" do
        user_creations_model.should_receive(:find).with('15')
                                                  .and_return(stub_record)
        get :show, :format => 'json', :id => '15'
      end

      it "renders json with 'success' => true" do
        user_creations_model.stub(:find).and_return(stub_record)
        get :show, :format => 'json', :id => '15'
        JSON.parse(response.body)['success'].should eq true
      end
    end

    describe 'GET show_current.json' do
      it "searches for last used user_creation of current user" do
        controller.should_receive(:current_user_id).and_return(10)
        user_creations_model.should_receive(:find_current).with(10)
        .and_return(stub_record)
        get :show_current, :format => 'json'
      end

      context "when current user_creation exists" do
        it "renders json with 'success' => true" do
          user_creations_model.stub(:find_current).and_return(stub_record)
          get :show_current, :format => 'json'
          JSON.parse(response.body)['success'].should eq true
        end
      end

      context "when current user_creation does not exist" do
        it "renders json with 'success' => false" do
          user_creations_model.stub(:find_current).and_return(nil)
          get :show_current, :format => 'json'
          JSON.parse(response.body)['success'].should eq false
        end
      end
    end

    describe "DELETE destroy.json" do
      it "tries to destroy specified user_creation" do
        user_creations_model.should_receive(:destroy).with(10)
        delete :destroy, :format => 'json', :id => 10
      end

      it "renders json with 'success' => true" do
        user_creations_model.stub(:destroy)
        delete :destroy, :format => 'json'
        JSON.parse(response.body)['success'].should eq true
      end
    end

    describe "GET form_data_config.json" do
      it "renders json with 'success' => true" do
        get :form_data_config, :format => 'json'
        JSON.parse(response.body)['success'].should eq true
      end
    end

  end
end
