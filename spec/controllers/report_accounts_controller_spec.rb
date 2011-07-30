require 'spec_helper'

describe ReportAccountsController do
  it_should_act_like "UserCreations::Controller",
                        :user_creations_model => ReportAccount
end
