class ApplicationController < ActionController::Base
  protect_from_forgery

  helper_method :current_user_session, :current_user

  def current_user_session
    logger.debug "#{self.class.name}##{__method__}"
    return @current_user_session if defined? @current_user_session
    @current_user_session = UserSession.find
  end

  def current_user
    logger.debug "#{self.class.name}##{__method__}"
    return @current_user if defined? @current_user
    @current_user = current_user_session && current_user_session.user
  end

  def require_user
    logger.debug "#{self.class.name}##{__method__}"
    if current_user
      store_location
      redirect_to :users, :notice => 'You must be logged in'
      return false
    end
  end

  def store_location
    session[:stored_location] = request.request_url
  end

  def redirect_back_or_default default
    redirect_to(session[:stored_location] || default)
    session[:stored_location] = nil
  end
end
