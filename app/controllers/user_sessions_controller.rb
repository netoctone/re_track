class UserSessionsController < ApplicationController
  # /login
  def new
    @user_session = UserSession.new

    respond_to do |format|
      format.html # new.html.erb
    end
  end

  # POST /user_sessions
  def create
    @user_session = UserSession.new(params[:user_session])

    respond_to do |format|
      if @user_session.save
        format.html { redirect_to(:root, :notice => 'Login successful.') }
      else
        format.html { render :action => "new" }
      end
    end
  end

  # /logout
  def destroy
    UserSession.find.destroy

    respond_to do |format|
      format.html { redirect_to(:users, :notice => 'Goodbye!') }
    end
  end
end
