ReTrack::Application.routes.draw do
  get 'func/index', 'func/username', 'func/bts_list'

  get 'defects/grid_config', 'defects/show_all'
  put 'defects/update'


  get 'bts_accounts/list', 'bts_accounts/show',
      'bts_accounts/show_current', 'bts_accounts/form_data_config'
  post 'bts_accounts/create'
  put 'bts_accounts/update', 'bts_accounts/update_current'
  delete 'bts_accounts/destroy'

  get 'report_accounts/list', 'report_accounts/show',
      'report_accounts/show_current', 'report_accounts/form_data_config'
  post 'report_accounts/create'
  put 'report_accounts/update', 'report_accounts/update_current'
  delete 'report_accounts/destroy'

  get 'account_groups/list', 'account_groups/show',
      'account_groups/show_current', 'account_groups/form_data_config'
  post 'account_groups/create'
  put 'account_groups/update', 'account_groups/update_current'
  delete 'account_groups/destroy'

  get 'account_groups/acc_list', 'account_groups/acc_add_list'
  post 'account_groups/add_acc'
  delete 'account_groups/remove_acc'


  get 'func/track_show_report_by_date'
  post 'func/track_save_report_by_date'

  resources :users, :user_sessions

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)
  match 'login' => 'user_sessions#new', :as => :login
  match 'logout' => 'user_sessions#destroy', :as => :logout

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to => "func#index"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'
end
