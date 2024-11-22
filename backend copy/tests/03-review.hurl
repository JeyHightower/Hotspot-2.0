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



GET {{url}}/api/reviews/current
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.Reviews" exists
jsonpath "$.Reviews[0].Spot" exists
jsonpath "$.Reviews[0].Spot.id" exists
jsonpath "$.Reviews[0].User" exists
jsonpath "$.Reviews[0].User.id" exists
jsonpath "$.Reviews[0].User.firstName" exists
jsonpath "$.Reviews[0].User.lastName" exists
jsonpath "$.Reviews[0].ReviewImages" exists
jsonpath "$.Reviews[0].userId" exists
jsonpath "$.Reviews[0].spotId" exists
jsonpath "$.Reviews[0].review" exists
jsonpath "$.Reviews[0].stars" exists
jsonpath "$.Reviews[0].createdAt" exists
jsonpath "$.Reviews[0].updatedAt" exists
jsonpath "$.Reviews[0].id" exists



POST {{url}}/api/spots/{{spot_id}}/reviews
XSRF-Token: {{csrf_token}}
{
  "review": "This place is great please come by and give me mone- the owners some money for this amazing place",
  "stars": 5
}
HTTP 500
[Asserts]
jsonpath "$.message" == "User already has a review for this spot"


POST {{url}}/api/spots/{{spot_id}}/reviews
XSRF-Token: {{csrf_token}}
{
  "stars": 5
}
HTTP 400
[Asserts]
jsonpath "$.message" exists
jsonpath "$.errors" exists

POST {{url}}/api/spots/null/reviews
XSRF-Token: {{csrf_token}}
{
  "review": "amogu",
  "stars": 5
}
HTTP 404
[Asserts]
jsonpath "$.message" exists






GET {{url}}/api/spots/{{spot_id}}/reviews
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.Reviews" exists
jsonpath "$.Reviews[0].User" exists
jsonpath "$.Reviews[0].User.id" exists
jsonpath "$.Reviews[0].User.firstName" exists
jsonpath "$.Reviews[0].User.lastName" exists
jsonpath "$.Reviews[0].ReviewImages" exists
jsonpath "$.Reviews[0].userId" exists
jsonpath "$.Reviews[0].spotId" exists
jsonpath "$.Reviews[0].review" ==  "This place is awesome please come by and give me mone- the owners some money for this amazing place"
jsonpath "$.Reviews[0].stars" == 5
jsonpath "$.Reviews[0].createdAt" exists
jsonpath "$.Reviews[0].updatedAt" exists
jsonpath "$.Reviews[0].id" == {{review_id}}



GET {{url}}/api/spots/FooSpot/reviews
XSRF-Token: {{csrf_token}}
HTTP 404
[Asserts]
jsonpath "$.message" == "Spot couldn't be found"
