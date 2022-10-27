import { Injectable } from "@angular/core";
import { BehaviorSubject, of } from "rxjs";
import { take, map, tap, switchMap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

import { Place } from "./place.model";
import { AuthService } from "../auth/auth.service";
import { PlaceLocation } from "./location.model";

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

const projectApiUrl = "";
const projectImageUrl = ""



@Injectable({
  providedIn: "root",
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  fetchPlaces() {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.get<{ [key: string]: PlaceData }>(
          `${projectApiUrl}/offered-places.json?auth=${token}`
        );
      }),
      map((resData) => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId,
                resData[key].location
              )
            );
          }
        }
        return places;
      }),
      tap((places) => {
        this._places.next(places);
      })
    );
  }

  getPlace(id: string) {
    return this.authService.token.pipe(
      take(1), // only need one token
      switchMap((token) => {
        return this.http.get<PlaceData>(
          `${projectApiUrl}/offered-places/${id}.json?auth=${token}`
        );
      }),
      map((placeData) => {
        return new Place(
          id,
          placeData.title,
          placeData.description,
          placeData.imageUrl,
          placeData.price,
          new Date(placeData.availableFrom),
          new Date(placeData.availableTo),
          placeData.userId,
          placeData.location
        );
      })
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append("image", image);

    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.post<{ imageUrl: string; imagePath: string }>(
          `${projectImageUrl}/storeImage`,
          uploadData,
          { headers: { Authorization: "Bearer " + token } }
        );
      })
    );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date,
    location: PlaceLocation,
    imageUrl: string
  ) {
    let generatedId: string;
    let fetchedUserId: string;
    let newPlace: Place;
    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        if (!fetchedUserId) {
          throw new Error("No user found");
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          dateFrom,
          dateTo,
          fetchedUserId,
          location
        );
        // post newPlace data to Firebase but replace id with null
        return this.http.post<{ name: string }>(
          `${projectApiUrl}/offered-places.json?auth=${token}`,
          {
            ...newPlace,
            id: null,
          }
        );
      }),
      switchMap((resData) => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap((places) => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
    // look through array object and just take 1 item then cancel subscription
    // concat takes old array, adds new item then returns new array to be emitted using next()
    // return this._places.pipe(
    // 	take(1),
    // 	delay(1000),
    // 	tap(places => {
    // 		this._places.next(places.concat(newPlace));
    // 	})
    // );
  }

  // emits a new list of offers that includes the added place
  // logic ensures there is always a list of offers to work with.
  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[]; // initialise updated places variable
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        fetchedToken = token;
        return this.places;
      }),
      take(1), // take latest snapshot of list
      switchMap((places) => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces(); // returns updated array of places
        } else {
          return of(places); // of takes array and wraps it into a new observable that will emit a value right away
        }
      }),
      switchMap((places) => {
        const updatedPlaceIndex = places.findIndex((pl) => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(
          `${projectApiUrl}/offered-places/${placeId}.json?auth=${fetchedToken}`,
          { ...updatedPlaces[updatedPlaceIndex], id: null } // Data to be replaced, override id
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces); // emit new list of updated places
      })
    );
  }
}
