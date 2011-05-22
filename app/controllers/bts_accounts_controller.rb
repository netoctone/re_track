class BtsAccountsController < ApplicationController
  before_filter :require_user

  # GET /bts_accounts/list.json
  def list
    respond_to do |format|
      format.json do
        render json: {
          success: true,
          accounts: BtsAccount.where(:user_id => current_user.id).map do |acc|
            { id: acc.id, name: acc.name }
          end
        }
      end
    end
  end

  # GET /bts_accounts/show.json
  def show
    bts_account = BtsAccount.find(params[:id])

    respond_to do |format|
      format_json(format, bts_account)
    end
  end
  
  # POST /bts_accounts.json
  def create
    params[:bts_account][:user_id] = current_user.id
    bts_account = BtsAccount.new(params[:bts_account])

    respond_to do |format|
      if bts_account.save
        format.json do
          render json: {
            success: true,
            id: bts_account.id #maybe send complete form data
          }
        end
      else
        format.json do
          render json: {
            success: false,
            errors: bts_account.errors #maybe change format
          }
        end
      end
    end
  end

  # PUT /bts_accounts/update.json
  def update
    bts_account = BtsAccount.find(params[:id])

    #does it make any sense?
    params[:bts_account].delete_if do |key, value|
      bts_account.send(key) == value
    end

    respond_to do |format|
      if bts_account.update_attributes(params[:bts_account])
        format_json(format, bts_account)
      else
        format.json do
          render json: {
            success: false,
            errors: bts_account.errors #maybe change format
          }
        end
      end
    end
  end

  # DELETE /bts_accounts/destroy.json
  def destroy
    bts_account = BtsAccount.find(params[:id])
    bts_account.destroy #is check needed?

    respond_to do |format|
      format.json do
        render json: {
          success: true
        }
      end
    end
  end

  private 
  def format_json format, bts_account
    format.json do
      render :json => {
        :success => true,
        :account => {
          'id' => bts_account.id,
          'bts_account[bts]' => bts_account.bts,
          'bts_account[name]' => bts_account.name,
          'bts_account[login]' => bts_account.login,
          'bts_account[password]' => bts_account.password
        }
      }
    end
  end
end
