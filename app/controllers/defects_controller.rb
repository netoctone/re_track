class DefectsController < ApplicationController
  before_filter :require_user

  # GET /defects/grid_config.json
  def grid_config
    session[:bts_dump] = nil
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

  # GET /defects/show_all.json
  def show_all
    bts_account = BtsAccount.find_current(current_user_id) # transitive enough

    respond_to do |format|
      format.json do
        begin
          defects = build_bts(bts_account).find_all
          render json: {
            success: true,
            defects: defects
          }
        rescue WebAPI::Error => e
          render json: {
            success: false,
            errormsg: e.message
          }
        end
      end
    end
  end

  # PUT /defects/update.json
  def update
    bts_account = BtsAccount.find_current(current_user_id) # transitive enough

    respond_to do |format|
      format.json do
        begin
          # must raise if update fails
          build_bts(bts_account).update(params[:defect])

          bts_class = bts_account.bts.constantize
          track_data = bts_class.params_to_track_data(params[:defect])
          track_data[:bts_account_id] = bts_account.id

          begin
            DefectTrack.track(track_data)
            render json: {
              success: true,
              defect: {}
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

  private

  def build_bts bts_account
    bts_class = bts_account.bts.constantize
    if bts_dump = session[:bts_dump]
       bts_class.new(bts_dump)
    else
       bts = bts_class.new(:login => bts_account.login,
                           :password => bts_account.password,
                           :url => bts_account.url,
                           :proxy => bts_account.proxy)
       session[:bts_dump] = bts.dump
       bts
    end
  end

end
