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
          defects = build_bts(bts_account).find_defects
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

  # PUT /func/defect_update.json
  def defect_update
    bts_account = BtsAccount.find_current(current_user_id) # transitive enough

    respond_to do |format|
      format.json do
        begin
          # must raise if update fails
          build_bts(bts_account).update_defect(params[:defect])

          bts_class = bts_account.bts.constantize
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

  # GET /func/track_show_report_by_date.json
  def track_show_report_by_date
    respond_to do |format|
      format.json do
        if tracks = build_tracks(Time.strptime(params[:from], '%m/%d/%Y'),
                                 Time.strptime(params[:to], '%m/%d/%Y'))
          tr = []
          tracks.each do |acc, tracks|
            user = acc.user
            tr += tracks.map do |track|
              {
                user_name: user.fullname,
                bts_account_name: acc.name,
                formatted_id: track.formatted_id,
                description: track.description,
                start_date: track.start_date,
                end_date: track.end_date,
                status_name: DefectTrack::NameOfStatus[track.status],
                status_percent: "#{DefectTrack::PercentOfStatus[track.status]}%"
              }
            end
          end

          render json: {
            success: true,
            tracks: tr
          }
        else
          render json: {
            success: false,
            errormsg: 'No current account group'
          }
        end
      end
    end
  end

  def track_save_report_by_date
    respond_to do |format|
      format.json do
        begin
          report_acc = ReportAccount.find_current current_user_id
          tracks = build_tracks(Time.strptime(params[:from], '%m/%d/%Y'),
                                Time.strptime(params[:to], '%m/%d/%Y'))
          service = report_acc.service.constantize.new({
            :login => report_acc.login,
            :password => report_acc.password
          }).save_report(params[:name], tracks)

          render json: {
            success: true
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

  private

  def build_bts bts_account
    bts_class = bts_account.bts.constantize
    if bts_dump = session[:bts_dump]
       bts_class.new(bts_dump)
    else
       bts = bts_class.new(:login => bts_account.login,
                           :password => bts_account.password,
                           :url => bts_account.url)
       session[:bts_dump] = bts.dump
       bts
    end
  end

  def build_tracks from_time, to_time
    if acc_group = AccountGroup.find_current(current_user_id)
      tracks = {}
      acc_group.bts_accounts.each do |bts_acc|
        acc_tracks = []
        acc_tracks += DefectTrack.find(:all, :conditions => {
          :bts_account_id => bts_acc.id,
          :start_date => from_time..to_time
        })
        acc_tracks |= DefectTrack.find(:all, :conditions => {
          :bts_account_id => bts_acc.id,
          :end_date => from_time..to_time
        })
        tracks[bts_acc] = acc_tracks unless acc_tracks.empty?
      end
      tracks
    end
  end

end
