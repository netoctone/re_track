class BtsAccountsController < ApplicationController
  include UserCreations::Controller

  # all unspecified columns will be added automatically
  # (except :id, :user_id, :created_at, :updated_at),
  # to forbid this, set value :false
  #
  # if column does not have :type, it will be fetched from record (model)
  #
  # value :true is the same as empty hash
  #
  # every hash key must be a Symbol
  configure_form_data({
    :bts => {
      :label => :BTS,
      :type => :combo,
      :options => Bts.bts_list.map do |bts|
        { :display => bts.name, :value => bts.name }
      end
    }
  })
end
