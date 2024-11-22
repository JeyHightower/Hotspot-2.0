# CSRF
GET {{url}}/api/csrf/restore
HTTP 200
[Captures]
csrf_token: jsonpath "$['XSRF-Token']"

# Get the Current User
GET {{url}}/api/session
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.user" == null

# Log In a User
POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "demo@user.io",
  "password": "password1"
}
HTTP 200
[Asserts]
jsonpath "$.user" exists
jsonpath "$.user.id" exists
jsonpath "$.user.email" == "demo@user.io"
jsonpath "$.user.username" exists
jsonpath "$.user.firstName" exists
jsonpath "$.user.lastName" exists


# Log In a User
POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "",
  "password": ""
}
HTTP 400
[Asserts]
jsonpath "$.message" == "Bad Request"
jsonpath "$.errors.credential" exists
jsonpath "$.errors.password" exists

# Log In a User
POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "sdfsdaf",
  "password": "asdasfs"
}
HTTP 401
[Asserts]
jsonpath "$.message" == "Invalid credentials"


# Get the Current User
GET {{url}}/api/session
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.user" exists
jsonpath "$.user.id" exists
jsonpath "$.user.email" == "demo@user.io"
jsonpath "$.user.username" exists
jsonpath "$.user.firstName" exists
jsonpath "$.user.lastName" exists


# Sign Up a User
POST {{url}}/api/users
XSRF-Token: {{csrf_token}}
{
  "email": "{{uniq_email}}",
  "password": "yayayayayayayay",
  "username": "{{uniq_username}}",
  "firstName": "josh",
  "lastName": "geronimo"
}
HTTP 201
[Asserts]
jsonpath "$.user" exists
jsonpath "$.user.id" exists
jsonpath "$.user.email" == {{uniq_email}}
jsonpath "$.user.username" == {{uniq_username}}
jsonpath "$.user.firstName" == "josh"
jsonpath "$.user.lastName" == "geronimo"



# Sign Up a User
POST {{url}}/api/users
XSRF-Token: {{csrf_token}}
{
  "email": "{{uniq_email}}",
  "password": "yayayayayayayay",
  "username": "{{uniq_username}}",
  "firstName": "josh",
  "lastName": "geronimo"
}
HTTP 500
[Asserts]
jsonpath "$.message" == "User already exists"
jsonpath "$.errors.username" == "User with that username already exists"


# Sign Up a User
POST {{url}}/api/users
XSRF-Token: {{csrf_token}}
{
  "email": "{{uniq_email}}",
  "password": "yayayayayayayay",
  "username": "random",
  "firstName": "josh",
  "lastName": "geronimo"
}
HTTP 500
[Asserts]
jsonpath "$.message" == "User already exists"
jsonpath "$.errors.email" == "User with that email already exists"


# Sign Up a User
POST {{url}}/api/users
XSRF-Token: {{csrf_token}}
{
  "username": "random",
  "firstName": "josh",
  "lastName": "geronimo"
}
HTTP 400
[Asserts]
jsonpath "$.message" == "Bad Request"

