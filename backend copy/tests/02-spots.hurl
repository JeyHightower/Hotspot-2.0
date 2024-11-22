# CSRF
GET {{url}}/api/csrf/restore
HTTP 200
[Captures]
csrf_token: jsonpath "$['XSRF-Token']"


GET {{url}}/api/spots
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.Spots" exists
jsonpath "$.Spots[0].name" exists
jsonpath "$.Spots[0].id" exists
jsonpath "$.Spots[0].ownerId" exists
jsonpath "$.Spots[0].address" exists
jsonpath "$.Spots[0].city" exists
jsonpath "$.Spots[0].state" exists
jsonpath "$.Spots[0].country" exists
jsonpath "$.Spots[0].lat" exists
jsonpath "$.Spots[0].lng" exists
jsonpath "$.Spots[0].description" exists
jsonpath "$.Spots[0].price" exists
jsonpath "$.Spots[0].createdAt" exists
jsonpath "$.Spots[0].updatedAt" exists
jsonpath "$.Spots[0].avgRating" exists
jsonpath "$.Spots[0].previewImage" exists


POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "landowner@evil.inc",
  "password": "eggs-and-bacon"
}
HTTP 200


GET {{url}}/api/spots/current
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.Spots" exists
jsonpath "$.Spots[0].name" contains "Cabin"
jsonpath "$.Spots[0].id" exists
jsonpath "$.Spots[0].ownerId" exists
jsonpath "$.Spots[0].address" exists
jsonpath "$.Spots[0].city" exists
jsonpath "$.Spots[0].state" exists
jsonpath "$.Spots[0].country" exists
jsonpath "$.Spots[0].lat" exists
jsonpath "$.Spots[0].lng" exists
jsonpath "$.Spots[0].description" exists
jsonpath "$.Spots[0].price" exists
jsonpath "$.Spots[0].createdAt" exists
jsonpath "$.Spots[0].updatedAt" exists
jsonpath "$.Spots[0].avgRating" exists
jsonpath "$.Spots[0].previewImage" exists



POST {{url}}/api/spots
XSRF-Token: {{csrf_token}}
{
  "address": "123 Disney Lane",
  "city": "San Francisco",
  "state": "California",
  "country": "United States of America",
  "lat": 37.7645358,
  "lng": -122.4730327,
  "name": "App Academy",
  "description": "Place where web developers are created",
  "price": 123
}
HTTP 201
[Captures]
spot_id: jsonpath "$.id"

POST {{url}}/api/spots
XSRF-Token: {{csrf_token}}
{
  "address": "123 Disney Lane",
  "country": "United States of America",
  "lat": 37.7645358,
  "lng": -122.4730327,
  "name": "App Academy",
  "description": "Place where web developers are created",
  "price": 123
}
HTTP 400
[Asserts]
jsonpath "$.message" == "Bad Request"
jsonpath "$.errors" exists


POST {{url}}/api/spots/{{spot_id}}/images
XSRF-Token: {{csrf_token}}
{
  "url": "https://fooimage.foo/image.png",
  "preview": true
}
HTTP 201
[Asserts]
jsonpath "$.id" exists

POST {{url}}/api/spots/amongus/images
XSRF-Token: {{csrf_token}}
{
  "url": "https://fooimage.foo/image.png",
  "preview": true
}
HTTP 404
[Asserts]
jsonpath "$.message" exists

POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "demo@user.io",
  "password": "password1"
}
HTTP 200


POST {{url}}/api/spots/{{spot_id}}/images
XSRF-Token: {{csrf_token}}
{
  "url": "https://fooimage.foo/image.png",
  "preview": true
}
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

PUT {{url}}/api/spots/{{spot_id}}
XSRF-Token: {{csrf_token}}
{
  "address": "123 Disney Lane",
  "city": "San Francisco",
  "state": "California",
  "country": "United States of America",
  "lat": 37.7645358,
  "lng": -122.4730327,
  "name": "App Academy",
  "description": "Place where web developers are created",
  "price": 123
}
HTTP 200
[Asserts]
jsonpath "$.name" exists
jsonpath "$.id" exists
jsonpath "$.ownerId" exists
jsonpath "$.address" exists
jsonpath "$.city" exists
jsonpath "$.state" exists
jsonpath "$.country" exists
jsonpath "$.lat" exists
jsonpath "$.lng" exists
jsonpath "$.description" exists
jsonpath "$.price" exists
jsonpath "$.createdAt" exists
jsonpath "$..updatedAt" exists
jsonpath "$.id" == {{spot_id}}

PUT {{url}}/api/spots/{{spot_id}}
XSRF-Token: {{csrf_token}}
{
  "address": "123 Disney Lane",
  "state": "California",
  "country": "United States of America",
  "lat": 37.7645358,
  "lng": -122.4730327,
  "name": "App Academy",
  "description": "Place where web developers are created",
  "price": 123
}
HTTP 400
[Asserts]
jsonpath "$.message" exists


POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "demo@user.io",
  "password": "password1"
}
HTTP 200

PUT {{url}}/api/spots/{{spot_id}}
XSRF-Token: {{csrf_token}}
{
  "address": "123 Disney Lane",
  "city": "San Francisco",
  "state": "California",
  "country": "United States of America",
  "lat": 37.7645358,
  "lng": -122.4730327,
  "name": "App Academy",
  "description": "Place where web developers are created",
  "price": 123
}
HTTP 403
[Asserts]
jsonpath "$.message" exists


PUT {{url}}/api/spots/null
XSRF-Token: {{csrf_token}}
{
  "address": "123 Disney Lane",
  "city": "San Francisco",
  "state": "California",
  "country": "United States of America",
  "lat": 37.7645358,
  "lng": -122.4730327,
  "name": "App Academy",
  "description": "Place where web developers are created",
  "price": 123
}
HTTP 404
[Asserts]
jsonpath "$.message" exists



DELETE {{url}}/api/spots/{{spot_id}}
XSRF-Token: {{csrf_token}}
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


DELETE {{url}}/api/spots/{{spot_id}}
XSRF-Token: {{csrf_token}}
HTTP 200
[Asserts]
jsonpath "$.message" exists

DELETE {{url}}/api/spots/{{spot_id}}
XSRF-Token: {{csrf_token}}
HTTP 404
[Asserts]
jsonpath "$.message" exists


