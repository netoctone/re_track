class ApplicationController < ActionController::Base
  protect_from_forgery

  helper_method :current_user_session, :current_user

  private

  def current_user_session
    logger.debug "#{self.class.name}##{__method__}"
    return @current_user_session if defined? @current_user_session
    @current_user_session = UserSession.find
  end

  def current_user_id # need to improve efficiency
    logger.debug "#{self.class.name}##{__method__}"
    return current_user_session && current_user_session.user.id
  end

  def current_user
    logger.debug "#{self.class.name}##{__method__}"
    return @current_user if defined? @current_user
    @current_user = current_user_session && current_user_session.user
  end

  def require_user
    logger.debug "#{self.class.name}##{__method__}"
    unless current_user
      store_location
      redirect_to :users, :notice => 'You must be logged in'
      return false
    end
  end

  def store_location
    session[:stored_location] = request.request_uri
  end

  def redirect_back_or_default default
    redirect_to(session[:stored_location] || default)
    session[:stored_location] = nil
  end
end
