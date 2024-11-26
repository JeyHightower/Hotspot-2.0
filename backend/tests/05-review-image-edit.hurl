# CSRF
GET {{url}}/api/csrf/restore
HTTP 200
[Captures]
csrf_token: jsonpath "$['XSRF-Token']"

POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "landowner@evil.inc",
  "password": "eggs-and-bacon"
}
HTTP 200

POST {{url}}/api/spots
XSRF-Token: {{csrf_token}}
{
  "address": "Disney Lane",
  "city": "San Francisco",
  "state": "California",
  "country": "United States of America",
  "lat": 37.7645358,
  "lng": -122.4730327,
  "name": "Jon Academy",
  "description": "Place where web developers are created",
  "price": 123
}
HTTP 201
[Captures]
spot_id: jsonpath "$.id"


POST {{url}}/api/spots/{{spot_id}}/reviews
XSRF-Token: {{csrf_token}}
{
  "review": "This place is awesome please come by and give me mone- the owners some money for this amazing place",
  "stars": 5
}
HTTP 201
[Asserts]
jsonpath "$.id" exists
jsonpath "$.userId" exists
jsonpath "$.spotId" exists
jsonpath "$.review" ==  "This place is awesome please come by and give me mone- the owners some money for this amazing place"
jsonpath "$.stars" == 5
jsonpath "$.createdAt" exists
jsonpath "$.updatedAt" exists
[Captures]
review_id: jsonpath "$.id"



POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{
  "url": "amongus"
}
HTTP 201
[Asserts]
jsonpath "$.id" exists
jsonpath "$.url" == "amongus"

POST {{url}}/api/reviews/345345346456/images
XSRF-Token: {{csrf_token}}
{
  "url": "amongus"
}
HTTP 404
[Asserts]
jsonpath "$.message" == "Review couldn't be found"

POST {{url}}/api/reviews/asdfgdfg/images
XSRF-Token: {{csrf_token}}
{
  "url": "amongus"
}
HTTP 404
[Asserts]
jsonpath "$.message" == "Review couldn't be found"


POST {{url}}/api/reviews/null/images
XSRF-Token: {{csrf_token}}
{
  "url": "amongus"
}
HTTP 404
[Asserts]
jsonpath "$.message" == "Review couldn't be found"


POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
HTTP 403
[Asserts]
jsonpath "$.message" == "Maximum number of images for this resource was reached"


DELETE {{url}}/api/session
XSRF-Token: {{csrf_token}}
HTTP 200


POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
HTTP 401
[Asserts]
jsonpath "$.message" exists


POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "demo@user.io",
  "password": "password1"
}
HTTP 200

POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{ "url": "amongus" }
HTTP 403
[Asserts]
jsonpath "$.message" exists

POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "landowner@evil.inc",
  "password": "eggs-and-bacon"
}
HTTP 200

PUT {{url}}/api/reviews/{{review_id}}
XSRF-Token: {{csrf_token}}
{
  "review": "this review has been taken down due to being created by the spot owner",
  "stars": 1
}
HTTP 200
[Asserts]
jsonpath "$.review" ==  "this review has been taken down due to being created by the spot owner"

POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "demo@user.io",
  "password": "password1"
}
HTTP 200

PUT {{url}}/api/reviews/{{review_id}}
XSRF-Token: {{csrf_token}}
{
  "review": "this review has been taken down due to being created by the spot owner",
  "stars": 1
}
HTTP 403
[Asserts]
jsonpath "$.message" exists


PUT {{url}}/api/reviews/{{review_id}}
XSRF-Token: {{csrf_token}}
{
  "stars": 1
}
HTTP 400
[Asserts]
jsonpath "$.message" exists

PUT {{url}}/api/reviews/dsfgjdnsfgkdsjlngf
XSRF-Token: {{csrf_token}}
{
  "stars": 1,
  "review": "amogus"
}
HTTP 404
[Asserts]
jsonpath "$.message" exists
