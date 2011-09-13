require 'spec_helper'

describe AccountGroupsController do
  it_should_act_like "UserCreations::Controller",
                        :user_creations_model => AccountGroup
end
