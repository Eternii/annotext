FactoryGirl.define do
  factory :user do
    sequence(:name)         { |n| "Person #{n}" }
    sequence(:email)        { |n| "person_#{n}@example.com" }
    password                "foobar"
    password_confirmation   "foobar"

    factory :admin do
      admin true
    end
  end

  factory :text do
    sequence(:title)        { |n| "Text #{n}" }
    sequence(:author)       { |n| "Author #{n}" }
    sequence(:position)     { |n| n }
    released                true
    lang_to_id              3
    lang_from_id            1
    user
  end
end
