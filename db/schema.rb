# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140401234927) do

  create_table "definitions", force: true do |t|
    t.string   "term"
    t.string   "lex_class"
    t.string   "definition"
    t.integer  "text_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "definitions", ["text_id"], name: "index_definitions_on_text_id"

  create_table "languages", force: true do |t|
    t.string   "name"
    t.string   "abbreviation"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "matches", force: true do |t|
    t.string   "word"
    t.integer  "definition_id"
    t.integer  "text_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "matches", ["definition_id"], name: "index_matches_on_definition_id"
  add_index "matches", ["text_id"], name: "index_matches_on_text_id"
  add_index "matches", ["word", "text_id"], name: "index_matches_on_word_and_text_id"

  create_table "media", force: true do |t|
    t.string   "location"
    t.string   "media_type"
    t.string   "title"
    t.string   "description"
    t.integer  "text_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "phrases", force: true do |t|
    t.string   "term"
    t.string   "definition"
    t.integer  "text_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "phrases", ["text_id"], name: "index_phrases_on_text_id"

# Could not dump table "sqlite_stat1" because of following NoMethodError
#   undefined method `[]' for nil:NilClass

  create_table "texts", force: true do |t|
    t.string   "title"
    t.string   "author"
    t.integer  "lang_from_id"
    t.integer  "lang_to_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "user_id"
    t.integer  "position"
    t.boolean  "released"
  end

  create_table "users", force: true do |t|
    t.string   "name"
    t.string   "email"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "password_digest"
    t.string   "remember_token"
    t.boolean  "admin",           default: false
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true
  add_index "users", ["remember_token"], name: "index_users_on_remember_token"

end
