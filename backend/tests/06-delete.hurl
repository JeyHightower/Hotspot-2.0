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


POST {{url}}/api/spots/{{spot_id}}/images
XSRF-Token: {{csrf_token}}
{
  "url": "amogus.txt",
  "preview": true
}
HTTP 201
[Captures]
image_id: jsonpath "$.id"


DELETE {{url}}/api/spot-images/{{image_id}}
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.message" == "Successfully deleted"


DELETE {{url}}/api/spot-images/{{image_id}}
XSRF-Token: {{csrf_token}}
HTTP 404
[Asserts]
jsonpath "$.message" == "Spot Image couldn't be found"


POST {{url}}/api/spots/{{spot_id}}/images
XSRF-Token: {{csrf_token}}
{
  "url": "amogus.txt",
  "preview": true
}
HTTP 201
[Captures]
image_id: jsonpath "$.id"

DELETE {{url}}/api/session
XSRF-Token: {{csrf_token}}
HTTP 200


DELETE {{url}}/api/spot-images/{{image_id}}
XSRF-Token: {{csrf_token}}
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


DELETE {{url}}/api/spot-images/{{image_id}}
XSRF-Token: {{csrf_token}}
HTTP 403
[Asserts]
jsonpath "$.message" exists


POST {{url}}/api/spots/{{spot_id}}/reviews
XSRF-Token: {{csrf_token}}
{
  "review": "This place is awesome please come by and give me mone- the owners some money for this amazing place",
  "stars": 5
}
HTTP 201
[Captures]
review_id: jsonpath "$.id"

## REVIEW IMAGE DELETE STARTS HERE

POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{
  "url": "amongus"
}
HTTP 201
[Asserts]
jsonpath "$.id" exists
jsonpath "$.url" == "amongus"
[Captures]
review_image_id: jsonpath "$.id"


DELETE {{url}}/api/review-images/{{review_image_id}}
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.message" == "Successfully deleted"


DELETE {{url}}/api/review-images/{{review_image_id}}
XSRF-Token: {{csrf_token}}
HTTP 404
[Asserts]
jsonpath "$.message" == "Review Image couldn't be found"


POST {{url}}/api/reviews/{{review_id}}/images
XSRF-Token: {{csrf_token}}
{
  "url": "amogus.txt"
}
HTTP 201
[Captures]
review_image_id: jsonpath "$.id"

DELETE {{url}}/api/session
XSRF-Token: {{csrf_token}}
HTTP 200


DELETE {{url}}/api/review-images/{{review_image_id}}
XSRF-Token: {{csrf_token}}
HTTP 401
[Asserts]
jsonpath "$.message" exists

POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "landowner@evil.inc",
  "password": "eggs-and-bacon"
}
HTTP 200


DELETE {{url}}/api/review-images/{{review_image_id}}
XSRF-Token: {{csrf_token}}
HTTP 403
[Asserts]
jsonpath "$.message" exists

