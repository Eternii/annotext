FactoryGirl.define do
  factory :user do
    name                    "Robert Eastman"
    email                   "reastman@example.com"
    password                "foobar"
    password_confirmation   "foobar"
  end
end
