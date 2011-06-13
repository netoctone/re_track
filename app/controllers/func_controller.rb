class FuncController < ApplicationController
  before_filter :require_user

  # GET /func
  # GET /func/index
  def index
  end

  # GET /func/username.json
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

  # GET /func/bts_list.json
  def bts_list
    respond_to do |format|
      format.json do
        render json: {
          success: true,
          list: WebAPI::Bts.list.map do |bts|
            { display: bts.name, value: bts.name }
          end
        }
      end
    end
  end

  # GET /func/defect_grid_config.json
  def defect_grid_config
    session[:bts] = nil
    respond_to do |format|
      format.json do
        begin
          render json: {
            success: true,
            config: params[:bts].constantize.grid_config
          }
        rescue NameError
          render json: {
            success: false,
            errormsg: 'BTS \'' + params[:bts] + '\' not supported'
          }
        end
      end
    end
  end

  # GET /func/defect_show_all.json
  def defect_show_all
    bts_account = BtsAccount.find_current(current_user_id) # transitive enough

    respond_to do |format|
      format.json do
        begin
          bts_class = bts_account.bts.constantize
          bts = session[:bts]
          bts = session[:bts] = bts_class.new(bts_account.login,
                                              bts_account.password) unless bts
          defects = bts.find_defects
          render json: {
            success: true,
            defects: defects
          }
        rescue WebAPI::NotAvailableError => e
          render json: {
            success: false,
            errormsg: e.message
          }
        end
      end
    end
  end

  # PUT /func/defect_update.json
  def defect_update
    bts_account = BtsAccount.find_current(current_user_id) # transitive enough

    respond_to do |format|
      format.json do
        begin
          bts_class = bts_account.bts.constantize
          bts = session[:bts]
          bts = session[:bts] = bts_class.new(bts_account.login,
                                              bts_account.password) unless bts
          bts.update_defect(params[:defect]) # must raise if update fails
          track_data = bts_class.params_to_track_data(params[:defect])
          track_data[:bts_account_id] = bts_account.id
          begin
            DefectTrack.track(track_data)
            render json: {
              success: true
            }
          rescue StandardError => e
            render json: {
              success: false,
              bts_update_success: true,
              errormsg: 'Failed to track your change (for reporting)'
            }
          end
        rescue StandardError => e
          render json: {
            success: false,
            errormsg: e.message
          }
        end
      end
    end
  end

end
