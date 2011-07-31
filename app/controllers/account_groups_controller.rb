class AccountGroupsController < ApplicationController
  include UserCreations::Controller

  AccToJson = lambda do |acc|
    {
      :id => acc.id,
      :user_name => acc.user.fullname,
      :user_email => acc.user.email,
      :bts => acc.bts,
      :login => acc.login
    }
  end

  # GET /account_groups/acc_list
  def acc_list
    acc_group = AccountGroup.find(params[:id])

    respond_to do |format|
      format.json do
        render json: {
          success: true,
          list: acc_group.bts_accounts.map(&AccToJson)
        }
      end
    end
  end

  # GET /account_groups/acc_add_list
  def acc_add_list
    group_acc_ids = AccountGroup.find(params[:id]).bts_accounts.map do |acc|
      acc.id
    end

    respond_to do |format|
      format.json do
        render json: {
          success: true,
          list: BtsAccount.where(:bts => params[:bts]).reject { |acc|
            group_acc_ids.include? acc.id
          }.map(&AccToJson)
        }
      end
    end
  end

  # POST /account_groups/add_acc
  def add_acc
    acc_group = AccountGroup.find(params[:groupId])
    ActiveSupport::JSON.decode(params[:accIdList]).each do |id|
      acc_group.bts_accounts << BtsAccount.find(id)
    end

    respond_to do |format|
      format.json do
        render json: {
          success: true
        }
      end
    end
  end

  # DELETE /account_groups/remove_acc
  def remove_acc
    group_accounts = AccountGroup.find(params[:groupId]).bts_accounts
    ActiveSupport::JSON.decode(params[:accIdList]).each do |id|
      group_accounts.delete BtsAccount.find(id)
    end

    respond_to do |format|
      format.json do
        render json: {
          success: true
        }
      end
    end
  end
end
