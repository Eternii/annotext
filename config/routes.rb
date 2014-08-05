Annotext::Application.routes.draw do

  root  'texts#index'
  match '/help',        to: 'static_pages#help',        via: 'get'
  match '/editor_help', to: 'static_pages#editor_help', via: 'get'
  match '/about',       to: 'static_pages#about',       via: 'get'
  match '/contact',     to: 'static_pages#contact',     via: 'get'
  match '/history',     to: 'static_pages#history',     via: 'get'

  match '/signin',      to: 'sessions#new',             via: 'get'
  match '/signout',     to: 'sessions#destroy',         via: 'delete'

  match '/scripts',     to: 'scripts#index',            via: 'get'
  match '/complete',    to: 'scripts#complete',         via: 'get'

  resources :users
  resources :sessions, only: [:new, :create, :destroy]
  resources :texts do
    collection do
      get :order #'order'     # !!! Shouldn't be a get...
    end
    member do
      patch :release, :save, :delete, :save_about
      get   :about
    end
  end

  resources :media do
    member do
      get :close
    end
  end

  resources :matches,     only: [:create, :show, :edit, :update, :destroy]
  resources :phrases,     only: [:create, :show, :edit, :update, :destroy]
  resources :definitions, except: [:index] do
    member do
      post :copy_to_gloss, :copy_to_dict
      get  :close
    end
  end

  # match '/signup',  to: 'users#new',    via: 'get'




  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
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

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end
  
  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
