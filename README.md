# Ionic Angular Mini Project Realised by Foued rekik & Néji Said CII3 GLSI-B

* App to create home locations adds and managing them. It enables property listings and allow us to make bookings and update property details. 
We used a udemy course as a reference to add more functionalities to the app for a better mark.
Setting up firebase connection was a hell of a task so we implimented a code from an other project and tried to use google map API as a bonus


* App to view and book places to stay. All places are listed on the 'discover.page' and clicking on an item navigates to a place detail page using the place id in the browser.
* Places are displayed under 2 list options: 'ALL PLACES' and 'BOOKABLE PLACES'. The first place is displayed using an ion-card, the remaining places are displayed using a list with a thumbnail image. There is code to prevent the user from being able to book their own places, using a userId matching function to show/hide the booking button.
* Places can be booked, listed and cancelled.
* New places can be added as 'Offers'. The location of the new place is chosen using the Google Maps API and is displayed in the template using data-binding. A photo can be taken to add to the new Place description. If there is no camera then there is a file upload button to save a jpeg image.
* Burger side panel added with links to the discover places listings, your bookings and a logout button.
* Bottom menu with 2 links to 'Discover' (default page upon loading) and 'Offers' that lists all the places available.