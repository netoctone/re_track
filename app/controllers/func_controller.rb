class FuncController < ApplicationController
  before_filter :require_user

  def index
  end

  def username
    user = current_user

    respond_to do |format|
      format.json do
        if user
          render json: {
            success: true,
            username: user.fullname
          }
        else
          render json: {
            success: false,
            error: 'you aren\'t logged in'
          }
        end
      end
    end
  end

end
