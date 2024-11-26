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
[Captures]
review_id: jsonpath "$.id"

DELETE {{url}}/api/reviews/{{review_id}}
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.message" == "Successfully deleted"


POST {{url}}/api/spots/{{spot_id}}/reviews
XSRF-Token: {{csrf_token}}
{
  "review": "This place is awesome please come by and give me mone- the owners some money for this amazing place",
  "stars": 5
}
HTTP 201
[Captures]
review_id: jsonpath "$.id"


POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "demo@user.io",
  "password": "password1"
}
HTTP 200

DELETE {{url}}/api/reviews/{{review_id}}
XSRF-Token: {{csrf_token}}
HTTP 403
[Asserts]
jsonpath "$.message" exists


DELETE {{url}}/api/reviews/NoneReview
XSRF-Token: {{csrf_token}}
HTTP 404
[Asserts]
jsonpath "$.message" == "Review couldn't be found"

DELETE {{url}}/api/reviews/352345325432543
XSRF-Token: {{csrf_token}}
HTTP 404
[Asserts]
jsonpath "$.message" == "Review couldn't be found"
