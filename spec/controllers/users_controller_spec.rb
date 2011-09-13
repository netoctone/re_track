require 'spec_helper'

describe UsersController do

  def mock_user(stubs={})
    @mock_user ||= mock_model(User, stubs).as_null_object
  end

  describe "GET index" do
    it "assigns all users as @users" do
      User.stub(:all) { [mock_user] }
      get :index
      assigns(:users).should eq([mock_user])
    end
  end

  describe "GET show" do
    context "when auth check successful" do
      before :each do
        controller.stub(:require_user)
      end

      it "assigns the requested user as @user" do
        User.stub(:find).with("37") { mock_user }
        get :show, :id => "37"
        assigns(:user).should be(mock_user)
      end
    end
  end

  describe "GET new" do
    it "assigns a new user as @user" do
      User.stub(:new) { mock_user }
      get :new
      assigns(:user).should be(mock_user)
    end
  end

  describe "POST create" do
    describe "with valid params" do
      it "assigns a newly created user as @user" do
        User.stub(:new).with({'these' => 'params'}) {
          mock_user(:save => true)
        }
        post :create, :user => {'these' => 'params'}
        assigns(:user).should be(mock_user)
      end

      it "redirects to the created user" do
        User.stub(:new) { mock_user(:save => true) }
        post :create, :user => {}
        response.should redirect_to(user_url(mock_user))
      end
    end

    describe "with invalid params" do
      it "assigns a newly created but unsaved user as @user" do
        User.stub(:new).with({'these' => 'params'}) {
          mock_user(:save => false)
        }
        post :create, :user => {'these' => 'params'}
        assigns(:user).should be(mock_user)
      end

      it "re-renders the 'new' template" do
        User.stub(:new) { mock_user(:save => false) }
        post :create, :user => {}
        response.should render_template("new")
      end
    end
  end

end
