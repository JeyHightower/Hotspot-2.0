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


POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "demo@user.io",
  "password": "password1"
}
HTTP 200


POST {{url}}/api/spots/{{spot_id}}/bookings
XSRF-Token: {{csrf_token}}
{
  "startDate": "2020-10-10",
  "endDate": "2020-10-15"
}
HTTP 201
[Asserts]
jsonpath "$.id" exists
jsonpath "$.spotId" exists
jsonpath "$.userId" exists
jsonpath "$.startDate" == "2020-10-10"
jsonpath "$.endDate" == "2020-10-15"
jsonpath  "$.createdAt" exists
jsonpath  "$.updatedAt" exists


POST {{url}}/api/spots/{{spot_id}}/bookings
XSRF-Token: {{csrf_token}}
{
  "startDate": "2020-10-15",
  "endDate": "2020-10-16"
}
HTTP 403
[Asserts]
jsonpath "$.message" == "Sorry, this spot is already booked for the specified dates"
jsonpath "$.errors.startDate" == "Start date conflicts with an existing booking"
jsonpath "$.errors.endDate" not exists


POST {{url}}/api/spots/{{spot_id}}/bookings
XSRF-Token: {{csrf_token}}
{
  "startDate": "2020-10-02",
  "endDate": "2020-10-10"
}
HTTP 403
[Asserts]
jsonpath "$.message" == "Sorry, this spot is already booked for the specified dates"
jsonpath "$.errors.endDate" == "End date conflicts with an existing booking"
jsonpath "$.errors.startDate" not exists


POST {{url}}/api/spots/{{spot_id}}/bookings
XSRF-Token: {{csrf_token}}
{
  "startDate": "2020-10-11",
  "endDate": "2020-10-13"
}
HTTP 403
[Asserts]
jsonpath "$.message" == "Sorry, this spot is already booked for the specified dates"
jsonpath "$.errors.endDate" == "End date conflicts with an existing booking"
jsonpath "$.errors.startDate" == "Start date conflicts with an existing booking"


POST {{url}}/api/spots/{{spot_id}}/bookings
XSRF-Token: {{csrf_token}}
{
  "startDate": "2020-10-20",
  "endDate": "2020-10-20"
}
HTTP 400
[Asserts]
jsonpath "$.message" == "Bad Request"
jsonpath "$.errors.endDate" == "endDate cannot be on or before startDate"


POST {{url}}/api/spots/{{spot_id}}/bookings
XSRF-Token: {{csrf_token}}
{
  "startDate": "2020-10-20",
  "endDate": "2020-10-19"
}
HTTP 400
[Asserts]
jsonpath "$.message" == "Bad Request"
jsonpath "$.errors.endDate" == "endDate cannot be on or before startDate"




POST {{url}}/api/spots/sdfddsfg/bookings
XSRF-Token: {{csrf_token}}
{
  "startDate": "2020-10-20",
  "endDate": "2020-10-21"
}
HTTP 404
[Asserts]
jsonpath "$.message" == "Spot couldn't be found"



# GET current user bookings
GET {{url}}/api/bookings/current
HTTP 200
[Asserts]
jsonpath "$.Bookings" exists
jsonpath "$.Bookings[*].id" exists 
jsonpath "$.Bookings[*].spotId" exists 
jsonpath "$.Bookings[*].Spot" exists 
jsonpath "$.Bookings[*].Spot.id" exists 
jsonpath "$.Bookings[*].Spot.ownerId" exists 
jsonpath "$.Bookings[*].Spot.address" exists 
jsonpath "$.Bookings[*].Spot.city" exists 
jsonpath "$.Bookings[*].Spot.state" exists 
jsonpath "$.Bookings[*].Spot.country" exists 
jsonpath "$.Bookings[*].Spot.lat" exists 
jsonpath "$.Bookings[*].Spot.lng" exists 
jsonpath "$.Bookings[*].Spot.name" exists 
jsonpath "$.Bookings[*].Spot.price" exists 
jsonpath "$.Bookings[*].Spot.previewImage" exists 
jsonpath "$.Bookings[*].userId" exists 
jsonpath "$.Bookings[*].startDate" exists 
jsonpath "$.Bookings[*].endDate" exists 
jsonpath "$.Bookings[*].createdAt" exists 
jsonpath "$.Bookings[*].updatedAt" exists 



POST {{url}}/api/session
XSRF-Token: {{csrf_token}}
{
  "credential": "landowner@evil.inc",
  "password": "eggs-and-bacon"
}
HTTP 200

POST {{url}}/api/spots/{{spot_id}}/bookings
XSRF-Token: {{csrf_token}}
{
  "startDate": "2021-10-10",
  "endDate": "2021-10-15"
}
HTTP 403

